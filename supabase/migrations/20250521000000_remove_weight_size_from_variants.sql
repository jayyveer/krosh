/*
  # Remove Weight and Size from Product Variants
  
  This migration removes the weight and size columns from the product_variants table
  since size is now managed at the product level and weight is no longer needed.
*/

-- Remove weight column from product_variants table
ALTER TABLE product_variants DROP COLUMN IF EXISTS weight;

-- Remove size column from product_variants table
ALTER TABLE product_variants DROP COLUMN IF EXISTS size;
