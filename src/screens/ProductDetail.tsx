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
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      
      // Fetch product with variants and category
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variants:product_variants(*)
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
            variants:product_variants(*)
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
      addToCart(product.id, selectedVariant.id, quantity);
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
    if (quantity < (selectedVariant?.stock || 10)) {
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
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-krosh-lavender">Home</Link>
          <ChevronRight size={14} className="mx-1" />
          <Link to="/shop" className="hover:text-krosh-lavender">Shop</Link>
          {product.category && (
            <>
              <ChevronRight size={14} className="mx-1" />
              <Link 
                to={`/shop?category=${product.category.slug}`} 
                className="hover:text-krosh-lavender"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="mx-1" />
          <span className="text-gray-700 truncate">{product.name}</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-4">
              <div className="relative">
                <img 
                  src={product.image_urls?.[selectedImage] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'} 
                  alt={product.name}
                  className="w-full h-64 md:h-80 object-contain rounded-lg"
                />
                
                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Tag size={12} className="mr-1" />
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>
              
              {/* Thumbnail images */}
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {product.image_urls.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-krosh-lavender' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="md:w-1/2 p-4">
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              
              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-krosh-text">${Number(product.price).toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">${Number(product.original_price).toFixed(2)}</span>
                )}
              </div>
              
              {/* Rating */}
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
              
              {/* Description */}
              <p className="text-gray-600 mb-6">{product.description || 'No description available.'}</p>
              
              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Available Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedVariant?.id === variant.id
                            ? 'bg-krosh-lavender text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {variant.color} - {variant.weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button 
                    onClick={decrementQuantity}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-l-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedVariant?.stock || 10}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-12 h-8 text-center border-y border-gray-200"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-r-lg"
                  >
                    +
                  </button>
                  <span className="ml-3 text-sm text-gray-500">
                    {selectedVariant?.stock || 0} available
                  </span>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <div className="flex gap-2">
                {isInCart ? (
                  <button
                    onClick={handleRemoveFromCart}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Remove from Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className="flex-1 py-3 bg-krosh-lavender text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                )}
                
                <button className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Heart size={20} className="text-gray-500" />
                </button>
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
