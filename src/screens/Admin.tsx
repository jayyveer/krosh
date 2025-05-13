import React, { useState, useEffect } from 'react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import { Users, Package, ShoppingBag, ClipboardList, Settings } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getAdminData } from '../lib/api';
import AdminDebug from '../components/admin/AdminDebug';

const AdminCard: React.FC<{ title: string; count: number; icon: React.ReactNode }> = ({
  title, count, icon
}) => (
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

const Admin: React.FC = () => {
  const { user, isAdmin, adminRole, loading: authLoading } = useAuthContext();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

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

  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Debug admin status
  console.log('Admin component - Auth status:', { user: !!user, isAdmin, adminRole });

  // TEMPORARY: Force admin access for debugging
  const forceAdmin = true; // Set this to false to restore normal behavior

  if (!user || (!isAdmin && !forceAdmin)) {
    console.log('Admin component - Redirecting to home because:', {
      noUser: !user,
      notAdmin: !isAdmin,
      forceAdmin
    });
    return <Navigate to="/" replace />;
  }

  if (forceAdmin && !isAdmin) {
    console.log('Admin component - FORCED ACCESS: Bypassing admin check for debugging');
  }

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer>
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
            >
              <Settings size={16} />
              {showDebug ? 'Hide Debug' : 'Debug'}
            </button>
            <div className="flex flex-col items-end">
              <span className="px-3 py-1 bg-krosh-pink/20 rounded-full text-sm">
                {user.email}
              </span>
              {adminRole && (
                <span className="mt-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  Role: {adminRole}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showDebug && <AdminDebug />}

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
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Admin;