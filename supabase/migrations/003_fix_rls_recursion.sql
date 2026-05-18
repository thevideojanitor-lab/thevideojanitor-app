-- Fix infinite recursion in users RLS policy.
-- The admin_bypass policy on users referenced users itself via EXISTS subquery,
-- causing Postgres to recurse infinitely on every query to that table.
-- Solution: SECURITY DEFINER function that runs without RLS, then use it everywhere.

-- 1. Create a bypass function (runs as definer, skips RLS on users table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND admin_role IS NOT NULL
  );
$$;

-- 2. Drop the recursive policy on users
DROP POLICY IF EXISTS admin_bypass ON users;

-- 3. Replace with two non-recursive policies
--    Users can always access their own row
CREATE POLICY users_self ON users FOR ALL USING (id = auth.uid());
--    Admins can access every row (uses the definer function above — no recursion)
CREATE POLICY users_admin ON users FOR ALL USING (is_admin());

-- 4. Update admin bypass policies on other tables to use is_admin()
--    (avoids the EXISTS(SELECT 1 FROM users ...) pattern throughout)

DROP POLICY IF EXISTS admin_bypass ON client_profiles;
CREATE POLICY admin_bypass ON client_profiles FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON editor_profiles;
CREATE POLICY admin_bypass ON editor_profiles FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON subscriptions;
CREATE POLICY admin_bypass ON subscriptions FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON requests;
CREATE POLICY admin_bypass ON requests FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON deliverables;
CREATE POLICY admin_bypass ON deliverables FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON revision_comments;
CREATE POLICY admin_bypass ON revision_comments FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON messages;
CREATE POLICY admin_bypass ON messages FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON editor_payouts;
CREATE POLICY admin_bypass ON editor_payouts FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON notifications;
CREATE POLICY admin_bypass ON notifications FOR ALL USING (is_admin());

DROP POLICY IF EXISTS admin_bypass ON admin_actions;
CREATE POLICY admin_bypass ON admin_actions FOR ALL USING (is_admin());
