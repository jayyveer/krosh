import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  Eye,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_urls: string[] | null;
  };
  variant?: {
    name: string;
  };
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, image_urls),
          variant:product_variants(name)
        `)
        .eq('order_id', orderId);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching order items:', err);
      return [];
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const items = await fetchOrderItems(order.id);
      setSelectedOrder({ ...order, items });
      setShowOrderDetails(true);
    } catch (err) {
      console.error('Error viewing order:', err);
      showToast('Failed to load order details', 'error');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, status }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      showToast(`Order status updated to ${status}`, 'success');
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Failed to update order status', 'error');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <Clock size={12} />
            <span>Pending</span>
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <CheckCircle size={12} />
            <span>Approved</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            <Truck size={12} />
            <span>Shipped</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <Package size={12} />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <XCircle size={12} />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders
    .filter(order =>
      (statusFilter === 'all' || order.status === statusFilter) &&
      (searchTerm === '' ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
          <button
            className="ml-2 text-red-800 font-medium"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search orders by ID, customer name, or email"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 border-4 border-krosh-lavender border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{order.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{order.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Order"
                        >
                          <Eye size={16} />
                        </button>

                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve Order"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {order.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Mark as Shipped"
                          >
                            <Truck size={16} />
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Mark as Delivered"
                          >
                            <Package size={16} />
                          </button>
                        )}

                        {(order.status === 'pending' || order.status === 'approved') && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Cancel Order"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-gray-500">Order ID: {selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <p className="text-sm">{selectedOrder.user?.name}</p>
                  <p className="text-sm">{selectedOrder.user?.email}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <p className="text-sm">Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p className="text-sm">Status: {selectedOrder.status}</p>
                  <p className="text-sm">Total: ${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-sm whitespace-pre-line">{selectedOrder.shipping_address}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Variant</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {item.product?.image_urls?.[0] ? (
                                <img
                                  src={item.product.image_urls[0]}
                                  alt={item.product?.name}
                                  className="w-10 h-10 rounded object-cover mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                                  <Package size={16} className="text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm">{item.product?.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.variant?.name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Total: ${selectedOrder.total.toFixed(2)}</h3>
                </div>

                <div className="flex gap-2">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'approved');
                          setShowOrderDetails(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve Order
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'cancelled');
                          setShowOrderDetails(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'approved' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'shipped');
                        setShowOrderDetails(false);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Mark as Shipped
                    </button>
                  )}

                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'delivered');
                        setShowOrderDetails(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
