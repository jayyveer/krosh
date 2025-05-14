import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

/**
 * Layout component for the admin section
 * This is separate from the main layout to keep admin functionality isolated
 */
const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, checkAdminStatus, adminChecked } = useAuthContext();
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white p-4 shadow-sm md:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-krosh-lavender/30 shadow-sm">
                <img
                  src="/images/yarn-by-krosh.jpeg"
                  alt="Yarn by Krosh Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error('Logo failed to load');
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="leading-tight">
                <span className="text-base font-medium text-krosh-text">
                  Yarn by Krosh Admin
                </span>
              </div>
            </div>
            <div className="w-8"></div> {/* Empty div for balance */}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
