/*
  # Add RLS Policy for Admins Table
  
  Adds a policy to allow users to read their own admin record
*/

-- Add policy to allow users to read their own admin record
CREATE POLICY "Users can read their own admin record"
  ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Add policy to allow admins to read all admin records
CREATE POLICY "Admins can read all admin records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (is_admin());
