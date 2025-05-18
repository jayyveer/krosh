import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/formatters';

// Define order status types and their corresponding UI elements
const orderStatusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  requested: {
    icon: <Clock size={16} />,
    color: 'text-amber-500',
    label: 'Pending'
  },
  approved: {
    icon: <CheckCircle size={16} />,
    color: 'text-green-500',
    label: 'Approved'
  },
  shipped: {
    icon: <Truck size={16} />,
    color: 'text-blue-500',
    label: 'Shipped'
  },
  delivered: {
    icon: <CheckCircle size={16} />,
    color: 'text-green-600',
    label: 'Delivered'
  },
  cancelled: {
    icon: <AlertCircle size={16} />,
    color: 'text-red-500',
    label: 'Cancelled'
  }
};

// Define the order interface
interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product_name: string;
  variant_name: string;
  image_url?: string;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const ordersLoadedRef = useRef(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    // Only fetch orders if they haven't been loaded yet
    if (!ordersLoadedRef.current) {
      fetchOrders();
      ordersLoadedRef.current = true;
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders for the current user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // For each order, fetch the order items
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
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
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;

          // Format the items data
          const formattedItems = itemsData.map(item => ({
            id: item.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.products?.name || 'Unknown Product',
            variant_name: item.product_variants?.name || '',
            image_url: item.product_variants?.image_urls?.[0] || ''
          }));

          return {
            ...order,
            items: formattedItems
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      // Add a slight delay before closing to allow the animation to complete
      setTimeout(() => {
        setExpandedOrderId(null);
      }, 50);
    } else {
      // If another order is already expanded, close it first
      if (expandedOrderId) {
        setExpandedOrderId(null);
        // Add a slight delay before opening the new one
        setTimeout(() => {
          setExpandedOrderId(orderId);
        }, 100);
      } else {
        setExpandedOrderId(orderId);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AnimatedContainer>
      <SectionHeader title="My Orders" />

      <div className="py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-krosh-lavender/30 border-t-krosh-lavender rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => {
                ordersLoadedRef.current = false;
                fetchOrders();
              }}
              className="mt-2 text-sm font-medium text-red-700 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-krosh-lavender/20 mb-4">
              <Package size={32} className="text-krosh-lavender" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-4 py-2 bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Order Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Order #{order.id.slice(-6)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-sm ${orderStatusConfig[order.status]?.color || 'text-gray-500'}`}>
                        {orderStatusConfig[order.status]?.icon || <Clock size={16} />}
                        {orderStatusConfig[order.status]?.label || 'Processing'}
                      </span>
                      <span className="text-sm font-medium">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedOrderId === order.id ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronRight
                      size={20}
                      className="text-gray-400"
                    />
                  </motion.div>
                </div>

                {/* Order Details */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedOrderId === order.id ? 'auto' : 0,
                    opacity: expandedOrderId === order.id ? 1 : 0
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.04, 0.62, 0.23, 0.98],
                    opacity: { duration: 0.3 }
                  }}
                  className="overflow-hidden border-t border-gray-100"
                >
                  <div className="p-4 bg-gray-50">
                    {/* Order Status Timeline */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Order Status</h4>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        {/* Timeline steps */}
                        <div className="space-y-6 relative">
                          {/* Requested step */}
                          <div className="flex items-start">
                            <div className={`relative z-10 rounded-full w-6 h-6 flex items-center justify-center ${
                              ['requested', 'approved', 'shipped', 'delivered'].includes(order.status)
                                ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              <CheckCircle size={14} className="text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">Order Placed</p>
                              <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                          </div>

                          {/* Approved step */}
                          <div className="flex items-start">
                            <div className={`relative z-10 rounded-full w-6 h-6 flex items-center justify-center ${
                              ['approved', 'shipped', 'delivered'].includes(order.status)
                                ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {['approved', 'shipped', 'delivered'].includes(order.status) ? (
                                <CheckCircle size={14} className="text-white" />
                              ) : (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">Order Confirmed</p>
                              <p className="text-xs text-gray-500">
                                {['approved', 'shipped', 'delivered'].includes(order.status)
                                  ? 'Your order has been confirmed'
                                  : 'Waiting for confirmation'}
                              </p>
                            </div>
                          </div>

                          {/* Shipped step */}
                          <div className="flex items-start">
                            <div className={`relative z-10 rounded-full w-6 h-6 flex items-center justify-center ${
                              ['shipped', 'delivered'].includes(order.status)
                                ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {['shipped', 'delivered'].includes(order.status) ? (
                                <Truck size={14} className="text-white" />
                              ) : (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">Order Shipped</p>
                              <p className="text-xs text-gray-500">
                                {['shipped', 'delivered'].includes(order.status)
                                  ? 'Your order is on the way'
                                  : 'Not shipped yet'}
                              </p>
                            </div>
                          </div>

                          {/* Delivered step */}
                          <div className="flex items-start">
                            <div className={`relative z-10 rounded-full w-6 h-6 flex items-center justify-center ${
                              order.status === 'delivered'
                                ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {order.status === 'delivered' ? (
                                <CheckCircle size={14} className="text-white" />
                              ) : (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">Order Delivered</p>
                              <p className="text-xs text-gray-500">
                                {order.status === 'delivered'
                                  ? 'Your order has been delivered'
                                  : 'Not delivered yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">{order.shipping_address}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <Package size={16} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product_name}</p>
                              {item.variant_name && (
                                <p className="text-xs text-gray-500">Variant: {item.variant_name}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm font-bold">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Orders;
