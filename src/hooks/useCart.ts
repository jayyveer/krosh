import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchCart, addItemToCart, removeItemFromCart, updateItemQuantity } from '../redux/slices/cartSlice';

export function useCart() {
  const { user } = useAuthContext();
  const dispatch = useAppDispatch();
  const { items: cartItems, loading } = useAppSelector(state => state.cart);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const addToCart = (productId: string, variantId: string, quantity: number) => {
    dispatch(addItemToCart({ productId, variantId, quantity }));
  };

  const removeFromCart = (itemId: string) => {
    dispatch(removeItemFromCart(itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch(updateItemQuantity({ itemId, quantity }));
  };

  const reloadCart = () => {
    dispatch(fetchCart());
  };

  return {
    cartItems,
    cartItemsCount: cartItems.length,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    reloadCart
  };
}