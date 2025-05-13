/*
  # Update Categories Table
  
  Adds image_url and parent_id columns to the categories table
  to support category images and subcategories
*/

-- Add image_url column to store the path to the category image
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add parent_id column to support subcategories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id);

-- Add description column for category descriptions
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index on parent_id for faster subcategory queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Create RLS policy to allow admins to manage categories
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create RLS policy to allow all users to read categories
CREATE POLICY "All users can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policy to allow anonymous users to read categories
CREATE POLICY "Anonymous users can read categories"
  ON categories
  FOR SELECT
  TO anon
  USING (true);
