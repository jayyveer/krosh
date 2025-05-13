import { supabase } from './supabase';

/**
 * Folder types for organizing images in the shop-images bucket
 */
export type ImageFolder = 'products' | 'categories' | 'banners' | 'users';

/**
 * Options for image upload
 */
export interface UploadOptions {
  /**
   * Maximum file size in bytes (default: 5MB)
   */
  maxSize?: number;
  
  /**
   * Allowed file types (default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
   */
  allowedTypes?: string[];
}

/**
 * Default upload options
 */
const defaultOptions: UploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

/**
 * Validates an image file before upload
 * @param file The file to validate
 * @param options Upload options
 * @returns An error message if validation fails, null otherwise
 */
export function validateImage(file: File, options: UploadOptions = defaultOptions): string | null {
  const { maxSize, allowedTypes } = { ...defaultOptions, ...options };
  
  if (file.size > maxSize!) {
    return `File size exceeds the maximum allowed size of ${maxSize! / (1024 * 1024)}MB`;
  }
  
  if (!allowedTypes!.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes!.join(', ')}`;
  }
  
  return null;
}

/**
 * Uploads an image to the specified folder in the shop-images bucket
 * @param file The file to upload
 * @param folder The folder to upload to
 * @param options Upload options
 * @returns The public URL of the uploaded image
 * @throws Error if validation or upload fails
 */
export async function uploadImage(
  file: File, 
  folder: ImageFolder,
  options: UploadOptions = defaultOptions
): Promise<string> {
  // Validate the file
  const validationError = validateImage(file, options);
  if (validationError) {
    throw new Error(validationError);
  }
  
  // Generate a unique filename
  const fileName = `${folder}/${folder.slice(0, -1)}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  // Upload the file
  const { data, error } = await supabase.storage
    .from('shop-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('shop-images')
    .getPublicUrl(fileName);
    
  return publicUrlData.publicUrl;
}

/**
 * Deletes an image from the shop-images bucket
 * @param url The public URL of the image to delete
 * @returns True if the image was deleted successfully, false otherwise
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract the path from the URL
    // URL format: https://[project-ref].supabase.co/storage/v1/object/public/shop-images/[path]
    const path = url.split('/shop-images/')[1];
    
    if (!path) {
      console.error('Invalid image URL:', url);
      return false;
    }
    
    const { error } = await supabase.storage
      .from('shop-images')
      .remove([path]);
      
    if (error) {
      console.error('Image deletion error:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error deleting image:', err);
    return false;
  }
}
