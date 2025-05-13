# Krosh Supabase Schema Documentation

## Overview

This document details the database schema, relationships, and storage configuration for the Krosh e-commerce platform implemented in Supabase. The schema is designed to support a yarn and crochet supply store with product variants, user management, and order processing.

## Database Tables

### 1. Users

Extends Supabase Auth users with additional profile information.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Stores user profile information linked to authentication.

### 2. Addresses

```sql
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
```

**Purpose**: Stores shipping addresses for users.

### 3. Admins

```sql
CREATE TABLE admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role admin_role NOT NULL
);
```

**Purpose**: Identifies users with admin privileges and their roles.

### 4. Categories

```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Organizes products into categories and subcategories.

### 5. Products

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  price numeric NOT NULL CHECK (price >= 0),
  original_price numeric,
  size text,
  default_variant_id uuid REFERENCES product_variants(id),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Stores product information with size at the product level.

### 6. Product Variants

```sql
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text,
  color text NOT NULL,
  weight text NOT NULL,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_sold_out boolean NOT NULL DEFAULT false,
  image_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Stores variant information (colors/shades) with images at the variant level.

### 7. Cart Items

```sql
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Tracks items in user shopping carts.

### 8. Orders

```sql
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
```

**Purpose**: Stores order information and status.

### 9. Order Items

```sql
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0)
);
```

**Purpose**: Stores individual items within an order.

### 10. Inventory Logs

```sql
CREATE TABLE inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  action inventory_action NOT NULL,
  quantity integer NOT NULL,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Tracks inventory changes for auditing and history.

## Custom Types (Enums)

```sql
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('stripe', 'cod');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE inventory_action AS ENUM ('restock', 'sale', 'correction');
CREATE TYPE admin_role AS ENUM ('superadmin', 'editor');
```

**Purpose**: Defines constrained values for specific fields.

## Table Relationships

### One-to-Many Relationships

1. **User to Addresses**:
   - One user can have multiple shipping addresses
   - `addresses.user_id` references `users.id`

2. **Category to Products**:
   - One category can contain multiple products
   - `products.category_id` references `categories.id`

3. **Product to Variants**:
   - One product can have multiple variants (colors/shades)
   - `product_variants.product_id` references `products.id`

4. **User to Orders**:
   - One user can have multiple orders
   - `orders.user_id` references `users.id`

5. **Order to Order Items**:
   - One order can contain multiple items
   - `order_items.order_id` references `orders.id`

### Many-to-One Relationships

1. **Products to Default Variant**:
   - Each product has one default variant
   - `products.default_variant_id` references `product_variants.id`

2. **Categories to Parent Category**:
   - Categories can have a parent category (for subcategories)
   - `categories.parent_id` references `categories.id`

## Storage Buckets

### 1. shop-images

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-images',
  'Shop Images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
);
```

**Purpose**: Stores product variant images with the following structure:
- `/products/[variant-id]/image1.jpg`
- `/products/[variant-id]/image2.jpg`

### 2. category-images

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'Category Images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
);
```

**Purpose**: Stores category images with the following structure:
- `/[category-id].jpg`

## Row Level Security (RLS)

The database implements Row Level Security to control access to data:

### User Data Policies

- Users can read and update their own data
- Users can read and update their own addresses
- Users can read and update their own cart items

### Product Data Policies

- Anyone can read visible products and variants
- Only admins can create, update, or delete products and variants

### Order Data Policies

- Users can read their own orders
- Users can create orders
- Only admins can update order status

### Admin Policies

- Admins have full access to all tables
- Superadmins have access to admin management

## Database Functions

### 1. is_admin()

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
  );
END;
$$;
```

**Purpose**: Checks if the current user is an admin.

### 2. get_admin_dashboard_counts()

```sql
CREATE OR REPLACE FUNCTION get_admin_dashboard_counts()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  user_count integer;
  product_count integer;
  category_count integer;
  order_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO category_count FROM categories;
  SELECT COUNT(*) INTO order_count FROM orders;
  
  RETURN json_build_object(
    'userCount', user_count,
    'productCount', product_count,
    'categoryCount', category_count,
    'orderCount', order_count
  );
END;
$$;
```

**Purpose**: Returns counts for the admin dashboard.

### 3. make_user_admin()

```sql
CREATE OR REPLACE FUNCTION make_user_admin(
  user_id uuid,
  user_email text,
  admin_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user exists in the users table
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    -- Create the user if they don't exist
    INSERT INTO users (id, email, name)
    VALUES (user_id, user_email, split_part(user_email, '@', 1));
  END IF;
  
  -- Insert or update the admin record
  INSERT INTO admins (id, email, role)
  VALUES (user_id, user_email, admin_role::admin_role)
  ON CONFLICT (id) DO UPDATE
  SET email = user_email, role = admin_role::admin_role;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User made admin successfully'
  );
END;
$$;
```

**Purpose**: Makes a user an admin with the specified role.

## Indexes

The database includes indexes for performance optimization:

```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

## Migration History

The schema has evolved through several migrations:

1. **Initial Schema Setup** - Created base tables and relationships
2. **Cart Items Addition** - Added cart functionality
3. **Category Updates** - Added image_url and parent_id for subcategories
4. **Shop Images Bucket** - Created storage for product images
5. **Product Variant Structure** - Updated to store size at product level and images at variant level

## Special Considerations

1. **Product-Variant Relationship**:
   - Products store size information
   - Variants store color/shade information and images
   - Products must have at least one variant to be visible
   - Each product has a default variant for display in listings

2. **Admin Role Management**:
   - Admin status is stored in a separate table
   - Two roles: superadmin and editor
   - Functions to check and assign admin status

3. **Image Storage**:
   - Images are stored in Supabase Storage buckets
   - RLS policies control who can upload/modify images
   - Only admins can modify images, but anyone can view them
