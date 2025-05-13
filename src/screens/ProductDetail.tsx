import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Tag, Heart, ChevronRight, Star } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import ProductCard from '../components/ui/ProductCard';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabase';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const { addToCart, removeFromCart, cartItems } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variantImages, setVariantImages] = useState<string[]>([]);

  // Check if product is already in cart
  const isInCart = cartItems.some(item =>
    item.product.id === product?.id && item.variant.id === selectedVariant?.id
  );

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      // Set the default variant (either the one marked as default or the first one)
      const defaultVariant = product.variants.find((v: any) => v.id === product.default_variant_id) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product]);

  // Update variant images when selected variant changes
  useEffect(() => {
    if (selectedVariant?.image_urls && selectedVariant.image_urls.length > 0) {
      setVariantImages(selectedVariant.image_urls);
      setSelectedImage(0); // Reset to first image when variant changes
    } else {
      // Fallback to empty array if no images
      setVariantImages([]);
    }
  }, [selectedVariant]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);

      // Fetch product with variants and category
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variants:product_variants!product_variants_product_id_fkey(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      setProduct(data);

      // Fetch related products from the same category
      if (data?.category?.id) {
        const { data: related } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name, slug),
            variants:product_variants!product_variants_product_id_fkey(*)
          `)
          .eq('category_id', data.category.id)
          .neq('id', productId)
          .limit(4);

        if (related) {
          setRelatedProducts(related);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (!selectedVariant) {
      showToast('Please select a variant', 'error');
      return;
    }

    try {
      // Always add with quantity 1 from product page
      addToCart(product.id, selectedVariant.id, 1);
      showToast('Added to cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      const cartItem = cartItems.find(item =>
        item.product.id === product.id && item.variant.id === selectedVariant?.id
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

  const incrementQuantity = () => {
    // Limit to maximum of 5 items or available stock, whichever is lower
    const maxAllowed = Math.min(5, selectedVariant?.stock || 5);
    if (quantity < maxAllowed) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Calculate discount percentage if original_price exists
  const hasDiscount = product?.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <SectionHeader title="Product Details" showBackButton={true} />
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="h-32 bg-gray-200 rounded mb-4" />
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  if (error || !product) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <SectionHeader title="Product Details" showBackButton={true} />
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            {error || 'Product not found'}
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer>
      <div className="py-4">
        <SectionHeader title="Product Details" showBackButton={true} />

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="bg-gray-50 px-4 py-2 rounded-lg mb-4">
          <ol className="flex items-center flex-wrap text-sm">
            <li className="flex items-center">
              <Link to="/" className="text-krosh-blue hover:text-krosh-pink">Home</Link>
              <ChevronRight size={12} className="mx-1 text-gray-400" />
            </li>
            <li className="flex items-center">
              <Link to="/shop" className="text-krosh-blue hover:text-krosh-pink">Shop</Link>
              {product.category && (
                <>
                  <ChevronRight size={12} className="mx-1 text-gray-400" />
                  <li className="flex items-center">
                    <Link
                      to={`/shop?category=${product.category.slug}`}
                      className="text-krosh-blue hover:text-krosh-pink"
                    >
                      {product.category.name}
                    </Link>
                    <ChevronRight size={12} className="mx-1 text-gray-400" />
                  </li>
                </>
              )}
            </li>
            <li className="text-gray-700 font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-2/5 p-3">
              <div className="relative">
                <img
                  src={variantImages[selectedImage] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'}
                  alt={`${product.name} - ${selectedVariant?.name || ''}`}
                  className="w-full h-56 md:h-64 object-contain rounded-lg"
                  onError={(e) => {
                    // If image fails to load, use placeholder
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg';
                  }}
                />

                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Tag size={12} className="mr-1" />
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail images - horizontal scrolling */}
              {variantImages.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {variantImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-krosh-lavender' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, use placeholder
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-3/5 p-3">
              <h1 className="text-xl font-bold mb-1">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-krosh-text">${Number(product.price).toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">${Number(product.original_price).toFixed(2)}</span>
                )}
              </div>

              {/* Rating - Commented out until review feature is implemented
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < (product.rating || 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-2">{product.rating || 4}/5 ({product.reviews_count || 12} reviews)</span>
              </div>
              */}

              {/* Description - Shortened */}
              <p className="text-gray-600 mb-3 line-clamp-3">{product.description || 'No description available.'}</p>

              {/* Product Size */}
              {product.size && (
                <div className="mb-3">
                  <h3 className="font-medium mb-1 text-sm">Size</h3>
                  <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {product.size}
                  </div>
                </div>
              )}

              {/* Variants - Color Swatches */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-medium mb-1 text-sm">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant: any) => {
                      // Get color name for display
                      const colorName = variant.name || variant.color || 'Default';

                      // Try to determine if this is a color name we can convert to a CSS color
                      const isStandardColor = [
                        'red', 'blue', 'green', 'yellow', 'purple', 'pink',
                        'orange', 'brown', 'black', 'white', 'gray', 'teal',
                        'navy', 'maroon', 'olive', 'lime', 'aqua', 'silver'
                      ].includes(variant.color?.toLowerCase());

                      // Use the color name as the background if it's a standard color
                      const bgColor = isStandardColor ? variant.color.toLowerCase() : null;

                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`relative group`}
                          title={colorName}
                          disabled={variant.stock <= 0}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                              ${selectedVariant?.id === variant.id ? 'border-krosh-lavender' : 'border-gray-200'}
                              ${variant.stock <= 0 ? 'opacity-50' : ''}
                            `}
                          >
                            {/* Color swatch */}
                            {bgColor ? (
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: bgColor }}
                              />
                            ) : (
                              // If no standard color, show the first letter of the color name
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {colorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}

                            {/* Checkmark for selected variant */}
                            {selectedVariant?.id === variant.id && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-krosh-lavender rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Out of stock indicator */}
                          {variant.stock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-0.5 bg-red-500 rotate-45 rounded-full"></div>
                            </div>
                          )}

                          {/* Tooltip with color name */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {colorName}
                            {variant.stock <= 0 ? ' (Out of stock)' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock information */}
              <div className="mb-3">
                {selectedVariant ? (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedVariant.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-sm">
                      {selectedVariant.stock > 0
                        ? <span className="text-green-700">{selectedVariant.stock} in stock</span>
                        : <span className="text-red-600">Out of stock</span>}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Please select a color</p>
                )}

                {selectedVariant?.sku && (
                  <p className="text-xs text-gray-500 mt-1">SKU: {selectedVariant.sku}</p>
                )}
              </div>

              {/* Add to Cart Button with smooth animation */}
              <div className="flex gap-2 relative h-10">
                <motion.button
                  onClick={handleRemoveFromCart}
                  className="absolute w-full py-2 bg-red-100 text-red-600 rounded-lg font-medium flex items-center justify-center gap-1 text-sm"
                  initial={{ opacity: isInCart ? 1 : 0, y: isInCart ? 0 : 20 }}
                  animate={{ opacity: isInCart ? 1 : 0, y: isInCart ? 0 : 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!isInCart}
                >
                  <Trash2 size={16} />
                  Remove
                </motion.button>

                <motion.button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0 || isInCart}
                  className="absolute w-full py-2 bg-krosh-pink text-white rounded-lg font-medium flex items-center justify-center gap-1 text-sm disabled:bg-gray-200 disabled:text-gray-400"
                  initial={{ opacity: isInCart ? 0 : 1, y: isInCart ? -20 : 0 }}
                  animate={{ opacity: isInCart ? 0 : 1, y: isInCart ? -20 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </motion.button>

                {/* Wishlist button removed until feature is implemented */}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default ProductDetail;
