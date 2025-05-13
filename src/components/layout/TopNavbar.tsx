import React from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCart } from '../../hooks/useCart';

interface TopNavbarProps {
  toggleSidebar: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar }) => {
  const { user } = useAuthContext();
  const { cartItemsCount } = useCart();

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
          
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-krosh-pink via-krosh-lavender to-krosh-blue bg-clip-text text-transparent">
              Krosh
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {user && (
            <span className="text-sm font-medium text-gray-700 hidden md:block truncate max-w-[200px]">
              {user.user_metadata?.name || user.email}
            </span>
          )}
          
          <Link 
            to="/cart" 
            className="p-2 rounded-full hover:bg-krosh-lavender/30 transition-colors relative"
          >
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-krosh-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;