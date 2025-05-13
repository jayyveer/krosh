import { useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchCart, addItemToCart, removeItemFromCart, updateItemQuantity } from '../redux/slices/cartSlice';

export function useCart() {
  const { user } = useAuthContext();
  const dispatch = useAppDispatch();
  const { items: cartItems, loading } = useAppSelector(state => state.cart);
  const cartLoadedRef = useRef(false);

  useEffect(() => {
    // Only fetch cart if user is logged in and cart hasn't been loaded yet
    if (user && !cartLoadedRef.current && cartItems.length === 0 && !loading) {
      cartLoadedRef.current = true;
      dispatch(fetchCart());
    }

    // Reset the ref when user changes (logs out)
    if (!user) {
      cartLoadedRef.current = false;
    }
  }, [user, dispatch, cartItems.length, loading]);

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
    // Only reload if not already loading
    if (!loading) {
      dispatch(fetchCart());
    }
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