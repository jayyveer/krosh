import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity } from '../../lib/api';

export type CartItem = {
  id: string;
  product: any;
  variant: any;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const items = await getCart();
  return items || [];
});

export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ productId, variantId, quantity }: { productId: string; variantId: string; quantity: number }) => {
    const result = await addToCart(productId, variantId, quantity);
    return result;
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (itemId: string) => {
    await removeFromCart(itemId);
    return itemId;
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    await updateCartItemQuantity(itemId, quantity);
    return { itemId, quantity };
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      
      // Add item to cart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add item to cart';
      })
      
      // Remove item from cart
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.loading = false;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove item from cart';
      })
      
      // Update item quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
        const { itemId, quantity } = action.payload;
        const item = state.items.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;
        }
        state.loading = false;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update item quantity';
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
