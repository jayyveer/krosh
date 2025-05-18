import React from 'react';
import { motion } from 'framer-motion';
import AnimatedContainer from '../ui/AnimatedContainer';
import SectionHeader from '../ui/SectionHeader';

interface PolicyPageProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

const PolicyPage: React.FC<PolicyPageProps> = ({ title, lastUpdated, children }) => {
  return (
    <AnimatedContainer>
      <div className="py-6">
        <SectionHeader title={title} showBackButton={true} />
        
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {lastUpdated && (
            <p className="text-sm text-gray-500 mb-6">Last Updated: {lastUpdated}</p>
          )}
          
          <div className="prose max-w-none text-gray-700">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatedContainer>
  );
};

export default PolicyPage;
