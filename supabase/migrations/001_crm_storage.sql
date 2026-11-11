-- 001_crm_storage.sql
--
-- The speaking CRM's first tables. Three of them:
--
--   leads        one row per PERSON, keyed on their email address
--   inquiries    one row per FORM SUBMISSION, keyed on the id the browser
--                generated for it, so a double click or a retry is one row
--   lead_events  the append-only timeline of what happened, and who did it
--
-- WHO CAN REACH THESE. Only the website's server, using the project's secret
-- key. Row-level security is on, the only policy on each table refuses
-- everything, and the two browser-facing roles have no privileges at all. The
-- two functions below are closed to those roles as well: a function in the
-- `public` schema is callable through the API by default, which would have
-- made `crm_record_inquiry` a way to write leads from any browser.
--
-- This file holds structure only. No lead data, no keys, no addresses: the
-- repository is public.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  email text not null,
  -- The identity of a lead. Generated, so "Dana@Example.com " and
  -- "dana@example.com" can never become two people.
  email_key text generated always as (lower(btrim(email))) stored,
  name text not null default '',
  organization text not null default '',

  -- Where the lead stands. The allowed values are added with the screens that
  -- change it; until then every lead is an 'inquiry'.
  stage text not null default 'inquiry',

  -- The private half of this lead's reply address (r-<token>@reply.…). Made
  -- at creation so no lead ever needs one backfilled.
  reply_token text not null default replace(gen_random_uuid()::text, '-', ''),

  do_not_email_reason text,
  do_not_email_at timestamptz,

  -- True for a lead that only ever came from testing. Kept out of reports.
  is_test boolean not null default false,

  constraint leads_email_key_unique unique (email_key),
  constraint leads_reply_token_unique unique (reply_token),
  constraint leads_do_not_email_reason_check check (
    do_not_email_reason is null
    or do_not_email_reason in ('opt_out', 'bounce', 'complaint', 'manual')
  )
);

comment on table public.leads is
  'Speaking CRM: one row per person who has inquired. Server-only.';

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,

  -- Generated in the browser when the form is first sent, and reused on every
  -- retry of that same form. It is what makes a retry one inquiry.
  submission_id uuid not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  form text not null default 'contact',
  environment text not null default 'production',
  is_test boolean not null default false,

  -- As typed on THIS submission. The lead row holds the current values.
  name text not null default '',
  email text not null,
  organization text not null default '',
  message text not null default '',

  event_name text,
  event_date text,
  location text,
  audience_size text,
  format text,

  -- Today's forms send a budget band. The new form sends one of four answers.
  budget_band text,
  budget_answer text,

  -- Where this submission came from. The lead's first touch is its earliest
  -- inquiry, so nothing is copied onto the lead.
  source text,
  landing_page text,
  gclid text,
  wbraid text,
  gbraid text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,

  -- The two emails the form sends. An inquiry that was saved but never
  -- notified is the one case where the record knows something the inbox
  -- does not.
  notified_at timestamptz,
  notify_error text,
  ack_sent_at timestamptz,
  ack_error text,

  constraint inquiries_submission_unique unique (submission_id)
);

comment on table public.inquiries is
  'Speaking CRM: one row per form submission. Server-only.';

create index inquiries_lead_created_idx
  on public.inquiries (lead_id, created_at desc);

create table public.lead_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads (id) on delete cascade,
  inquiry_id uuid references public.inquiries (id) on delete cascade,
  at timestamptz not null default now(),
  kind text not null,
  actor text not null default 'system',
  detail jsonb not null default '{}'::jsonb,

  constraint lead_events_actor_check check (actor in ('system', 'steve'))
);

comment on table public.lead_events is
  'Speaking CRM: append-only timeline for each lead. Server-only.';

create index lead_events_lead_at_idx
  on public.lead_events (lead_id, at desc);

-- ---------------------------------------------------------------------------
-- Housekeeping triggers
-- ---------------------------------------------------------------------------

create function public.crm_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.crm_touch_updated_at();

create trigger inquiries_touch_updated_at
  before update on public.inquiries
  for each row execute function public.crm_touch_updated_at();

-- The timeline is the proof behind every "we stopped emailing because…".
-- A row may be added, and it goes when its lead is deleted, but it is never
-- rewritten.
create function public.crm_lead_events_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'lead_events is append-only: rows are added, never changed';
end;
$$;

create trigger lead_events_no_update
  before update on public.lead_events
  for each row execute function public.crm_lead_events_append_only();

-- ---------------------------------------------------------------------------
-- Access: the website's server and nobody else
-- ---------------------------------------------------------------------------

alter table public.leads enable row level security;
alter table public.inquiries enable row level security;
alter table public.lead_events enable row level security;

create policy "No access from the browser" on public.leads
  for all to anon, authenticated using (false) with check (false);
create policy "No access from the browser" on public.inquiries
  for all to anon, authenticated using (false) with check (false);
create policy "No access from the browser" on public.lead_events
  for all to anon, authenticated using (false) with check (false);

revoke all on table public.leads, public.inquiries, public.lead_events
  from anon, authenticated;
grant select, insert, update, delete
  on table public.leads, public.inquiries, public.lead_events
  to service_role;

revoke all on sequence public.lead_events_id_seq from anon, authenticated;
grant usage, select on sequence public.lead_events_id_seq to service_role;

-- ---------------------------------------------------------------------------
-- crm_record_inquiry: save one form submission, in one transaction
-- ---------------------------------------------------------------------------
--
-- Finds or creates the person, then finds or creates the submission. Sending
-- the same submission twice changes nothing but its contents; it never makes
-- a second lead or a second inquiry.
--
-- A test submission never renames a real lead and never turns one into a
-- test. A real submission from an address that had only been used for
-- testing makes that lead real.

create function public.crm_record_inquiry(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_email text := btrim(coalesce(p ->> 'email', ''));
  v_submission uuid := (p ->> 'submission_id')::uuid;
  v_is_test boolean := coalesce((p ->> 'is_test')::boolean, false);
  v_name text := btrim(coalesce(p ->> 'name', ''));
  v_organization text := btrim(coalesce(p ->> 'organization', ''));
  v_lead_id uuid;
  v_new_lead boolean;
  v_old_lead_id uuid;
  v_inquiry_id uuid;
  v_new_inquiry boolean;
begin
  if v_email = '' then
    raise exception 'crm_record_inquiry: email is required';
  end if;
  if v_submission is null then
    raise exception 'crm_record_inquiry: submission_id is required';
  end if;

  insert into public.leads as l (email, name, organization, is_test)
  values (v_email, v_name, v_organization, v_is_test)
  on conflict (email_key) do update
    set name = case
          when excluded.is_test and not l.is_test then l.name
          when excluded.name <> '' then excluded.name
          else l.name
        end,
        organization = case
          when excluded.is_test and not l.is_test then l.organization
          when excluded.organization <> '' then excluded.organization
          else l.organization
        end,
        is_test = l.is_test and excluded.is_test
  returning l.id, (l.xmax = 0) into v_lead_id, v_new_lead;

  select i.lead_id into v_old_lead_id
  from public.inquiries i
  where i.submission_id = v_submission;

  insert into public.inquiries as i (
    lead_id, submission_id, form, environment, is_test,
    name, email, organization, message,
    event_name, event_date, location, audience_size, format,
    budget_band, budget_answer,
    source, landing_page, gclid, wbraid, gbraid,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer
  )
  values (
    v_lead_id, v_submission,
    coalesce(nullif(p ->> 'form', ''), 'contact'),
    coalesce(nullif(p ->> 'environment', ''), 'production'),
    v_is_test,
    v_name, v_email, v_organization, coalesce(p ->> 'message', ''),
    nullif(p ->> 'event_name', ''), nullif(p ->> 'event_date', ''),
    nullif(p ->> 'location', ''), nullif(p ->> 'audience_size', ''),
    nullif(p ->> 'format', ''),
    nullif(p ->> 'budget_band', ''), nullif(p ->> 'budget_answer', ''),
    nullif(p ->> 'source', ''), nullif(p ->> 'landing_page', ''),
    nullif(p ->> 'gclid', ''), nullif(p ->> 'wbraid', ''), nullif(p ->> 'gbraid', ''),
    nullif(p ->> 'utm_source', ''), nullif(p ->> 'utm_medium', ''),
    nullif(p ->> 'utm_campaign', ''), nullif(p ->> 'utm_term', ''),
    nullif(p ->> 'utm_content', ''), nullif(p ->> 'referrer', '')
  )
  on conflict (submission_id) do update
    set lead_id = excluded.lead_id,
        form = excluded.form,
        environment = excluded.environment,
        is_test = excluded.is_test,
        name = excluded.name,
        email = excluded.email,
        organization = excluded.organization,
        message = excluded.message,
        event_name = excluded.event_name,
        event_date = excluded.event_date,
        location = excluded.location,
        audience_size = excluded.audience_size,
        format = excluded.format,
        budget_band = excluded.budget_band,
        budget_answer = excluded.budget_answer,
        source = excluded.source,
        landing_page = excluded.landing_page,
        gclid = excluded.gclid,
        wbraid = excluded.wbraid,
        gbraid = excluded.gbraid,
        utm_source = excluded.utm_source,
        utm_medium = excluded.utm_medium,
        utm_campaign = excluded.utm_campaign,
        utm_term = excluded.utm_term,
        utm_content = excluded.utm_content,
        referrer = excluded.referrer
  returning i.id, (i.xmax = 0) into v_inquiry_id, v_new_inquiry;

  if v_new_inquiry then
    insert into public.lead_events (lead_id, inquiry_id, kind, detail)
    values (
      v_lead_id, v_inquiry_id, 'inquiry_received',
      jsonb_build_object(
        'form', coalesce(nullif(p ->> 'form', ''), 'contact'),
        'new_lead', v_new_lead
      )
    );
  elsif v_old_lead_id is distinct from v_lead_id then
    -- The same submission came back with a different email address: the
    -- organizer corrected a typo after an error. The inquiry now belongs to
    -- the corrected person, and a lead left with nothing is removed rather
    -- than kept as a stranger nobody inquired as.
    insert into public.lead_events (lead_id, inquiry_id, kind, detail)
    values (v_lead_id, v_inquiry_id, 'inquiry_received',
            jsonb_build_object('corrected_email', true, 'new_lead', v_new_lead));

    delete from public.leads l
    where l.id = v_old_lead_id
      and not exists (select 1 from public.inquiries i where i.lead_id = l.id);
  end if;

  return jsonb_build_object(
    'lead_id', v_lead_id,
    'inquiry_id', v_inquiry_id,
    'new_lead', v_new_lead,
    'new_inquiry', v_new_inquiry
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- crm_note_inquiry_email: record what happened to one of the form's emails
-- ---------------------------------------------------------------------------
--
-- p_kind is 'notify' (the inquiry email to Steve) or 'ack' (the instant reply
-- to the organizer). A success is recorded once: sending the same submission
-- again does not add a second "sent" to the timeline.

create function public.crm_note_inquiry_email(
  p_inquiry_id uuid,
  p_kind text,
  p_ok boolean,
  p_detail jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lead_id uuid;
  v_first boolean := false;
  v_error text := left(coalesce(p_detail ->> 'error', 'unknown error'), 500);
begin
  if p_kind not in ('notify', 'ack') then
    raise exception 'crm_note_inquiry_email: kind must be notify or ack';
  end if;

  select i.lead_id into v_lead_id from public.inquiries i where i.id = p_inquiry_id;
  if v_lead_id is null then
    return false;
  end if;

  if p_ok then
    if p_kind = 'notify' then
      update public.inquiries
        set notified_at = now(), notify_error = null
        where id = p_inquiry_id and notified_at is null;
    else
      update public.inquiries
        set ack_sent_at = now(), ack_error = null
        where id = p_inquiry_id and ack_sent_at is null;
    end if;
    v_first := found;
    if v_first then
      insert into public.lead_events (lead_id, inquiry_id, kind, detail)
      values (v_lead_id, p_inquiry_id, p_kind || '_sent', coalesce(p_detail, '{}'::jsonb));
    end if;
  else
    if p_kind = 'notify' then
      update public.inquiries set notify_error = v_error where id = p_inquiry_id;
    else
      update public.inquiries set ack_error = v_error where id = p_inquiry_id;
    end if;
    insert into public.lead_events (lead_id, inquiry_id, kind, detail)
    values (v_lead_id, p_inquiry_id, p_kind || '_failed', jsonb_build_object('error', v_error));
  end if;

  return true;
end;
$$;

revoke execute on function public.crm_record_inquiry(jsonb)
  from public, anon, authenticated;
revoke execute on function public.crm_note_inquiry_email(uuid, text, boolean, jsonb)
  from public, anon, authenticated;
revoke execute on function public.crm_touch_updated_at()
  from public, anon, authenticated;
revoke execute on function public.crm_lead_events_append_only()
  from public, anon, authenticated;

grant execute on function public.crm_record_inquiry(jsonb) to service_role;
grant execute on function public.crm_note_inquiry_email(uuid, text, boolean, jsonb) to service_role;
