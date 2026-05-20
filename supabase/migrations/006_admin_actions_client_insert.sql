-- Allow any authenticated user to INSERT into admin_actions.
-- Clients log swap requests; admins log all other actions.
CREATE POLICY client_insert_admin_actions
  ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
