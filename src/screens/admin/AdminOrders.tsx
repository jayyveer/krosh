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
  Filter,
  Calendar,
  AlertCircle,
  CreditCard,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/formatters';
import { useToast } from '../../contexts/ToastContext';

interface Order {
  id: string;
  user_id: string;
  status: 'requested' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  total_amount: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  payment_method: 'cod' | 'online';
  payment_status: 'pending' | 'paid' | 'failed';
  tracking_number?: string;
  notes?: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  items?: OrderItem[];
  status_history?: StatusHistoryItem[];
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
    image_urls?: string[] | null;
  };
}

interface StatusHistoryItem {
  id: string;
  order_id: string;
  status: Order['status'];
  notes?: string;
  created_at: string;
  created_by?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<{from: string, to: string}>({
    from: '',
    to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>;
    message: string;
  } | null>(null);

  // Order statistics
  const [orderStats, setOrderStats] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage] = useState(10);

  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, statusFilter, paymentMethodFilter]);

  const fetchOrderStats = async () => {
    try {
      // Fetch order counts by status
      const { data, error } = await supabase
        .rpc('get_order_stats');

      if (error) {
        console.error('Error fetching order stats:', error);
        // Fallback: count orders manually if the RPC function doesn't exist
        const { data: orders, error: countError } = await supabase
          .from('orders')
          .select('status');

        if (countError) throw countError;

        const stats = {
          total: orders?.length || 0,
          requested: orders?.filter(o => o.status === 'requested').length || 0,
          approved: orders?.filter(o => o.status === 'approved').length || 0,
          shipped: orders?.filter(o => o.status === 'shipped').length || 0,
          delivered: orders?.filter(o => o.status === 'delivered').length || 0,
          cancelled: orders?.filter(o => o.status === 'cancelled').length || 0
        };

        setOrderStats(stats);
        return;
      }

      // If RPC function exists, use its data
      if (data) {
        setOrderStats(data);
      }
    } catch (err) {
      console.error('Error in fetchOrderStats:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Calculate range for pagination
      const from = (currentPage - 1) * ordersPerPage;
      const to = from + ordersPerPage - 1;

      // Start building the query
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:users(name, email, phone)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters if they are set
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (paymentMethodFilter !== 'all') {
        query = query.eq('payment_method', paymentMethodFilter);
      }

      if (dateFilter.from) {
        query = query.gte('created_at', dateFilter.from);
      }

      if (dateFilter.to) {
        // Add one day to include the end date fully
        const endDate = new Date(dateFilter.to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }

      // Apply pagination
      query = query.range(from, to);

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      setOrders(data || []);
      setTotalOrders(count || 0);
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

  const fetchOrderStatusHistory = async (orderId: string) => {
    try {
      // Check if the status_history table exists
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching order status history:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching order status history:', err);
      return [];
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const items = await fetchOrderItems(order.id);
      const statusHistory = await fetchOrderStatusHistory(order.id);

      setSelectedOrder({
        ...order,
        items,
        status_history: statusHistory
      });

      // Reset form fields
      setTrackingNumber(order.tracking_number || '');
      setOrderNotes(order.notes || '');

      setShowOrderDetails(true);
    } catch (err) {
      console.error('Error viewing order:', err);
      showToast('Failed to load order details', 'error');
    }
  };

  const confirmStatusUpdate = (orderId: string, status: Order['status']) => {
    setConfirmAction({
      action: async () => {
        await updateOrderStatus(orderId, status);
      },
      message: `Are you sure you want to update this order status to ${status}?`
    });
    setShowConfirmation(true);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // First update the order status
      const updateData: any = { status };

      // Add tracking number if provided and status is shipped
      if (status === 'shipped' && trackingNumber.trim()) {
        updateData.tracking_number = trackingNumber.trim();
      }

      // Add notes if provided
      if (orderNotes.trim()) {
        updateData.notes = orderNotes.trim();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Then add an entry to the status history if the table exists
      try {
        await supabase
          .from('order_status_history')
          .insert([{
            order_id: orderId,
            status,
            notes: orderNotes.trim() || null,
            created_at: new Date().toISOString()
          }]);
      } catch (historyError) {
        // If the table doesn't exist, just log the error but don't fail the operation
        console.warn('Could not update status history:', historyError);
      }

      // Update local state
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, status, ...updateData }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        // Fetch the updated status history
        const statusHistory = await fetchOrderStatusHistory(orderId);

        setSelectedOrder({
          ...selectedOrder,
          status,
          ...updateData,
          status_history: statusHistory
        });
      }

      showToast(`Order status updated to ${status}`, 'success');
      setShowConfirmation(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Failed to update order status', 'error');
      setShowConfirmation(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    confirmStatusUpdate(orderId, status);
  };

  // Define status configuration for consistent styling and labels
  const statusConfig = {
    requested: {
      label: 'Pending',
      icon: <Clock size={12} />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
    },
    approved: {
      label: 'Approved',
      icon: <CheckCircle size={12} />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
    },
    shipped: {
      label: 'Shipped',
      icon: <Truck size={12} />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
    },
    delivered: {
      label: 'Delivered',
      icon: <Package size={12} />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      buttonColor: 'bg-green-500 hover:bg-green-600',
    },
    cancelled: {
      label: 'Cancelled',
      icon: <XCircle size={12} />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      buttonColor: 'bg-red-500 hover:bg-red-600',
    }
  };

  const getStatusBadge = (status: Order['status'], size: 'sm' | 'md' | 'lg' = 'sm') => {
    const config = statusConfig[status];
    if (!config) return null;

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    return (
      <span className={`flex items-center gap-1 ${config.bgColor} ${config.textColor} rounded-full ${sizeClasses[size]}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  // Apply client-side search filtering
  const filteredOrders = orders
    .filter(order =>
      searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.phone && order.user.phone.includes(searchTerm))
    );

  // Calculate pagination info
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders Management</h1>

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

      {/* Order Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div
          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400 ${
            statusFilter === 'all' ? 'ring-2 ring-krosh-lavender' : ''
          }`}
          onClick={() => {
            setStatusFilter('all');
            setCurrentPage(1);
          }}
          role="button"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">All Orders</p>
              <p className="text-2xl font-bold">{orderStats.total}</p>
            </div>
            <ShoppingBag className="text-gray-400" size={24} />
          </div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${statusConfig.requested.borderColor} ${
            statusFilter === 'requested' ? 'ring-2 ring-krosh-lavender' : ''
          }`}
          onClick={() => {
            setStatusFilter('requested');
            setCurrentPage(1);
          }}
          role="button"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{orderStats.requested}</p>
            </div>
            <Clock className={statusConfig.requested.textColor} size={24} />
          </div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${statusConfig.approved.borderColor} ${
            statusFilter === 'approved' ? 'ring-2 ring-krosh-lavender' : ''
          }`}
          onClick={() => {
            setStatusFilter('approved');
            setCurrentPage(1);
          }}
          role="button"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold">{orderStats.approved}</p>
            </div>
            <CheckCircle className={statusConfig.approved.textColor} size={24} />
          </div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${statusConfig.shipped.borderColor} ${
            statusFilter === 'shipped' ? 'ring-2 ring-krosh-lavender' : ''
          }`}
          onClick={() => {
            setStatusFilter('shipped');
            setCurrentPage(1);
          }}
          role="button"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipped</p>
              <p className="text-2xl font-bold">{orderStats.shipped}</p>
            </div>
            <Truck className={statusConfig.shipped.textColor} size={24} />
          </div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${statusConfig.delivered.borderColor} ${
            statusFilter === 'delivered' ? 'ring-2 ring-krosh-lavender' : ''
          }`}
          onClick={() => {
            setStatusFilter('delivered');
            setCurrentPage(1);
          }}
          role="button"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold">{orderStats.delivered}</p>
            </div>
            <Package className={statusConfig.delivered.textColor} size={24} />
          </div>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${statusConfig.cancelled.borderColor} ${
            statusFilter === 'cancelled' ? 'ring-2 ring-krosh-lavender' : ''
          }`}
          onClick={() => {
            setStatusFilter('cancelled');
            setCurrentPage(1);
          }}
          role="button"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold">{orderStats.cancelled}</p>
            </div>
            <XCircle className={statusConfig.cancelled.textColor} size={24} />
          </div>
        </div>
      </div>

      {/* Search and Basic Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search orders by ID, customer name, email, or phone"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter size={18} className="text-gray-600" />
            <span>Filters</span>
          </button>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page when filter changes
            }}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Pending</option>
            <option value="approved">Approved</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Methods</option>
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                // Apply date filters
                setCurrentPage(1); // Reset to first page
                fetchOrders();
              }}
              className="px-4 py-2 bg-krosh-lavender text-white rounded-lg hover:bg-krosh-lavender/80"
            >
              Apply Filters
            </button>

            <button
              onClick={() => {
                // Reset all filters
                setStatusFilter('all');
                setPaymentMethodFilter('all');
                setDateFilter({ from: '', to: '' });
                setCurrentPage(1);
                fetchOrders();
              }}
              className="ml-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

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
          <>
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
                        {formatPrice(order.total || order.total_amount)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * ordersPerPage + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        // If 5 or fewer pages, show all
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        // If near start, show first 5 pages
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        // If near end, show last 5 pages
                        pageNum = totalPages - 4 + i;
                      } else {
                        // Otherwise show 2 before and 2 after current page
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-krosh-lavender text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

              {/* Order Status Badge and Dropdown */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Current Status</p>
                  <div className="inline-block">
                    {getStatusBadge(selectedOrder.status, 'md')}
                  </div>
                </div>

                <div className="flex-1 md:max-w-xs">
                  <p className="text-sm font-medium text-gray-500 mb-1">Update Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Order['status'];
                      if (newStatus !== selectedOrder.status) {
                        handleUpdateStatus(selectedOrder.id, newStatus);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="requested" disabled={selectedOrder.status !== 'requested'}>Pending</option>
                    <option value="approved" disabled={selectedOrder.status !== 'requested' && selectedOrder.status !== 'approved'}>Approved</option>
                    <option value="shipped" disabled={selectedOrder.status !== 'approved' && selectedOrder.status !== 'shipped'}>Shipped</option>
                    <option value="delivered" disabled={selectedOrder.status !== 'shipped' && selectedOrder.status !== 'delivered'}>Delivered</option>
                    <option value="cancelled" disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm mb-1"><span className="font-medium">Name:</span> {selectedOrder.user?.name}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Email:</span> {selectedOrder.user?.email}</p>
                    {selectedOrder.user?.phone && (
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.user.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm mb-1"><span className="font-medium">Created:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Last Updated:</span> {formatDate(selectedOrder.updated_at || selectedOrder.created_at)}</p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Payment Method:</span> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Payment Status:</span> {selectedOrder.payment_status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{selectedOrder.shipping_address}</p>
                  </div>
                </div>

                {selectedOrder.status === 'shipped' && (
                  <div>
                    <h3 className="font-medium mb-2">Tracking Information</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {selectedOrder.tracking_number ? (
                        <p className="text-sm"><span className="font-medium">Tracking Number:</span> {selectedOrder.tracking_number}</p>
                      ) : (
                        <p className="text-sm text-gray-500">No tracking information available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Status History</h3>
                  <div className="border-l-2 border-gray-200 ml-3 pl-4 space-y-6">
                    {selectedOrder.status_history.map((history, index) => {
                      const config = statusConfig[history.status as keyof typeof statusConfig] || statusConfig.requested;
                      return (
                        <div key={history.id || index} className="relative">
                          <div className={`absolute -left-7 mt-1 w-5 h-5 rounded-full ${config.bgColor} ${config.borderColor} border-2 flex items-center justify-center`}>
                            <div className="text-xs">{config.icon}</div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className={`text-sm font-medium ${config.textColor}`}>{config.label}</p>
                              {index === 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Latest</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(history.created_at)}</p>
                            {history.notes && (
                              <div className="mt-2 bg-gray-50 p-2 rounded-lg border-l-2 border-gray-300">
                                <p className="text-sm">{history.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
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
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {item.product?.image_urls?.[0] || item.variant?.image_urls?.[0] ? (
                                <img
                                  src={item.variant?.image_urls?.[0] || item.product?.image_urls?.[0]}
                                  alt={item.product?.name}
                                  className="w-12 h-12 rounded-md object-cover mr-3 border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                                  <Package size={18} className="text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm font-medium">{item.product?.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.variant?.name ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {item.variant.name}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium">Subtotal:</td>
                        <td className="px-4 py-3 font-medium">{formatPrice(selectedOrder.total || selectedOrder.total_amount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium">Shipping:</td>
                        <td className="px-4 py-3 font-medium">₹0.00</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-medium text-lg">Total:</td>
                        <td className="px-4 py-3 font-medium text-lg text-krosh-lavender">{formatPrice(selectedOrder.total || selectedOrder.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes and Tracking Number Input */}
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'approved') && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Update Order</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.status === 'approved' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Enter tracking number"
                        />
                      </div>
                    )}
                    <div className={selectedOrder.status === 'approved' ? '' : 'md:col-span-2'}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Add notes about this order"
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="text-xl font-bold text-krosh-lavender">{formatPrice(selectedOrder.total || selectedOrder.total_amount)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'approved')}
                          className={`px-4 py-2 ${statusConfig.approved.buttonColor} text-white rounded-lg flex items-center gap-2`}
                        >
                          <CheckCircle size={16} />
                          Approve Order
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                          className={`px-4 py-2 ${statusConfig.cancelled.buttonColor} text-white rounded-lg flex items-center gap-2`}
                        >
                          <XCircle size={16} />
                          Cancel Order
                        </button>
                      </>
                    )}

                    {selectedOrder.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                        className={`px-4 py-2 ${statusConfig.shipped.buttonColor} text-white rounded-lg flex items-center gap-2`}
                      >
                        <Truck size={16} />
                        Mark as Shipped
                      </button>
                    )}

                    {selectedOrder.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                        className={`px-4 py-2 ${statusConfig.delivered.buttonColor} text-white rounded-lg flex items-center gap-2`}
                      >
                        <Package size={16} />
                        Mark as Delivered
                      </button>
                    )}

                    <button
                      onClick={() => setShowOrderDetails(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="mb-4">
              <AlertCircle size={32} className="text-amber-500 mb-2" />
              <h3 className="text-lg font-bold">Confirm Action</h3>
              <p className="text-gray-600 mt-1">{confirmAction.message}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await confirmAction.action();
                }}
                className="px-4 py-2 bg-krosh-lavender text-white rounded-lg hover:bg-krosh-lavender/80"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
