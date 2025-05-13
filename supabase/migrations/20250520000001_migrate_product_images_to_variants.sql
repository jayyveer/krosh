/*
  # Migrate Product Images to Variants
  
  This migration:
  1. Creates a default variant for each product that doesn't have one
  2. Moves product images to the default variant
  3. Sets the default_variant_id for each product
*/

-- Function to migrate product images to variants
CREATE OR REPLACE FUNCTION migrate_product_images_to_variants()
RETURNS void AS $$
DECLARE
  product_record RECORD;
  variant_id UUID;
BEGIN
  -- Loop through all products
  FOR product_record IN 
    SELECT id, name, image_urls 
    FROM products 
    WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0
  LOOP
    -- Check if product already has variants
    IF EXISTS (SELECT 1 FROM product_variants WHERE product_id = product_record.id) THEN
      -- Get the first variant (or create one if none exists)
      SELECT id INTO variant_id FROM product_variants WHERE product_id = product_record.id LIMIT 1;
      
      -- Update the variant with the product images
      UPDATE product_variants 
      SET image_urls = product_record.image_urls,
          name = COALESCE(name, 'Default')
      WHERE id = variant_id;
    ELSE
      -- Create a new default variant with the product images
      INSERT INTO product_variants (
        product_id, 
        name, 
        color, 
        size, 
        weight, 
        stock, 
        is_sold_out,
        image_urls
      ) VALUES (
        product_record.id,
        'Default',
        'Default',
        NULL,
        NULL,
        10, -- Default stock value
        FALSE,
        product_record.image_urls
      ) RETURNING id INTO variant_id;
    END IF;
    
    -- Set this variant as the default for the product
    UPDATE products 
    SET default_variant_id = variant_id
    WHERE id = product_record.id;
  END LOOP;
  
  -- Handle products without images
  FOR product_record IN 
    SELECT id, name 
    FROM products 
    WHERE (image_urls IS NULL OR array_length(image_urls, 1) = 0)
      AND NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = products.id)
  LOOP
    -- Create a default variant
    INSERT INTO product_variants (
      product_id, 
      name, 
      color, 
      size, 
      weight, 
      stock, 
      is_sold_out,
      image_urls
    ) VALUES (
      product_record.id,
      'Default',
      'Default',
      NULL,
      NULL,
      10, -- Default stock value
      FALSE,
      '{}'::text[]
    ) RETURNING id INTO variant_id;
    
    -- Set this variant as the default for the product
    UPDATE products 
    SET default_variant_id = variant_id
    WHERE id = product_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_product_images_to_variants();

-- Drop the function after use
DROP FUNCTION migrate_product_images_to_variants();

-- Clear image_urls from products table (optional - can be done later if needed)
-- UPDATE products SET image_urls = NULL;
