-- Run this in the Supabase SQL Editor to immediately disable email confirmation
-- and auto-confirm all existing users

-- Disable email confirmation requirement in Supabase Auth settings
UPDATE auth.config
SET confirm_email_on_signup = false
WHERE id = 1;

-- Auto-confirm all existing users that haven't confirmed their email yet
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Create a trigger function to auto-confirm new users' emails
CREATE OR REPLACE FUNCTION auth.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Set email_confirmed_at to current timestamp for new users
  NEW.email_confirmed_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to auto-confirm emails for new users
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.auto_confirm_email();
