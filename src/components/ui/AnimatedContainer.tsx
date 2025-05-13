import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { pageVariants } from '../../lib/animations';

interface AnimatedContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ 
  children, 
  className = '', 
  ...motionProps
}) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;