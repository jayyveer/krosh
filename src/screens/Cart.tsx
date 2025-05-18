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
import { motion } from 'framer-motion';
import { Address } from '../components/address/AddressForm';



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
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched addresses:', addresses);

      if (addresses && addresses.length > 0) {
        // Map the addresses to match our Address interface
        const mappedAddresses = addresses.map(addr => ({
          id: addr.id,
          user_id: addr.user_id,
          label: addr.label || 'My Address',
          address_line: addr.address_line || addr.address_line1 || '',
          city: addr.city || '',
          state: addr.state || '',
          pincode: addr.pincode || addr.postal_code || '',
          country: addr.country || 'India',
          is_primary: addr.is_primary || false,
          created_at: addr.created_at
        }));

        setUserAddresses(mappedAddresses);

        // Auto-select the first address (which should be the primary one due to ordering)
        setSelectedAddress(mappedAddresses[0].id);
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

      // Format address for order
      const formattedAddress = `${address.address_line}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;

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
        addressId: address.id!, // Use address ID with non-null assertion
        shippingAddress: formattedAddress, // Add formatted address
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

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={24} className="text-gray-500" />
              </div>

              <h2 className="text-lg font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-4 text-sm">
                Add items to start a new order
              </p>

              <Link
                to="/shop"
                className="px-6 py-2 bg-krosh-lavender text-white rounded-lg text-sm font-medium"
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

            <div className="space-y-2 mb-6">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center">
                    {/* Quantity Controls - Left side */}
                    <div className="flex flex-col items-center border border-gray-200 rounded-lg overflow-hidden mr-3">
                      <button
                        onClick={() => handleIncreaseQuantity(item)}
                        className={`px-2 py-1 w-8 ${
                          item.quantity >= Math.min(5, item.variant.stock || 5)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700'
                        } text-xs`}
                        disabled={item.quantity >= Math.min(5, item.variant.stock || 5)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <div className="px-2 py-1 bg-white text-center w-8">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => handleDecreaseQuantity(item)}
                        className="px-2 py-1 w-8 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 text-xs"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                    </div>

                    {/* Product Image - Small */}
                    <div className="relative w-16 h-16 mr-3">
                      <img
                        src={item.variant.image_urls?.[0] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          // If image fails to load, use placeholder
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg';
                        }}
                      />
                    </div>

                    {/* Product Details - Middle */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="font-semibold">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex flex-wrap text-xs text-gray-500 mt-1">
                        {item.product.size && (
                          <span className="mr-2">{item.product.size}</span>
                        )}
                        {item.variant.color && (
                          <span className="mr-2">{item.variant.name || item.variant.color}</span>
                        )}
                      </div>
                    </div>

                    {/* Remove button - Right side */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

        <div className="mt-4">
          {/* Promo Code Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center">
            <input
              type="text"
              placeholder="Promo Code"
              className="flex-1 p-2 border border-gray-200 rounded-lg mr-2 text-sm"
            />
            <button className="bg-krosh-lavender text-white px-4 py-2 rounded-lg text-sm font-medium">
              Apply
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-base font-medium mb-3">Cart total</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(totalPrice * 0.01)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">{formatPrice(40)}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Promo discount</span>
                <span>- {formatPrice(0)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">{formatPrice(totalPrice + (totalPrice * 0.01) + 40)}</span>
              </div>
            </div>

            <button
              onClick={startCheckout}
              className="w-full mt-4 py-3 bg-krosh-lavender text-white rounded-lg font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default Cart;