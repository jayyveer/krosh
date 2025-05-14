import React from 'react';
import SectionHeader from '../ui/SectionHeader';
import { formatPrice } from '../../lib/formatters';
import { CartItem } from '../../redux/slices/cartSlice';

interface VerifyOrderStepProps {
  cartItems: CartItem[];
  onBackClick: () => void;
  onContinue: () => void;
}

const VerifyOrderStep: React.FC<VerifyOrderStepProps> = ({ 
  cartItems, 
  onBackClick, 
  onContinue 
}) => {
  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (Number(item.product.price) * item.quantity);
  }, 0);

  return (
    <>
      <SectionHeader title="Verify Your Order" showBackButton={true} onBackClick={onBackClick} />

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-medium text-lg mb-3">Order Items</h3>
        <div className="space-y-3 mb-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b pb-3">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
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
                <div className="flex items-center text-sm text-gray-500">
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
        onClick={() => {
          console.log('Proceeding to address step');
          onContinue();
        }}
        className="w-full py-3 bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
      >
        Continue to Shipping
      </button>
    </>
  );
};

export default VerifyOrderStep;
