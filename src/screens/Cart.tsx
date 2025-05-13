import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import { Link, Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

const Cart: React.FC = () => {
  const { user } = useAuthContext();
  const { cartItems, loading } = useCart();

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
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
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          
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

  return (
    <AnimatedContainer>
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
              <img
                src={item.product.image_urls[0]}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.variant.color} - {item.variant.weight}
                </p>
                <p className="font-semibold">${Number(item.product.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded bg-gray-100">-</button>
                <span>{item.quantity}</span>
                <button className="px-3 py-1 rounded bg-gray-100">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Cart;