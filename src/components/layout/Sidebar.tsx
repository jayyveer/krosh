import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Search, Info, Package, ShoppingCart, X } from 'lucide-react';
import { sidebarVariants } from '../../lib/animations';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const menuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag size={20} /> },
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'About', path: '/about', icon: <Info size={20} /> },
    { name: 'Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingCart size={20} /> },
  ];

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
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg pt-16
                   md:pt-16 md:sticky md:shadow-none 
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
        
        <nav className="mt-2">
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
      </motion.div>
    </>
  );
};

export default Sidebar;