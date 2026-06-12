-- Clients see "Editor assigned" with no name because editor_profiles is only
-- readable by the editor themself (and admins). Let clients read the profile
-- of an editor currently or previously assigned to one of their requests, so
-- request cards can show a real name and rating instead of a UUID initial.
create policy clients_read_assigned_editor_profiles on editor_profiles
  for select using (
    exists (
      select 1 from requests r
      where r.editor_id = editor_profiles.user_id
        and r.client_id = (select auth.uid())
    )
  );
