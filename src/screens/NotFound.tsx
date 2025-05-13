import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedContainer from '../components/ui/AnimatedContainer';

const NotFound: React.FC = () => {
  return (
    <AnimatedContainer>
      <div className="py-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <span className="text-8xl font-bold bg-gradient-to-r from-krosh-pink via-krosh-lavender to-krosh-blue bg-clip-text text-transparent">
              404
            </span>
          </div>
        </motion.div>
        
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="px-6 py-2 bg-krosh-lavender text-krosh-text rounded-lg font-medium hover:opacity-90 transition-opacity inline-block"
        >
          Return Home
        </Link>
      </div>
    </AnimatedContainer>
  );
};

export default NotFound;