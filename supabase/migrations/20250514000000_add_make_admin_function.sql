/*
  # Add Make Admin Function
  
  Creates a stored procedure to make a user an admin
*/

-- Function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(
  user_id UUID,
  user_email TEXT,
  admin_role TEXT DEFAULT 'editor'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if the user exists in the admins table
  IF EXISTS (SELECT 1 FROM admins WHERE id = user_id) THEN
    -- Update the existing admin
    UPDATE admins
    SET role = admin_role::admin_role, email = user_email
    WHERE id = user_id;
    
    SELECT json_build_object(
      'success', true,
      'message', 'Admin role updated successfully'
    ) INTO result;
  ELSE
    -- Insert a new admin
    INSERT INTO admins (id, email, role)
    VALUES (user_id, user_email, admin_role::admin_role);
    
    SELECT json_build_object(
      'success', true,
      'message', 'User made admin successfully'
    ) INTO result;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Error making user admin: ' || SQLERRM
    ) INTO result;
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION make_user_admin(UUID, TEXT, TEXT) TO authenticated;
