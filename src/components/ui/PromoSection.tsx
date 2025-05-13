import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromoSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  linkText: string;
  index: number;
}

const PromoSection: React.FC<PromoSectionProps> = ({ 
  title, description, imageUrl, linkText, index 
}) => {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div 
      className={`rounded-xl overflow-hidden my-8 bg-white shadow-sm
                ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} 
                flex flex-col md:h-64`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="md:w-1/2 h-52 md:h-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="md:w-1/2 p-6 flex flex-col justify-center">
        <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center text-krosh-text font-medium hover:underline w-fit group"
        >
          {linkText}
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            className="inline-block ml-1"
          >
            <ChevronRight size={16} />
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};

export default PromoSection;