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
import { supabase } from '../lib/supabase';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>(['All']);
  // Map to store category slug to name mapping for quick lookup
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  // Single effect to handle initial loading with optimized API calls
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    const categoryName = location.state?.categoryName;

    // First, load categories data (this is a lightweight call)
    const loadCategoriesData = async () => {
      try {
        // Get categories data from Supabase directly instead of loading all products
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: false });

        if (categoriesData) {
          // Create a map of categories for quick lookup
          const newCategoryMap = categoriesData.reduce((acc, cat) => {
            acc[cat.slug] = cat.name;
            // Also store reverse mapping for name to slug
            acc[cat.name] = cat.slug;
            return acc;
          }, {});

          // Store the category map in state for later use
          setCategoryMap(newCategoryMap);

          // Set categories for filter buttons
          const categoryNames = ['All', ...categoriesData.map(c => c.name)];
          setCategories(categoryNames);

          // Handle category from URL or state
          if (categorySlug) {
            console.log('Loading products with category slug from URL:', categorySlug);

            // Set active category from slug
            if (newCategoryMap[categorySlug]) {
              setActiveCategory(newCategoryMap[categorySlug]);
            } else if (categoryName) {
              setActiveCategory(categoryName);
            }

            // Load products with this category slug directly
            // No need to load all products first
            loadProductsByCategory(1, categorySlug);
          } else if (categoryName) {
            setActiveCategory(categoryName);

            // Find the slug from the category name
            const slug = categoriesData.find(c => c.name === categoryName)?.slug;
            if (slug) {
              loadProductsByCategory(1, slug);
            } else {
              // If no matching category, load all products
              loadProductsByCategory(1);
            }
          } else {
            // No category selected, load all products
            loadProductsByCategory(1);
          }
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        // Fallback to loading all products
        loadProductsByCategory(1);
      }
    };

    loadCategoriesData();
  }, [searchParams, location.state]);

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

  const loadMoreProducts = () => {
    if (!hasMore || loadingMore) return;

    // Get current category slug from the categoryMap
    const categorySlug = activeCategory !== 'All'
      ? categoryMap[activeCategory]
      : undefined;

    // Use the category-specific loading function
    loadProductsByCategory(page + 1, categorySlug);
  };

  // No need to filter products client-side anymore since we're filtering at the API level
  const filteredProducts = products;

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
        <div className="mb-5 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {categories.map(category => (
              <FilterButton
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => {
                  // Get the category slug from our map
                  let categorySlug: string | undefined;

                  if (category === 'All') {
                    categorySlug = undefined;
                    setSearchParams({});
                  } else {
                    // Use the categoryMap to get the slug directly
                    categorySlug = categoryMap[category];
                    if (categorySlug) {
                      setSearchParams({ category: categorySlug });
                    }
                  }

                  console.log(`Selecting category: ${category}, slug: ${categorySlug}`);

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
            Showing {filteredProducts.length} of {totalCount} products
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Shop;