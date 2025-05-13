/*
  # Add Original Price Column to Products Table
  
  Adds an original_price column to the products table to support discounted prices
*/

-- Add original_price column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
