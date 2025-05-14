import { supabase } from './supabase';
import { CartItem } from '../contexts/CartContext';

interface CreateOrderParams {
  userId: string;
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: 'cod' | 'online';
  notes?: string;
}

export async function createOrder({
  userId,
  items,
  shippingAddress,
  paymentMethod,
  notes
}: CreateOrderParams) {
  try {
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          notes: notes || null
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error };
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        variant_id,
        quantity,
        price,
        products(name),
        product_variants(name, image_urls)
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      items: items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.products?.name || 'Unknown Product',
        variant_name: item.product_variants?.name || '',
        image_url: item.product_variants?.image_urls?.[0] || ''
      }))
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}
