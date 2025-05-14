import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showBackButton = true,
  onBackClick,
  rightContent
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <div className="flex items-center justify-between mb-3 relative">
      <div className="flex items-center">
        {showBackButton && (
          <motion.button
            onClick={handleBackClick}
            className="mr-3 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </motion.button>
        )}
        <motion.h1
          className="text-2xl font-bold text-gray-900" // Changed to black font
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h1>
      </div>

      {rightContent && (
        <div className="flex items-center">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
