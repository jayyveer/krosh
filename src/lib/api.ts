import { supabase } from './supabase';
import { Database } from './types';

type Product = Database['public']['Tables']['products']['Row'] & {
  category: { name: string; slug: string; image_url?: string | null };
  variants: Array<Database['public']['Tables']['product_variants']['Row']>;
};

type CartItem = {
  id: string;
  product: Product;
  variant: Database['public']['Tables']['product_variants']['Row'];
  quantity: number;
};

export async function getProducts(page = 1, limit = 10, categorySlug?: string) {
  // Calculate the range for pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let data, count;

    if (categorySlug) {
      // For category filtering, we need to use a different approach
      // First, get the category ID from the slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (categoryData) {
        // Then filter products by category_id
        const result = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name, slug, image_url),
            variants:product_variants(*)
          `, { count: 'exact' })
          .eq('is_visible', true)
          .eq('category_id', categoryData.id)
          .range(from, to);

        data = result.data;
        count = result.count;
      } else {
        // Category not found, return empty result
        data = [];
        count = 0;
      }
    } else {
      // No category filter, get all products
      const result = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug, image_url),
          variants:product_variants(*)
        `, { count: 'exact' })
        .eq('is_visible', true)
        .range(from, to);

      data = result.data;
      count = result.count;
    }

    return {
      data: data as Product[],
      count: count || 0,
      hasMore: count ? from + limit < count : false
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug, image_url),
      variants:product_variants(*)
    `)
    .eq('is_visible', true);

  if (error) throw error;
  return data as Product[];
}

// Cache for user ID to avoid repeated auth calls
let cachedUserId: string | null = null;

export async function getCart() {
  // Use cached user ID if available to reduce auth API calls
  if (!cachedUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    cachedUserId = user.id;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products(id, name, price, original_price, size),
      variant:product_variants!cart_items_variant_id_fkey(id, name, color, size, weight, stock, image_urls)
    `)
    .eq('user_id', cachedUserId);

  if (error) throw error;
  return data as CartItem[];
}

export async function addToCart(productId: string, variantId: string, quantity: number) {
  // Use cached user ID if available
  if (!cachedUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    cachedUserId = user.id;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: cachedUserId,
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

/**
 * Makes a user an admin by adding them to the admins table
 * @param userId The ID of the user to make an admin
 * @param role The admin role to assign (superadmin or editor)
 */
export async function makeUserAdmin(userId: string, role: 'superadmin' | 'editor' = 'editor') {
  // First, get the user's email from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (userError) throw userError;
  if (!userData) throw new Error('User not found');

  // Use the make_user_admin function
  const { data, error } = await supabase
    .rpc('make_user_admin', {
      user_id: userId,
      user_email: userData.email,
      admin_role: role
    });

  if (error) throw error;

  if (!data.success) {
    throw new Error(data.message);
  }

  return { message: data.message };
}

/**
 * Checks if a user is an admin
 * @param userId The ID of the user to check
 * @returns Object containing isAdmin status and admin role if applicable
 */
export async function checkAdminStatus(userId: string) {
  if (!userId) {
    return { isAdmin: false, role: null };
  }

  const { data, error } = await supabase
    .from('admins')
    .select('role')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error checking admin status:', error);
  }

  return {
    isAdmin: !!data,
    role: data?.role || null
  };
}

/**
 * Synchronizes user data across public.users and admins tables
 * This is useful when there are inconsistencies in the data
 * @param userId The ID of the user to synchronize
 * @param email The email to use for synchronization
 */
export async function syncUserData(userId: string, email: string) {
  if (!userId || !email) {
    throw new Error('User ID and email are required');
  }

  // Check if user exists in public.users
  const { data: publicUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (publicUser) {
    // Update email in public.users if it doesn't match
    if (publicUser.email !== email) {
      await supabase
        .from('users')
        .update({ email })
        .eq('id', userId);
    }
  } else {
    // Create user in public.users if it doesn't exist
    await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name: email.split('@')[0] || 'User', // Default name from email
      });
  }

  // Check if user is in admins table
  const { data: adminUser } = await supabase
    .from('admins')
    .select('*')
    .eq('id', userId)
    .single();

  if (adminUser && adminUser.email !== email) {
    // Update email in admins if it doesn't match
    await supabase
      .from('admins')
      .update({ email })
      .eq('id', userId);
  }

  return { message: 'User data synchronized successfully' };
}