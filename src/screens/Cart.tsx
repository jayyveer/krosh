import React, { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { useToast } from '../contexts/ToastContext';
import { formatPrice } from '../lib/formatters';
import { createOrder } from '../lib/orders';
import { supabase } from '../lib/supabase';

// Import checkout components
import CheckoutStepIndicator from '../components/checkout/CheckoutStepIndicator';
import VerifyOrderStep from '../components/checkout/VerifyOrderStep';
import ShippingAddressStep from '../components/checkout/ShippingAddressStep';
import OrderSummaryStep from '../components/checkout/OrderSummaryStep';

interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  created_at?: string;
}



const Cart: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cartItems, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  // Default payment method is Cash on Delivery
  const paymentMethod = 'cod' as const;
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'verify' | 'address' | 'summary'>('verify');
  const [processingOrder, setProcessingOrder] = useState(false);

  // Fetch user addresses when checking out
  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setLoadingAddresses(true);

      // Fetch addresses from the addresses table
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched addresses:', addresses);

      if (addresses && addresses.length > 0) {
        setUserAddresses(addresses);

        // Auto-select the first address
        setSelectedAddress(addresses[0].id);
      } else {
        // No addresses found
        setUserAddresses([]);
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      showToast('Failed to load your addresses', 'error');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const startCheckout = () => {
    setIsCheckingOut(true);
    setCheckoutStep('verify');
  };

  const proceedToAddressStep = () => {
    setCheckoutStep('address');
    fetchAddresses();
  };

  const proceedToSummaryStep = () => {
    setCheckoutStep('summary');
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) return;

    try {
      setProcessingOrder(true);

      // Find the selected address
      const address = userAddresses.find(addr => addr.id === selectedAddress);
      if (!address) {
        showToast('Please select a valid shipping address', 'error');
        return;
      }

      // Create order data
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          id: item.id,
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
          price: Number(item.product.price)
        })),
        addressId: address.id, // Use address ID instead of formatted address
        paymentMethod: paymentMethod, // Using the const defined above
      };

      // Log order details to console
      console.log('Order placed with details:', orderData);

      // Create order in database
      const result = await createOrder(orderData);

      if (result.success) {
        // Clear cart after successful order
        await clearCart();

        // Show success animation and message
        showToast('Order placed successfully!', 'success');

        // Add a small delay before redirecting to orders page
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
      } else {
        showToast('Failed to place order. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      showToast('An error occurred while placing your order', 'error');
    } finally {
      setProcessingOrder(false);
    }
  };

  const goBack = () => {
    if (checkoutStep === 'verify') {
      setIsCheckingOut(false);
    } else if (checkoutStep === 'address') {
      setCheckoutStep('verify');
    } else if (checkoutStep === 'summary') {
      setCheckoutStep('address');
    }
  };

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <SectionHeader title="Your Cart" showBackButton={true} />
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4" />
            <div className="h-32 bg-gray-200 rounded-lg mb-4" />
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  if (cartItems.length === 0) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <SectionHeader title="Your Cart" showBackButton={true} />

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-krosh-blue/20 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={30} className="text-krosh-text" />
              </div>

              <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                Start adding some items to your cart!
              </p>

              <Link
                to="/shop"
                className="px-6 py-2 bg-krosh-lavender text-krosh-text rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  const handleDecreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleIncreaseQuantity = (item: any) => {
    // Limit to maximum of 5 items or available stock, whichever is lower
    const maxAllowed = Math.min(5, item.variant.stock || 5);
    if (item.quantity < maxAllowed) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (Number(item.product.price) * item.quantity);
  }, 0);

  // Render checkout steps
  const renderCheckoutSteps = () => {
    // Step 1: Verify Order
    if (checkoutStep === 'verify') {
      return (
        <VerifyOrderStep
          cartItems={cartItems}
          onBackClick={goBack}
          onContinue={proceedToAddressStep}
        />
      );
    }
    // Step 2: Select Address
    else if (checkoutStep === 'address') {
      return (
        <ShippingAddressStep
          userAddresses={userAddresses}
          selectedAddress={selectedAddress}
          loadingAddresses={loadingAddresses}
          onAddressSelect={setSelectedAddress}
          onBackClick={goBack}
          onContinue={proceedToSummaryStep}
        />
      );
    }
    // Step 3: Order Summary and Completion
    else if (checkoutStep === 'summary') {
      // Find the selected address
      const selectedAddressObj = userAddresses.find(addr => addr.id === selectedAddress);

      return (
        <OrderSummaryStep
          cartItems={cartItems}
          selectedAddress={selectedAddressObj || null}
          processingOrder={processingOrder}
          onBackClick={goBack}
          onPlaceOrder={handlePlaceOrder}
        />
      );
    }

    return null;
  };

  // Render checkout step indicator
  const renderStepIndicator = () => {
    if (!isCheckingOut) return null;
    return <CheckoutStepIndicator currentStep={checkoutStep} />;
  };

  return (
    <AnimatedContainer>
      <div className="py-4">
        {isCheckingOut ? (
          <>
            {renderStepIndicator()}
            {renderCheckoutSteps()}
          </>
        ) : (
          <>
            <SectionHeader title="Your Cart" showBackButton={true} />

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
              <img
                src={item.variant.image_urls?.[0] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => {
                  // If image fails to load, use placeholder
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg';
                }}
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.product.size && <span className="font-medium">Size: </span>}{item.product.size}
                  {item.product.size && item.variant.color && <span> • </span>}
                  {item.variant.color && <span><span className="font-medium">Color: </span>{item.variant.name || item.variant.color}</span>}
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatPrice(item.product.price)}</p>
                  {item.product.original_price && Number(item.product.original_price) > Number(item.product.price) && (
                    <p className="text-sm text-gray-500 line-through">{formatPrice(item.product.original_price)}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecreaseQuantity(item)}
                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncreaseQuantity(item)}
                    className={`px-3 py-1 rounded ${
                      item.quantity >= Math.min(5, item.variant.stock || 5)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 transition-colors'
                    }`}
                    disabled={item.quantity >= Math.min(5, item.variant.stock || 5)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">{formatPrice(0)}</span>
          </div>
          <div className="flex justify-between items-center py-2 mt-2">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
          </div>
          <button
            onClick={startCheckout}
            className="w-full mt-4 py-3 bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
          >
            Proceed to Checkout
          </button>
            </div>
          </>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Cart;