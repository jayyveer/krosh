/*
  # Create Category Images Bucket
  
  Creates a storage bucket for category images
*/

-- Create the category-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'Category Images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload category images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'category-images' AND is_admin());

-- Create policy to allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update category images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'category-images' AND is_admin());

-- Create policy to allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete category images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'category-images' AND is_admin());

-- Create policy to allow anyone to read category images
CREATE POLICY "Anyone can read category images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'category-images');
