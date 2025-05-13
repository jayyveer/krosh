import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cardVariants } from '../../lib/animations';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const defaultVariant = product.variants?.[0];
  const inStock = defaultVariant?.stock > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      // Use the addToCart function from useCart hook which updates Redux state
      addToCart(product.id, defaultVariant.id, 1);
      showToast('Added to cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
    >
      <Link to={`/product/${product.id}`} className="block h-48 overflow-hidden">
        <img
          src={product.image_urls?.[0] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <span className="text-xs text-gray-500">{product.category?.name}</span>
          <h3 className="font-medium text-base mb-1">{product.name}</h3>
          <p className="font-semibold text-lg mb-2">${Number(product.price).toFixed(2)}</p>

          {defaultVariant && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="text-xs bg-krosh-lavender/20 px-2 py-1 rounded-full">
                {defaultVariant.color}
              </span>
              <span className="text-xs bg-krosh-pink/20 px-2 py-1 rounded-full">
                {defaultVariant.weight}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          {inStock ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : (
            <span className="text-xs text-red-500">Out of Stock</span>
          )}

          <motion.button
            className={`p-2 rounded-full ${inStock ? 'bg-krosh-blue/20 text-krosh-text' : 'bg-gray-100 text-gray-400'}`}
            whileTap={{ scale: 0.95 }}
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;