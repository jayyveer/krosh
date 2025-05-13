/*
  # Update Product and Variant Structure
  
  This migration updates the product and variant tables to support:
  1. Size at product level
  2. Images at variant level
  3. Default variant for each product
*/

-- Add size column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;

-- Add default_variant_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_variant_id UUID REFERENCES product_variants(id);

-- Add name column to product_variants table
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS name TEXT;

-- Add image_urls array to product_variants table
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Create function to ensure products have at least one variant
CREATE OR REPLACE FUNCTION check_product_has_variant()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM product_variants WHERE product_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete the last variant of a product';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent deleting the last variant of a product
DROP TRIGGER IF EXISTS prevent_delete_last_variant ON product_variants;
CREATE TRIGGER prevent_delete_last_variant
BEFORE DELETE ON product_variants
FOR EACH ROW
WHEN (OLD.product_id IS NOT NULL)
EXECUTE FUNCTION check_product_has_variant();

-- Create function to update default variant if it's deleted
CREATE OR REPLACE FUNCTION update_default_variant_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- If the deleted variant was a default variant for any product
  UPDATE products
  SET default_variant_id = (
    SELECT id FROM product_variants 
    WHERE product_id = OLD.product_id 
    LIMIT 1
  )
  WHERE default_variant_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update default variant when a variant is deleted
DROP TRIGGER IF EXISTS update_default_variant_trigger ON product_variants;
CREATE TRIGGER update_default_variant_trigger
BEFORE DELETE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_default_variant_on_delete();
