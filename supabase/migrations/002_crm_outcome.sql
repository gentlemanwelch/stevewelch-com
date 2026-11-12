-- 002_crm_outcome.sql
--
-- What happens to a lead after the inquiry: where it stands, what the call
-- produced, what is next, and what the engagement is worth. Plus the two
-- numbers typed in from Google Ads each week.
--
--   leads        gains its stage rules, how far it ever got, why it closed,
--                whether it was qualified, the next step, the fee, the notes
--   ad_weeks     one row each time the ad numbers are typed in
--
-- THE RULE THIS FILE EXISTS TO KEEP: a form fill is never counted as a booked
-- call, and a booked call is never counted as an engagement. A lead moves
-- forward only when the owner says so, one fact at a time, and every move is
-- written to the timeline in the same transaction as the change itself.
--
-- `stage` is where the lead is NOW. `reached` is the furthest it has got.
-- They differ in two cases only: a closed lead remembers how far it went, and
-- a no-show goes back to being an inquiry without forgetting that a call was
-- booked. Choosing a stage by hand sets both, so a wrong press is corrected by
-- choosing the right one.
--
-- Structure only. No lead data, no keys, no addresses: the repository is
-- public.

alter table public.leads
  add column reached text not null default 'inquiry',
  add column closed_reason text,
  add column closed_at timestamptz,
  -- null until the owner answers "was it a qualified opportunity?"
  add column qualified boolean,
  add column next_step text,
  add column next_step_due date,
  add column fee_cents bigint,
  add column notes text;

alter table public.leads
  add constraint leads_stage_check check (
    stage in ('inquiry', 'call_booked', 'call_held', 'proposal_sent', 'contract_out', 'booked', 'closed')
  ),
  add constraint leads_reached_check check (
    reached in ('inquiry', 'call_booked', 'call_held', 'proposal_sent', 'contract_out', 'booked')
  ),
  add constraint leads_closed_reason_check check (
    closed_reason is null or closed_reason in ('below_floor', 'not_a_fit', 'lost')
  ),
  -- Closed means closed for a reason, at a time. Never one without the others.
  add constraint leads_closed_consistent check (
    (stage = 'closed') = (closed_reason is not null)
    and (stage = 'closed') = (closed_at is not null)
  ),
  add constraint leads_fee_check check (fee_cents is null or fee_cents >= 0);

-- ---------------------------------------------------------------------------
-- ad_weeks: what the owner types in from Google Ads
-- ---------------------------------------------------------------------------
--
-- Each row is the whole picture as of the moment it was typed: the first day
-- of the campaign, spend to date, clicks to date. The newest row is the
-- current one; the older rows are the history.

create table public.ad_weeks (
  id bigint generated always as identity primary key,
  entered_at timestamptz not null default now(),
  campaign_started_on date,
  spend_cents bigint,
  clicks integer,

  constraint ad_weeks_spend_check check (spend_cents is null or spend_cents >= 0),
  constraint ad_weeks_clicks_check check (clicks is null or clicks >= 0)
);

comment on table public.ad_weeks is
  'Speaking CRM: ad spend and clicks, typed in by hand. Server-only.';

alter table public.ad_weeks enable row level security;

create policy "No access from the browser" on public.ad_weeks
  for all to anon, authenticated using (false) with check (false);

revoke all on table public.ad_weeks from anon, authenticated;
grant select, insert on table public.ad_weeks to service_role;

revoke all on sequence public.ad_weeks_id_seq from anon, authenticated;
grant usage, select on sequence public.ad_weeks_id_seq to service_role;

-- ---------------------------------------------------------------------------
-- crm_stage_rank: the order of the open stages
-- ---------------------------------------------------------------------------
--
-- Null for anything that is not an open stage, 'closed' included.

create function public.crm_stage_rank(p_stage text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_stage
    when 'inquiry' then 0
    when 'call_booked' then 1
    when 'call_held' then 2
    when 'proposal_sent' then 3
    when 'contract_out' then 4
    when 'booked' then 5
  end;
$$;

-- ---------------------------------------------------------------------------
-- crm_lead_action: one thing the owner did to a lead, in one transaction
-- ---------------------------------------------------------------------------
--
-- p_action is one of:
--
--   'stage'      p_args.stage is an open stage, or 'lost', 'not_a_fit',
--                'below_floor' to close the lead for that reason
--   'call_held'  the call happened
--   'no_show'    the booked call did not happen
--   'qualified'  it was a qualified opportunity
--   'not_a_fit'  it was not: the lead is closed
--   'details'    any of p_args.next_step, .due, .fee_cents, .notes. Only the
--                keys present are changed.
--
-- Doing the same thing twice changes nothing and adds nothing to the
-- timeline. Answers { ok, changed } and, when ok is false, a reason.

create function public.crm_lead_action(
  p_lead_id uuid,
  p_action text,
  p_args jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  l public.leads%rowtype;
  v_args jsonb := coalesce(p_args, '{}'::jsonb);
  v_to text;
  v_stage text;
  v_reached text;
  v_reason text;
  v_closed_at timestamptz;
  v_qualified boolean;
  v_kind text;
  v_detail jsonb := '{}'::jsonb;
  v_last_kind text;
  v_next text;
  v_due date;
  v_fee bigint;
  v_notes text;
  v_changed boolean := false;
begin
  select * into l from public.leads where id = p_lead_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_such_lead');
  end if;

  -- The next step, the fee and the notes: not a stage change at all.
  if p_action = 'details' then
    v_next := case when v_args ? 'next_step'
      then nullif(left(btrim(coalesce(v_args ->> 'next_step', '')), 200), '')
      else l.next_step end;
    v_due := case when v_args ? 'due'
      then nullif(v_args ->> 'due', '')::date
      else l.next_step_due end;
    v_fee := case when v_args ? 'fee_cents'
      then (v_args ->> 'fee_cents')::bigint
      else l.fee_cents end;
    v_notes := case when v_args ? 'notes'
      then nullif(left(btrim(coalesce(v_args ->> 'notes', '')), 5000), '')
      else l.notes end;

    if v_next is distinct from l.next_step or v_due is distinct from l.next_step_due then
      insert into public.lead_events (lead_id, kind, actor, detail)
      values (l.id, 'next_step_set', 'steve',
              jsonb_build_object('next_step', v_next, 'due', v_due));
      v_changed := true;
    end if;
    if v_fee is distinct from l.fee_cents then
      insert into public.lead_events (lead_id, kind, actor, detail)
      values (l.id, 'fee_set', 'steve', jsonb_build_object('fee_cents', v_fee));
      v_changed := true;
    end if;
    if v_notes is distinct from l.notes then
      -- The notes themselves stay on the lead. The timeline says only that
      -- they were saved.
      insert into public.lead_events (lead_id, kind, actor, detail)
      values (l.id, 'notes_saved', 'steve', '{}'::jsonb);
      v_changed := true;
    end if;

    if v_changed then
      update public.leads
        set next_step = v_next, next_step_due = v_due, fee_cents = v_fee, notes = v_notes
        where id = l.id;
    end if;
    return jsonb_build_object('ok', true, 'changed', v_changed);
  end if;

  v_stage := l.stage;
  v_reached := l.reached;
  v_reason := l.closed_reason;
  v_closed_at := l.closed_at;
  v_qualified := l.qualified;

  if p_action = 'stage' then
    v_to := v_args ->> 'stage';
    if v_to = l.stage then
      -- The menu was sent back as it was.
      return jsonb_build_object('ok', true, 'changed', false);
    elsif v_to in ('lost', 'not_a_fit', 'below_floor') then
      v_stage := 'closed';
      v_reason := v_to;
      v_closed_at := coalesce(l.closed_at, now());
      if v_to = 'not_a_fit' then
        v_qualified := false;
      end if;
    elsif public.crm_stage_rank(v_to) is not null then
      -- Chosen by hand: the lead is exactly here, whether that moves it
      -- forward or corrects a wrong press.
      v_stage := v_to;
      v_reached := v_to;
      v_reason := null;
      v_closed_at := null;
      if l.closed_reason = 'not_a_fit' then
        v_qualified := null;
      end if;
    else
      return jsonb_build_object('ok', false, 'reason', 'bad_stage');
    end if;
    v_kind := 'stage_changed';
    v_detail := jsonb_build_object('from', coalesce(l.closed_reason, l.stage), 'to', v_to);

  elsif p_action = 'call_held' then
    if public.crm_stage_rank(v_reached) < 2 then
      v_reached := 'call_held';
    end if;
    if v_stage <> 'closed' and public.crm_stage_rank(v_stage) < 2 then
      v_stage := 'call_held';
    end if;
    v_kind := 'call_held';

  elsif p_action = 'no_show' then
    -- Only a lead that is waiting for a call, or was wrongly marked as having
    -- had one, can be a no-show.
    if l.stage not in ('inquiry', 'call_booked', 'call_held') then
      return jsonb_build_object('ok', true, 'changed', false, 'reason', 'not_applicable');
    end if;
    select e.kind into v_last_kind
      from public.lead_events e
      where e.lead_id = l.id
      order by e.at desc, e.id desc
      limit 1;
    if l.stage = 'inquiry' and v_last_kind = 'no_show' then
      -- Pressed twice.
      return jsonb_build_object('ok', true, 'changed', false);
    end if;
    if l.stage = 'call_held' and l.reached = 'call_held' then
      -- "Call held" was the wrong press: the call was booked and not held.
      v_reached := 'call_booked';
    elsif public.crm_stage_rank(l.reached) < 1 then
      v_reached := 'call_booked';
    end if;
    v_stage := 'inquiry';
    v_kind := 'no_show';
    v_changed := true;

  elsif p_action = 'qualified' then
    v_qualified := true;
    if l.stage = 'closed' and l.closed_reason = 'not_a_fit' then
      -- A change of mind: it comes back to where it had got to.
      v_stage := l.reached;
      v_reason := null;
      v_closed_at := null;
    end if;
    v_kind := 'qualified';

  elsif p_action = 'not_a_fit' then
    v_qualified := false;
    v_stage := 'closed';
    v_reason := 'not_a_fit';
    v_closed_at := coalesce(l.closed_at, now());
    v_kind := 'not_a_fit';

  else
    return jsonb_build_object('ok', false, 'reason', 'bad_action');
  end if;

  if not v_changed
     and v_stage = l.stage
     and v_reached = l.reached
     and v_reason is not distinct from l.closed_reason
     and v_qualified is not distinct from l.qualified then
    return jsonb_build_object('ok', true, 'changed', false);
  end if;

  update public.leads
    set stage = v_stage,
        reached = v_reached,
        closed_reason = v_reason,
        closed_at = v_closed_at,
        qualified = v_qualified
    where id = l.id;

  insert into public.lead_events (lead_id, kind, actor, detail)
  values (l.id, v_kind, 'steve', v_detail);

  return jsonb_build_object('ok', true, 'changed', true, 'stage', v_stage);
end;
$$;

-- ---------------------------------------------------------------------------
-- A closed lead who inquires again is open again
-- ---------------------------------------------------------------------------
--
-- Without this, someone turned away in March who writes back in September
-- would be saved, emailed to the owner, and missing from the pipeline.
--
-- A test never reopens a real lead, for the same reason a test never renames
-- one. The event is stamped with the clock rather than the transaction's
-- start, so the timeline reads "inquiry received", then "reopened".

create function public.crm_reopen_on_inquiry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.leads l
    set stage = 'inquiry',
        qualified = case when l.closed_reason = 'not_a_fit' then null else l.qualified end,
        closed_reason = null,
        closed_at = null
    where l.id = new.lead_id
      and l.stage = 'closed'
      and (l.is_test or not new.is_test);
  if found then
    insert into public.lead_events (lead_id, inquiry_id, at, kind, detail)
    values (new.lead_id, new.id, clock_timestamp(), 'reopened',
            jsonb_build_object('because', 'new_inquiry'));
  end if;
  return null;
end;
$$;

create trigger inquiries_reopen_lead
  after insert on public.inquiries
  for each row execute function public.crm_reopen_on_inquiry();

-- ---------------------------------------------------------------------------
-- crm_save_ad_numbers: the weekly numbers from Google Ads
-- ---------------------------------------------------------------------------
--
-- Any of p.campaign_started_on, p.spend_cents, p.clicks. A key that is absent
-- keeps its last value; a key that is present and null clears it. Saving the
-- same numbers again adds no row.

create function public.crm_save_ad_numbers(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_args jsonb := coalesce(p, '{}'::jsonb);
  w public.ad_weeks%rowtype;
  v_started date;
  v_spend bigint;
  v_clicks integer;
begin
  select * into w from public.ad_weeks order by entered_at desc, id desc limit 1;

  v_started := case when v_args ? 'campaign_started_on'
    then nullif(v_args ->> 'campaign_started_on', '')::date
    else w.campaign_started_on end;
  v_spend := case when v_args ? 'spend_cents'
    then (v_args ->> 'spend_cents')::bigint
    else w.spend_cents end;
  v_clicks := case when v_args ? 'clicks'
    then (v_args ->> 'clicks')::integer
    else w.clicks end;

  if w.id is not null
     and v_started is not distinct from w.campaign_started_on
     and v_spend is not distinct from w.spend_cents
     and v_clicks is not distinct from w.clicks then
    return jsonb_build_object('ok', true, 'changed', false);
  end if;

  if w.id is null and v_started is null and v_spend is null and v_clicks is null then
    return jsonb_build_object('ok', true, 'changed', false);
  end if;

  insert into public.ad_weeks (campaign_started_on, spend_cents, clicks)
  values (v_started, v_spend, v_clicks);

  return jsonb_build_object('ok', true, 'changed', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Access: the website's server and nobody else
-- ---------------------------------------------------------------------------

revoke execute on function public.crm_stage_rank(text)
  from public, anon, authenticated;
revoke execute on function public.crm_lead_action(uuid, text, jsonb)
  from public, anon, authenticated;
revoke execute on function public.crm_reopen_on_inquiry()
  from public, anon, authenticated;
revoke execute on function public.crm_save_ad_numbers(jsonb)
  from public, anon, authenticated;

grant execute on function public.crm_stage_rank(text) to service_role;
grant execute on function public.crm_lead_action(uuid, text, jsonb) to service_role;
grant execute on function public.crm_save_ad_numbers(jsonb) to service_role;
