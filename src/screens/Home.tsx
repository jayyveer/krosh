import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag, BookOpen, Scissors, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import PromoSection from '../components/ui/PromoSection';
import { promoSections } from '../lib/dummyData';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discounted_price?: number;
  category_id: string;
  size?: string;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  color?: string;
  stock: number;
  image_urls?: string[];
}

const Home: React.FC = () => {
  const [beginnerProducts, setBeginnerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeginnerProducts = async () => {
      try {
        setLoading(true);
        // Fetch products with "beginner" in the name or description
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name, slug),
            variants:product_variants(*)
          `)
          .or('name.ilike.%beginner%,description.ilike.%beginner%,name.ilike.%starter%,description.ilike.%starter%')
          .limit(4);

        if (error) throw error;

        if (data && data.length > 0) {
          setBeginnerProducts(data);
        } else {
          // If no beginner products found, fetch any products
          const { data: anyProducts } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(name, slug),
              variants:product_variants(*)
            `)
            .limit(4);

          if (anyProducts) {
            setBeginnerProducts(anyProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching beginner products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeginnerProducts();
  }, []);

  return (
    <AnimatedContainer>
      <div className="py-6">
        {/* Hero Section */}
        <motion.div
          className="rounded-xl bg-gradient-to-r from-krosh-lavender/70 to-krosh-pink/60 p-6 md:p-10 mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Welcome to Yarn by Krosh
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

        {/* Beginner's Kit Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-krosh-text flex items-center">
              <Heart size={24} className="text-krosh-pink mr-2" />
              Beginner's Kit
            </h2>
            <Link
              to="/shop"
              className="text-krosh-lavender hover:underline flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <p className="text-gray-600 mb-6">
            Everything you need to start your crochet journey. Perfect for beginners!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              beginnerProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))
            )}
          </div>
        </motion.section>

        {/* Crocheting Information Section */}
        <motion.section
          className="mb-16 bg-white rounded-xl shadow-sm p-6 md:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-6">
            <BookOpen size={24} className="text-krosh-lavender mr-2" />
            <h2 className="text-2xl font-bold text-krosh-text">Crocheting 101</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <p className="text-gray-600 mb-4">
                New to crocheting? Don't worry! It's an easy craft to learn with the right tools and guidance.
                Here are some tips to help you get started on your crocheting journey:
              </p>

              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-krosh-lavender/20 text-krosh-lavender rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                  <span>Start with a beginner-friendly yarn like cotton or acrylic</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-krosh-lavender/20 text-krosh-lavender rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                  <span>Choose a medium-sized hook (5-6mm) for your first projects</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-krosh-lavender/20 text-krosh-lavender rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                  <span>Learn basic stitches: chain, single crochet, and double crochet</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-krosh-lavender/20 text-krosh-lavender rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                  <span>Practice with simple projects like dishcloths or scarves</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Essential Tools</h3>
              <p className="text-gray-600 mb-4">
                Having the right tools makes crocheting more enjoyable. Here's what you'll need:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-krosh-lavender/10 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Scissors size={18} className="text-krosh-lavender mr-2" />
                    <h4 className="font-medium">Yarn</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Medium weight yarn is best for beginners
                  </p>
                </div>

                <div className="bg-krosh-lavender/10 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Scissors size={18} className="text-krosh-lavender mr-2" />
                    <h4 className="font-medium">Hooks</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Aluminum or ergonomic hooks in various sizes
                  </p>
                </div>

                <div className="bg-krosh-lavender/10 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Scissors size={18} className="text-krosh-lavender mr-2" />
                    <h4 className="font-medium">Scissors</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sharp scissors for cutting yarn cleanly
                  </p>
                </div>

                <div className="bg-krosh-lavender/10 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Scissors size={18} className="text-krosh-lavender mr-2" />
                    <h4 className="font-medium">Stitch Markers</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    To mark your place in patterns
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center bg-krosh-lavender text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={16} className="mr-2" />
              <span>Shop Beginner Supplies</span>
            </Link>
          </div>
        </motion.section>

        {/* Promo Sections */}
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