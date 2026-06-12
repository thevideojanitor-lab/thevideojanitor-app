-- Security hardening + realtime enablement (June 2026 whole-app audit).
--
-- 1. admin_actions: any authenticated user could INSERT arbitrary audit rows
--    (WITH CHECK true) — including rows attributed to someone else. Clients DO
--    legitimately write entries (editor swaps from ReviewPage/SwapEditorModal),
--    so inserts stay open but only as yourself (or unattributed, admin_id NULL).
-- 2. subscriptions: the client policy was FOR ALL, letting any client UPDATE
--    their own row — including credits_remaining. Credits now move only through
--    deduct_credits() (atomic, race-free) or service-role edge functions;
--    clients keep read access only.
-- 3. decrement_editor_queue: was callable by any authenticated user with any
--    editor's id. Now a no-op unless called on yourself or by an admin.
-- 4. Pin search_path on flagged functions; trigger functions are not callable
--    as RPC.
-- 5. Wrap auth.uid() in (select ...) across policies so it is evaluated once
--    per query instead of per row (auth_rls_initplan lint).
-- 6. supabase_realtime publication was EMPTY — every postgres_changes channel
--    in the app has been silently receiving nothing. Add the tables the
--    frontend subscribes to.

-- ── 1. admin_actions: no impersonation ───────────────────────────────────────
drop policy if exists client_insert_admin_actions on admin_actions;
create policy client_insert_admin_actions on admin_actions
  for insert to authenticated
  with check (admin_id is null or admin_id = (select auth.uid()));

-- ── 2a. Atomic credit deduction ──────────────────────────────────────────────
create or replace function public.deduct_credits(amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if amount is null or amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  update subscriptions
  set credits_remaining = credits_remaining - amount,
      updated_at = now()
  where id = (
    select id from subscriptions
    where client_id = (select auth.uid())
      and status = 'active'
      and credits_remaining >= amount
    order by created_at desc
    limit 1
  )
  returning credits_remaining into new_balance;

  if new_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  return new_balance;
end;
$$;

revoke execute on function public.deduct_credits(integer) from public, anon;
grant execute on function public.deduct_credits(integer) to authenticated;

-- ── 2b. subscriptions: clients read-only ─────────────────────────────────────
drop policy if exists client_subs on subscriptions;
create policy client_subs on subscriptions
  for select using (client_id = (select auth.uid()));

-- ── 3. decrement_editor_queue: self-or-admin only ────────────────────────────
create or replace function public.decrement_editor_queue(editor_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update editor_profiles
  set current_queue_count = greatest(0, current_queue_count - 1)
  where user_id = editor_user_id
    and (editor_user_id = (select auth.uid()) or is_admin());
$$;
revoke execute on function public.decrement_editor_queue(uuid) from public, anon;

-- ── 4. Function hygiene ──────────────────────────────────────────────────────
alter function public.notify_deliverable_ready() set search_path = public;
revoke execute on function public.notify_deliverable_ready() from public, anon, authenticated;
alter function public.set_close_after() set search_path = public;
alter function public.enforce_revision_limit() set search_path = public;

-- ── 5. RLS initplan: evaluate auth.uid() once per query ─────────────────────
drop policy if exists client_profile on client_profiles;
create policy client_profile on client_profiles
  for all using (user_id = (select auth.uid()));

drop policy if exists client_requests on requests;
create policy client_requests on requests
  for all using (client_id = (select auth.uid()));

drop policy if exists editor_requests on requests;
create policy editor_requests on requests
  for select using (editor_id = (select auth.uid()));

drop policy if exists client_notifs on notifications;
create policy client_notifs on notifications
  for all using (user_id = (select auth.uid()));

drop policy if exists editor_notifs on notifications;
create policy editor_notifs on notifications
  for all using (user_id = (select auth.uid()));

drop policy if exists editor_profile on editor_profiles;
create policy editor_profile on editor_profiles
  for all using (user_id = (select auth.uid()));

drop policy if exists editor_payouts on editor_payouts;
create policy editor_payouts on editor_payouts
  for select using (editor_id = (select auth.uid()));

drop policy if exists deliverable_access on deliverables;
create policy deliverable_access on deliverables
  for select using (
    exists (
      select 1 from requests r
      where r.id = deliverables.request_id
        and (r.client_id = (select auth.uid()) or r.editor_id = (select auth.uid()))
    )
  );

drop policy if exists revcomment_access on revision_comments;
create policy revcomment_access on revision_comments
  for all using (
    exists (
      select 1 from deliverables d
      join requests r on r.id = d.request_id
      where d.id = revision_comments.deliverable_id
        and (r.client_id = (select auth.uid()) or r.editor_id = (select auth.uid()))
    )
  );

drop policy if exists msg_access on messages;
create policy msg_access on messages
  for all using (
    exists (
      select 1 from requests r
      where r.id = messages.request_id
        and (r.client_id = (select auth.uid()) or r.editor_id = (select auth.uid()))
    )
  );

drop policy if exists cfg_read on platform_config;
create policy cfg_read on platform_config
  for select using ((select auth.uid()) is not null);

drop policy if exists cfg_write on platform_config;
create policy cfg_write on platform_config
  for all using (
    exists (
      select 1 from users u
      where u.id = (select auth.uid()) and u.admin_role is not null
    )
  );

drop policy if exists users_self on users;
create policy users_self on users
  for all using (id = (select auth.uid()));

-- ── 6. Realtime: publish the tables the frontend subscribes to ───────────────
alter publication supabase_realtime add table requests;
alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table deliverables;
alter publication supabase_realtime add table admin_actions;
