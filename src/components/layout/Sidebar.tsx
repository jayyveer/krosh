import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Search, Info, Package, ShoppingCart, X, LogOut, Grid3X3, Settings } from 'lucide-react';
import { sidebarVariants } from '../../lib/animations';
import { useAuthContext } from '../../contexts/AuthContext';
import { signOut } from '../../lib/auth';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { user, isAdmin, adminChecked, checkAdminStatus } = useAuthContext();
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [adminLinkChecked, setAdminLinkChecked] = useState(false);

  // Check admin status when the user hovers over the sidebar
  // This is a simple way to lazy-load the admin status without affecting performance
  useEffect(() => {
    const handleMouseEnter = async () => {
      if (user && !adminChecked) {
        await checkAdminStatus();
      }
    };

    const sidebarElement = document.getElementById('main-sidebar');
    if (sidebarElement) {
      sidebarElement.addEventListener('mouseenter', handleMouseEnter);
      return () => {
        sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
      };
    }
  }, [user, adminChecked, checkAdminStatus]);

  // Update showAdminLink when isAdmin or adminChecked changes
  useEffect(() => {
    if (adminChecked) {
      setShowAdminLink(isAdmin);
      setAdminLinkChecked(true);
    }
  }, [isAdmin, adminChecked]);

  const baseMenuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag size={20} /> },
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Categories', path: '/categories', icon: <Grid3X3 size={20} /> },
    { name: 'Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingCart size={20} /> },
    { name: 'About', path: '/about', icon: <Info size={20} /> },
  ];

  // Only add admin link if we've checked and the user is an admin
  const menuItems = [
    ...baseMenuItems,
    ...(showAdminLink ? [{ name: 'Admin', path: '/admin-access', icon: <Settings size={20} /> }] : []),
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      closeSidebar();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <motion.div
        id="main-sidebar"
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg pt-16
                   md:pt-16 md:sticky md:shadow-none flex flex-col
                   ${isOpen ? 'block' : 'hidden md:block'}`}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        <div className="p-4 flex justify-between items-center md:hidden">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-krosh-lavender/30"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-2 flex-1">
          <ul className="space-y-2 px-2">
            {menuItems.map(item => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
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

        {/* Logout button at the bottom of sidebar */}
        {user && (
          <div className="mt-auto p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Sidebar;