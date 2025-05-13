import { supabase } from './supabase';
import { Database } from './types';

type Product = Database['public']['Tables']['products']['Row'] & {
  category: { name: string; slug: string };
  variants: Array<Database['public']['Tables']['product_variants']['Row']>;
};

type CartItem = {
  id: string;
  product: Product;
  variant: Database['public']['Tables']['product_variants']['Row'];
  quantity: number;
};

export async function getProducts(page = 1, limit = 10) {
  // Calculate the range for pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      variants:product_variants(*)
    `, { count: 'exact' })
    .eq('is_visible', true)
    .range(from, to);

  if (error) throw error;
  return {
    data: data as Product[],
    count: count || 0,
    hasMore: count ? from + limit < count : false
  };
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      variants:product_variants(*)
    `)
    .eq('is_visible', true);

  if (error) throw error;
  return data as Product[];
}

export async function getCart() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      variant:product_variants(*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data as CartItem[];
}

export async function addToCart(productId: string, variantId: string, quantity: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: user.id,
      product_id: productId,
      variant_id: variantId,
      quantity
    })
    .select();

  if (error) throw error;
  return data;
}

export async function removeFromCart(itemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) throw error;
}

export async function getAdminData() {
  const { data: counts, error: countsError } = await supabase
    .rpc('get_admin_dashboard_counts');

  if (countsError) throw countsError;

  const { data: recentUsers, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (usersError) throw usersError;

  const { data: recentOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) throw ordersError;

  return {
    ...counts,
    recentUsers,
    recentOrders
  };
}