/*
  # Create Email Confirmation Function
  
  Creates an RPC function to manually confirm a user's email
*/

-- Create a function to confirm a user's email
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the user's email_confirmed_at timestamp
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id AND email_confirmed_at IS NULL;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.confirm_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_user_email(UUID) TO anon;

-- Ensure the handle_new_user trigger function auto-confirms emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;

  -- Create user profile in public.users table
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
