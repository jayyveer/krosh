import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import FilterButton from '../components/ui/FilterButton';
import ProductCard from '../components/ui/ProductCard';
import { dummyProducts, colorFilters, weightFilters } from '../lib/dummyData';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeColorFilter, setActiveColorFilter] = useState('All Colors');
  const [activeWeightFilter, setActiveWeightFilter] = useState('All Weights');

  // Filter products by search term and selected filters
  const filteredProducts = dummyProducts.filter(product => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Color filter
    const matchesColor = activeColorFilter === 'All Colors' || 
      product.color === activeColorFilter;
    
    // Weight filter
    const matchesWeight = activeWeightFilter === 'All Weights' || 
      product.weight === activeWeightFilter;
    
    return matchesSearch && matchesColor && matchesWeight;
  });

  return (
    <AnimatedContainer>
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-gray-700 bg-white border rounded-full focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <SearchIcon size={20} />
          </div>
        </div>
        
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div>
            <h3 className="text-sm font-medium mb-2">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {colorFilters.map(color => (
                <FilterButton
                  key={color}
                  label={color}
                  active={activeColorFilter === color}
                  onClick={() => setActiveColorFilter(color)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Weight</h3>
            <div className="flex flex-wrap gap-2">
              {weightFilters.map(weight => (
                <FilterButton
                  key={weight}
                  label={weight}
                  active={activeWeightFilter === weight}
                  onClick={() => setActiveWeightFilter(weight)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div>
          <h2 className="font-medium text-lg mb-4">
            Results ({filteredProducts.length})
          </h2>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
          >
            {filteredProducts.map(product => (
              <motion.div key={product.id} variants={staggerItemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Search;