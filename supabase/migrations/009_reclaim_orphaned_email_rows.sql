-- Fix: Google/OAuth signup gets stuck on the role-selection step.
--
-- Root cause: public.users has a UNIQUE(email) constraint but NO foreign key to
-- auth.users. Deleting an auth account (e.g. a test user) therefore leaves an
-- orphaned public.users row behind — unreachable (no auth user can ever log into
-- it), yet still occupying that email. When the same person signs in again with
-- Google they get a NEW auth id, reach /auth/select-role, pick a role, and the
-- client provisioning insert ( ... ON CONFLICT (id) DO NOTHING ) does not collide
-- on id but DOES violate users_email_key on the leftover email → the row can
-- never be created and the user is stranded on the role page.
--
-- Fix: when a new auth user is created, reclaim any orphaned public.users row
-- that reused this email (same email, different id, and no live auth user). This
-- runs for EVERY new auth user — OAuth and email signup alike — so the later
-- profile provisioning always has a clean email to claim.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := new.raw_user_meta_data ->> 'role';
begin
  -- Reclaim an orphaned profile row left over from a previously deleted auth
  -- account that reused this email. Strictly scoped to rows that have no live
  -- auth user, so this can never touch an active account.
  if new.email is not null then
    delete from public.users u
    where u.email = new.email
      and u.id <> new.id
      and not exists (select 1 from auth.users a where a.id = u.id);
  end if;

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

-- Trigger already exists from migration 008; re-create defensively in case this
-- migration is applied to a fresh database out of order.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- One-time cleanup of the orphaned rows that are already blocking signups today.
-- Scoped to rows with no live auth user, so it cannot remove a reachable account.
delete from public.users u
where not exists (select 1 from auth.users a where a.id = u.id);
