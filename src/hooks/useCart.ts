import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getCart } from '../lib/api';

export function useCart() {
  const { user } = useAuthContext();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  async function loadCart() {
    try {
      setLoading(true);
      const items = await getCart();
      setCartItems(items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    cartItems,
    cartItemsCount: cartItems.length,
    loading,
    reloadCart: loadCart
  };
}