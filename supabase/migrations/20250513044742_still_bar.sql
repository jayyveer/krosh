/*
  # Add cart items table and update UI components

  1. New Tables
    - cart_items
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - product_id (uuid, references products)
      - variant_id (uuid, references product_variants)
      - quantity (integer)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());