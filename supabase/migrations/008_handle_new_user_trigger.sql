-- Auto-provision public.users (+ client_profiles for clients) when a new auth
-- user is created WITH a role in signup metadata. This makes email signup
-- atomic and prevents orphaned auth accounts (an auth user with no users row,
-- which previously authenticated but could never be routed and got stuck on the
-- login page).
--
-- OAuth users carry no role metadata, so the trigger intentionally does nothing
-- for them — they continue through /auth/select-role where they pick a role.
-- The client-side ensureUserProfile() upserts are idempotent (ON CONFLICT DO
-- NOTHING), so they coexist with this trigger without duplicate-key conflicts;
-- the client path additionally persists the geo-detected region.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := new.raw_user_meta_data ->> 'role';
begin
  if meta_role in ('client', 'editor') then
    insert into public.users (id, email, role)
    values (new.id, coalesce(new.email, ''), meta_role)
    on conflict (id) do nothing;

    if meta_role = 'client' then
      insert into public.client_profiles (user_id)
      values (new.id)
      on conflict (user_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- This is a trigger function and must never be callable as a REST RPC. Triggers
-- fire as the table owner regardless of EXECUTE grants, so revoking is safe and
-- closes the "SECURITY DEFINER function executable by anon/authenticated" lint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
