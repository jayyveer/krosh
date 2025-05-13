/*
  # Shop Images Bucket Policies
  
  Creates RLS policies for the shop-images bucket to:
  1. Allow admins to manage all images
  2. Allow public read access to all images
*/

-- Create policy to allow admins to upload images
CREATE POLICY "Admins can upload shop images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shop-images' AND is_admin());

-- Create policy to allow admins to update images
CREATE POLICY "Admins can update shop images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'shop-images' AND is_admin());

-- Create policy to allow admins to delete images
CREATE POLICY "Admins can delete shop images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'shop-images' AND is_admin());

-- Create policy to allow anyone to read shop images
CREATE POLICY "Anyone can read shop images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'shop-images');
