/*
  # Add Primary Address Functionality
  
  This migration adds:
  1. is_primary field to addresses table
  2. Trigger to ensure only one address per user is marked as primary
  3. Updates RLS policies for addresses table
*/

-- Add is_primary column to addresses table
ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Create function to ensure only one primary address per user
CREATE OR REPLACE FUNCTION public.handle_primary_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new address is being set as primary, unset any existing primary addresses for this user
  IF NEW.is_primary = true THEN
    UPDATE addresses
    SET is_primary = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_primary = true;
  END IF;
  
  -- If this is the user's first address, make it primary by default
  IF NOT EXISTS (
    SELECT 1 FROM addresses 
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) THEN
    NEW.is_primary := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to manage primary addresses
DROP TRIGGER IF EXISTS ensure_single_primary_address ON addresses;
CREATE TRIGGER ensure_single_primary_address
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_primary_address();

-- Update RLS policies for addresses table
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins have full access to addresses" ON addresses;

-- Enable RLS on addresses table if not already enabled
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for address management
CREATE POLICY "Users can view their own addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own addresses"
  ON addresses
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins have full access to addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (is_admin());
