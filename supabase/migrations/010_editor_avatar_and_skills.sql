-- Editor profile enrichment: a required profile picture and a separate set of
-- editing skills (motion graphics, color grading, …). Skills are distinct from
-- content niches (Reels/TikTok/…), which remain the matching signal — skills are
-- shown to clients and used for display/filtering only.

alter table public.editor_profiles
  add column if not exists avatar_url text,
  add column if not exists skills text[] not null default '{}';

-- Public avatars bucket. Avatars are non-sensitive and shown to clients, so the
-- bucket is public-read; writes are scoped to each user's own folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage RLS: anyone can read an avatar; a user may only write objects under a
-- folder named after their own uid (path = "<uid>/<file>").
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
