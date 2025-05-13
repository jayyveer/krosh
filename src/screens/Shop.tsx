import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import FilterButton from '../components/ui/FilterButton';
import SectionHeader from '../components/ui/SectionHeader';
import { getProducts, getAllProducts } from '../lib/api';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';
import { useLocation, useSearchParams } from 'react-router-dom';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Get category from URL params or location state
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    const categoryName = location.state?.categoryName;

    if (categorySlug && allProducts.length > 0) {
      // Find the category name from the slug
      const category = allProducts.find(p => p.category?.slug === categorySlug)?.category?.name;
      if (category) {
        setActiveCategory(category);
      } else if (categoryName) {
        setActiveCategory(categoryName);
      }
    } else if (categoryName) {
      setActiveCategory(categoryName);
    }
  }, [searchParams, allProducts, location.state]);

  // Load initial products
  useEffect(() => {
    loadProducts();
    // Also load all products for category filtering
    loadAllProducts();
  }, []);

  // Function to load products with the current active category
  async function loadProducts(pageNum = 1) {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get category slug if not "All"
      const categorySlug = activeCategory !== 'All'
        ? allProducts.find(p => p.category?.name === activeCategory)?.category?.slug
        : undefined;

      // Pass category slug to API for server-side filtering
      const result = await getProducts(pageNum, 10, categorySlug);

      if (pageNum === 1) {
        setProducts(result.data);
      } else {
        setProducts(prev => [...prev, ...result.data]);
      }

      setTotalCount(result.count);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Function to load products with a specific category slug
  // This avoids the issue with stale state when changing categories
  async function loadProductsByCategory(pageNum = 1, categorySlug?: string) {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log('Loading products with category slug:', categorySlug);

      // Pass the provided category slug directly to API
      const result = await getProducts(pageNum, 10, categorySlug);

      if (pageNum === 1) {
        setProducts(result.data);
      } else {
        setProducts(prev => [...prev, ...result.data]);
      }

      setTotalCount(result.count);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function loadAllProducts() {
    try {
      const data = await getAllProducts();
      setAllProducts(data);
    } catch (err) {
      console.error('Failed to load all products for filtering:', err);
    }
  }

  const loadMoreProducts = () => {
    if (!hasMore || loadingMore) return;
    loadProducts(page + 1);
  };

  // No need to filter products client-side anymore since we're filtering at the API level
  const filteredProducts = products;

  // Use allProducts for category list to ensure all categories are shown
  const categories = ['All', ...new Set(allProducts.map(p => p.category?.name))];

  // Create title based on active category
  const title = activeCategory === 'All' ? 'Shop' : activeCategory;

  return (
    <AnimatedContainer>
      <div className="py-4">
        <SectionHeader
          title={title}
          showBackButton={true} // Always show back button
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
                  // Get the category slug first
                  let categorySlug: string | undefined;

                  if (category === 'All') {
                    categorySlug = undefined;
                    setSearchParams({});
                  } else {
                    categorySlug = allProducts.find(p => p.category?.name === category)?.category?.slug;
                    if (categorySlug) {
                      setSearchParams({ category: categorySlug });
                    }
                  }

                  // Reset products and update state
                  setProducts([]);
                  setPage(1);
                  setActiveCategory(category);

                  // Load products with the correct category slug
                  // Instead of using activeCategory which hasn't updated yet
                  loadProductsByCategory(1, categorySlug);
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

        {/* Load More Button */}
        {!loading && hasMore && filteredProducts.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className="px-6 py-2 bg-krosh-blue text-white rounded-lg shadow-sm hover:bg-krosh-blue/90 transition-colors disabled:opacity-70"
            >
              {loadingMore ? 'Loading...' : 'Load More Products'}
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={`more-${i}`} />
              ))}
            </div>
          </div>
        )}

        {/* Products Count */}
        {!loading && filteredProducts.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-6">
            Showing {filteredProducts.length} of {activeCategory === 'All' ? totalCount : allProducts.filter(p => p.category?.name === activeCategory).length} products
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Shop;