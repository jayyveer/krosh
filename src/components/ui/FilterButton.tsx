import React from 'react';
import { motion } from 'framer-motion';

interface FilterButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  label, 
  active = false, 
  onClick 
}) => {
  return (
    <motion.button
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative
                ${active 
                  ? 'bg-krosh-lavender text-krosh-text' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeFilterIndicator"
          className="absolute inset-0 bg-krosh-lavender rounded-full -z-10"
        />
      )}
    </motion.button>
  );
};

export default FilterButton;