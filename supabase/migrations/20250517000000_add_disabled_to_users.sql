/*
  # Add Disabled Column to Users Table
  
  Adds a disabled column to the users table to allow admins to disable user accounts
*/

-- Add disabled column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT false;

-- Create function to check if a user is disabled
CREATE OR REPLACE FUNCTION is_user_disabled(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_disabled BOOLEAN;
BEGIN
  SELECT disabled INTO is_disabled FROM users WHERE id = user_id;
  RETURN COALESCE(is_disabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
