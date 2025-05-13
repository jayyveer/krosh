import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import PromoSection from '../components/ui/PromoSection';
import { promoSections } from '../lib/dummyData';

const Home: React.FC = () => {
  return (
    <AnimatedContainer>
      <div className="py-6">
        <motion.div 
          className="rounded-xl bg-gradient-to-r from-krosh-lavender/70 to-krosh-pink/60 p-6 md:p-10 mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Welcome to Krosh
          </h1>
          <p className="text-base md:text-lg mb-6 max-w-xl">
            Discover our handpicked collection of premium yarns and crochet supplies.
            From beginner-friendly to advanced crafting, we have everything you need.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center bg-white text-krosh-text px-5 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-shadow"
          >
            <span>Shop Now</span>
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </motion.div>
        
        <div>
          {promoSections.map((section, index) => (
            <PromoSection
              key={section.id}
              title={section.title}
              description={section.description}
              imageUrl={section.imageUrl}
              linkText={section.linkText}
              index={index}
            />
          ))}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Home;