import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-6">Categories</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  if (error) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-6">Categories</h1>
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            {error}
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer>
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">Categories</h1>
        
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/shop?category=${category.slug}`}
                className="block"
              >
                <motion.div 
                  className="bg-white rounded-lg shadow-sm overflow-hidden h-full"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="aspect-square bg-krosh-lavender/20 relative">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-krosh-lavender/50">
                        <span className="text-lg font-medium">{category.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-center">{category.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Categories;
