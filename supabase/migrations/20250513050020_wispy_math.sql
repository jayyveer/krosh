/*
  # Admin Dashboard Function
  
  Creates a stored procedure to fetch dashboard counts for the admin panel
*/

CREATE OR REPLACE FUNCTION get_admin_dashboard_counts()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'userCount', (SELECT COUNT(*) FROM users),
    'productCount', (SELECT COUNT(*) FROM products),
    'categoryCount', (SELECT COUNT(*) FROM categories),
    'orderCount', (SELECT COUNT(*) FROM orders)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_counts() TO authenticated;