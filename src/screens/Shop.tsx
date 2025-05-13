import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import FilterButton from '../components/ui/FilterButton';
import SectionHeader from '../components/ui/SectionHeader';
import { getProducts } from '../lib/api';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';
import { useLocation, useSearchParams } from 'react-router-dom';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Get category from URL params or location state
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    const categoryName = location.state?.categoryName;

    if (categorySlug && products.length > 0) {
      // Find the category name from the slug
      const category = products.find(p => p.category?.slug === categorySlug)?.category?.name;
      if (category) {
        setActiveCategory(category);
      } else if (categoryName) {
        setActiveCategory(categoryName);
      }
    } else if (categoryName) {
      setActiveCategory(categoryName);
    }
  }, [searchParams, products, location.state]);

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

  // Determine if we should show back button (if we came from categories)
  const showBackButton = location.state?.categoryName || searchParams.get('category');

  // Create title based on active category
  const title = activeCategory === 'All' ? 'Shop' : activeCategory;

  return (
    <AnimatedContainer>
      <div className="py-4">
        <SectionHeader
          title={title}
          showBackButton={!!showBackButton}
        />

        {/* Category filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {categories.map(category => (
              <FilterButton
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => {
                  setActiveCategory(category);
                  // Update URL without page reload
                  if (category === 'All') {
                    setSearchParams({});
                  } else {
                    const slug = products.find(p => p.category?.name === category)?.category?.slug;
                    if (slug) {
                      setSearchParams({ category: slug });
                    }
                  }
                }}
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