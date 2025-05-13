import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { signOut } from '../../lib/auth';

/**
 * Sidebar component for the admin section
 * This is separate from the main sidebar to keep admin functionality isolated
 */
const AdminSidebar: React.FC = () => {
  const { user, adminRole } = useAuthContext();
  const navigate = useNavigate();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin-access', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      name: 'Products', 
      path: '/admin-access/products', 
      icon: <Package size={20} /> 
    },
    { 
      name: 'Categories', 
      path: '/admin-access/categories', 
      icon: <ShoppingBag size={20} /> 
    },
    { 
      name: 'Users', 
      path: '/admin-access/users', 
      icon: <Users size={20} /> 
    },
    { 
      name: 'Orders', 
      path: '/admin-access/orders', 
      icon: <ClipboardList size={20} /> 
    },
    // Only show settings to superadmins
    ...(adminRole === 'superadmin' ? [
      { 
        name: 'Settings', 
        path: '/admin-access/settings', 
        icon: <Settings size={20} /> 
      }
    ] : [])
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="w-64 bg-white h-full shadow-md flex flex-col">
      {/* Logo and Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold bg-gradient-to-r from-krosh-pink via-krosh-lavender to-krosh-blue bg-clip-text text-transparent">
          Krosh Admin
        </h1>
        <div className="mt-2 flex items-center">
          <div className="w-8 h-8 rounded-full bg-krosh-lavender/30 flex items-center justify-center text-krosh-lavender font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium truncate max-w-[160px]">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{adminRole || 'Admin'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                   ${isActive
                     ? 'bg-krosh-lavender/30 text-krosh-text font-medium'
                     : 'hover:bg-krosh-lavender/10'}`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-red-50 text-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Back to Store Link */}
      <div className="p-4 text-center">
        <NavLink
          to="/"
          className="text-sm text-gray-500 hover:text-krosh-lavender transition-colors"
        >
          Back to Store
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
