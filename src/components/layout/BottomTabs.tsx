import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Search, User, Grid3X3 } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomTabs: React.FC = () => {
  const tabs = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Categories', path: '/categories', icon: <Grid3X3 size={20} /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ul className="h-full grid grid-cols-5">
        {tabs.map(tab => (
          <li key={tab.name} className="h-full">
            <NavLink
              to={tab.path}
              className={({ isActive }) => `
                h-full flex flex-col items-center justify-center
                ${isActive ? 'text-krosh-lavender' : 'text-gray-500'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {tab.icon}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-1 bg-krosh-lavender rounded-t-full"
                        layoutId="bottomTabIndicator"
                      />
                    )}
                  </div>
                  <span className="text-xs mt-1">{tab.name}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default BottomTabs;