import React from 'react';
import { CreditCard } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { formatPrice } from '../../lib/formatters';
import { CartItem } from '../../redux/slices/cartSlice';
import { Address } from '../address/AddressForm';

interface OrderSummaryStepProps {
  cartItems: CartItem[];
  selectedAddress: Address | null;
  processingOrder: boolean;
  onBackClick: () => void;
  onPlaceOrder: () => void;
}

const OrderSummaryStep: React.FC<OrderSummaryStepProps> = ({
  cartItems,
  selectedAddress,
  processingOrder,
  onBackClick,
  onPlaceOrder
}) => {
  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (Number(item.product.price) * item.quantity);
  }, 0);

  // Format address for display
  const formattedAddress = selectedAddress
    ? `${selectedAddress.address_line}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}, ${selectedAddress.country}`
    : '';

  return (
    <>
      <SectionHeader title="Checkout" showBackButton={true} onBackClick={onBackClick} />

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-medium text-lg mb-3">Order Summary</h3>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{formattedAddress}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h4>
          <div className="flex items-center bg-gray-50 p-3 rounded-lg">
            <CreditCard size={18} className="mr-2 text-gray-600" />
            <p className="text-sm text-gray-600">Cash on Delivery</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b pb-3">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={item.variant.image_urls?.[0] || 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg';
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>Qty: {item.quantity}</span>
                  {item.variant.name && (
                    <span className="ml-2">• {item.variant.name}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(Number(item.product.price) * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">{formatPrice(0)}</span>
          </div>
          <div className="flex justify-between items-center py-2 mt-2">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={processingOrder}
        className="w-full py-3 bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-70"
      >
        {processingOrder ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          'Complete Checkout'
        )}
      </button>
    </>
  );
};

export default OrderSummaryStep;
