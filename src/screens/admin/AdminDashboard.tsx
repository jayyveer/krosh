import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, ClipboardList } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getAdminData } from '../../lib/api';

interface AdminCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, count, icon }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-krosh-lavender/30 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </div>
  </div>
);

/**
 * Admin Dashboard component
 * Shows overview statistics and recent activity
 */
const AdminDashboard: React.FC = () => {
  const { user, adminRole } = useAuthContext();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const adminData = await getAdminData();
      setData(adminData);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="px-3 py-1 bg-krosh-pink/20 rounded-full text-sm">
          {adminRole && <span className="font-medium capitalize">{adminRole}</span>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminCard
          title="Total Users"
          count={data?.userCount || 0}
          icon={<Users size={24} className="text-krosh-text" />}
        />
        <AdminCard
          title="Products"
          count={data?.productCount || 0}
          icon={<Package size={24} className="text-krosh-text" />}
        />
        <AdminCard
          title="Categories"
          count={data?.categoryCount || 0}
          icon={<ShoppingBag size={24} className="text-krosh-text" />}
        />
        <AdminCard
          title="Orders"
          count={data?.orderCount || 0}
          icon={<ClipboardList size={24} className="text-krosh-text" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
          <div className="space-y-4">
            {data?.recentUsers?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!data?.recentUsers || data.recentUsers.length === 0) && (
              <p className="text-gray-500">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {data?.recentOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">${order.total_amount}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                  order.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <p className="text-gray-500">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
