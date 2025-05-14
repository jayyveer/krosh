import React from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCart } from '../../hooks/useCart';
import UserDropdown from '../ui/UserDropdown';

interface TopNavbarProps {
  toggleSidebar: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar }) => {
  const { user } = useAuthContext();
  const { cartItemsCount } = useCart();
  const location = useLocation();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-16 bg-white z-50 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto h-full flex items-center px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-krosh-lavender/30 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden border-2 border-krosh-lavender/30 shadow-sm">
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
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-krosh-text">Yarn by</span>
              <span className="text-xl font-semibold text-krosh-text">
                Krosh
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Cart Icon - Always first */}
          <Link
            to="/cart"
            className="p-2 rounded-full hover:bg-krosh-lavender/30 transition-colors relative"
          >
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-krosh-buttonPrimary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Login Button or User Dropdown */}
          {user ? (
            <UserDropdown
              userName={user.user_metadata?.name || ''}
              userEmail={user.email || ''}
            />
          ) : (
            <Link
              to="/login"
              state={{ from: location }} // Pass current location for redirect after login
              className="px-4 py-1.5 bg-krosh-buttonSecondary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;