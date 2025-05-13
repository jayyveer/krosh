/*
  # Add is_user_admin Function
  
  Creates a function to check if a specific user is an admin
*/

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
