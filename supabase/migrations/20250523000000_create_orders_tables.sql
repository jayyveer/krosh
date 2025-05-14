-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'online')),
    tracking_number TEXT,
    notes TEXT
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins have full access to orders
CREATE POLICY "Admins have full access to orders"
ON public.orders
FOR ALL
TO authenticated
USING (is_admin());

-- Add RLS policies for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own order items
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

-- Users can insert their own order items
CREATE POLICY "Users can insert their own order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

-- Admins have full access to order items
CREATE POLICY "Admins have full access to order items"
ON public.order_items
FOR ALL
TO authenticated
USING (is_admin());

-- Create function to update order total
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.orders
    SET total_amount = (
        SELECT SUM(price * quantity)
        FROM public.order_items
        WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order total when items change
CREATE TRIGGER update_order_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
