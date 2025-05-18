import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ShoppingBag, Info, Package, ShoppingCart, X, LogOut, Grid3X3,
  Settings, ChevronDown, ChevronRight, HelpCircle, BookOpen, FileText
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { user, isAdmin, adminChecked, checkAdminStatus } = useAuthContext();
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [adminLinkChecked, setAdminLinkChecked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Check admin status when the user hovers over the sidebar
  useEffect(() => {
    const handleMouseEnter = async () => {
      if (user && !adminChecked) {
        await checkAdminStatus();
      }
    };

    const sidebarElement = document.getElementById('desktop-sidebar');
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

  // Fetch categories when the sidebar is opened
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Error in fetchCategories:', err);
    }
  };

  const baseMenuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag size={20} /> },
    {
      name: 'Categories',
      path: '/categories',
      icon: <Grid3X3 size={20} />,
      hasDropdown: true,
      dropdownItems: categories.map(category => ({
        name: category.name,
        path: `/shop?category=${category.slug}`,
        state: { categoryName: category.name }
      }))
    },
    { name: 'Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingCart size={20} /> },
    { name: 'About', path: '/about', icon: <Info size={20} /> },
    { name: 'Our Story', path: '/our-story', icon: <BookOpen size={20} /> },
    { name: 'FAQ', path: '/faq', icon: <HelpCircle size={20} /> },
    {
      name: 'Policies',
      path: '/terms',
      icon: <FileText size={20} />,
      hasDropdown: true,
      dropdownItems: [
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Shipping Policy', path: '/shipping' },
        { name: 'Return Policy', path: '/returns' }
      ]
    },
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

  // Sidebar content component to avoid duplication
  const SidebarContent = () => (
    <>
      <div className="pt-4 pr-4 pl-4 flex justify-between items-center mt-0">
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
              Yarn by Krosh
            </span>
          </div>
        </div>
        <button
          onClick={closeSidebar}
          className="p-2 rounded-full hover:bg-krosh-lavender/30 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-4 flex-1">
        <ul className="space-y-2 px-2">
          {menuItems.map(item => (
            <li key={item.name}>
              {item.hasDropdown ? (
                <div>
                  <button
                    onClick={() => setOpenDropdowns(prev => ({
                      ...prev,
                      [item.name]: !prev[item.name]
                    }))}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors hover:bg-krosh-lavender/10"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {openDropdowns[item.name] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {openDropdowns[item.name] && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.dropdownItems?.map(dropdownItem => (
                        <Link
                          key={dropdownItem.name}
                          to={dropdownItem.path}
                          state={dropdownItem.state}
                          onClick={closeSidebar}
                          className="block px-4 py-2 rounded-lg text-sm hover:bg-krosh-lavender/10 transition-colors"
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
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
              )}
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
    </>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar - always visible */}
      <div className="hidden md:block md:sticky md:pt-16 md:shadow-none">
        <div
          id="desktop-sidebar"
          className="h-full w-64 bg-white z-50 flex flex-col"
        >
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.4
            }}
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;