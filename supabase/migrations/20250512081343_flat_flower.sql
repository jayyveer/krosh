/*
  # Initial Schema Setup for Krosh

  1. New Tables
    - users (extends auth.users)
    - addresses (user shipping addresses)
    - admins (admin users)
    - categories (product categories)
    - products (main product info)
    - product_variants (color, weight, size variants)
    - orders (user orders)
    - order_items (items in orders)
    - inventory_logs (stock changes)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
    - Add policies for admin access

  3. Enums and Constraints
    - Order status types
    - Payment methods
    - Payment status types
    - Inventory action types
*/

-- Create custom types
CREATE TYPE order_status AS ENUM ('requested', 'approved', 'shipped');
CREATE TYPE payment_method AS ENUM ('stripe', 'cod');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE inventory_action AS ENUM ('restock', 'sale', 'correction');
CREATE TYPE admin_role AS ENUM ('superadmin', 'editor');

-- Users table (extends auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Addresses table
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  label text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  country text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Admins table
CREATE TABLE admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role admin_role NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  image_urls text[] NOT NULL DEFAULT '{}',
  price numeric NOT NULL CHECK (price >= 0),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  color text NOT NULL,
  weight text NOT NULL,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_sold_out boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'requested',
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  address_id uuid REFERENCES addresses(id) ON DELETE RESTRICT,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  invoice_url text,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0)
);

-- Inventory logs table
CREATE TABLE inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  action inventory_action NOT NULL,
  quantity integer NOT NULL,
  admin_id uuid REFERENCES admins(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Addresses policies
CREATE POLICY "Users can CRUD own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Categories are readable by everyone
CREATE POLICY "Categories are public"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products are readable by everyone if visible
CREATE POLICY "Products are public if visible"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Product variants are readable by everyone
CREATE POLICY "Product variants are public"
  ON product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

-- Admin policies (using is_admin() function)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins have full access to all tables
CREATE POLICY "Admins have full access"
  ON users
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full access"
  ON products
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full access"
  ON categories
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full access"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full access"
  ON orders
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full access"
  ON order_items
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full access"
  ON inventory_logs
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);