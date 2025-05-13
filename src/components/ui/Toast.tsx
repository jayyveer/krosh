import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed top-20 right-4 py-2 px-3 rounded-lg shadow-lg flex items-center gap-2 max-w-xs z-50 ${
          type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        )}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200/50 rounded-full transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;