import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import FilterButton from '../components/ui/FilterButton';
import { getProducts } from '../lib/api';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category?.name === activeCategory);

  const categories = ['All', ...new Set(products.map(p => p.category?.name))];

  return (
    <AnimatedContainer>
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">Shop</h1>
        
        {/* Category filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {categories.map(category => (
              <FilterButton
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Products grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} variants={staggerItemVariants}>
                <ProductCardSkeleton />
              </motion.div>
            ))
          ) : (
            filteredProducts.map(product => (
              <motion.div key={product.id} variants={staggerItemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </motion.div>
        
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Shop;