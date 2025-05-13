import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Tag } from 'lucide-react';
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
  const { addToCart, removeFromCart, cartItems } = useCart();
  const defaultVariant = product.variants?.find((v: any) => v.id === product.default_variant_id) || product.variants?.[0];
  const inStock = defaultVariant?.stock > 0;

  // Check if product is already in cart
  const isInCart = cartItems.some(item =>
    item.product.id === product.id && item.variant.id === defaultVariant?.id
  );

  // Calculate discount percentage if original_price exists
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Find the cart item to remove
      const cartItem = cartItems.find(item =>
        item.product.id === product.id && item.variant.id === defaultVariant?.id
      );

      if (cartItem) {
        removeFromCart(cartItem.id);
        showToast('Removed from cart');
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      showToast('Failed to remove from cart', 'error');
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
      >
        {/* Image container with overlays */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={defaultVariant?.image_urls?.[0] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, use placeholder
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg';
            }}
          />

          {/* Category overlay - bottom left */}
          {product.category?.name && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {product.category.name}
            </div>
          )}

          {/* Discount badge - top right */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Tag size={12} className="mr-1" />
              {discountPercentage}% OFF
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col">
          {/* Product info */}
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>

            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-base">${Number(product.price).toFixed(2)}</p>
              {hasDiscount && (
                <p className="text-sm text-gray-500 line-through">${Number(product.original_price).toFixed(2)}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {product.size && (
                <span className="text-xs bg-krosh-blue/20 px-2 py-0.5 rounded-full">
                  {product.size}
                </span>
              )}
              {defaultVariant?.color && (
                <span className="text-xs bg-krosh-lavender/20 px-2 py-0.5 rounded-full">
                  {defaultVariant.name || defaultVariant.color}
                </span>
              )}
            </div>
          </div>

          {/* Add/Remove cart button with animation */}
          <div className="relative h-10 mt-2">
            <motion.button
              className="absolute w-full py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              initial={{ opacity: isInCart ? 1 : 0, y: isInCart ? 0 : 20 }}
              animate={{ opacity: isInCart ? 1 : 0, y: isInCart ? 0 : 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRemoveFromCart}
              disabled={!inStock || !isInCart}
            >
              <Trash2 size={14} />
              Remove
            </motion.button>

            <motion.button
              className={`absolute w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                inStock
                  ? 'bg-krosh-pink text-white hover:bg-krosh-pink/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              initial={{ opacity: isInCart ? 0 : 1, y: isInCart ? -20 : 0 }}
              animate={{ opacity: isInCart ? 0 : 1, y: isInCart ? -20 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!inStock || isInCart}
            >
              <ShoppingCart size={14} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;