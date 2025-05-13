import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';

/**
 * Layout component for the admin section
 * This is separate from the main layout to keep admin functionality isolated
 */
const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, checkAdminStatus, adminChecked } = useAuthContext();
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Check admin status when component mounts
  useEffect(() => {
    const checkAdmin = async () => {
      if (user && !adminChecked) {
        setCheckingAdmin(true);
        await checkAdminStatus();
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [user, adminChecked, checkAdminStatus]);

  // Show loading state while checking authentication or admin status
  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-krosh-lavender border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not an admin
  if (adminChecked && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
