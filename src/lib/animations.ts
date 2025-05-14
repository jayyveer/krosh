import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// Card hover variants
export const cardVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Sidebar animation variants
export const sidebarVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.4,
    },
  },
  closed: {
    x: '-100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      duration: 0.4,
    },
  },
};

// Staggered container for lists/grids
export const staggerContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Child item variants for staggered animations
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};