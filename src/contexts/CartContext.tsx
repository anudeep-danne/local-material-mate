import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type CartItem = Database['public']['Tables']['cart']['Row'] & {
  product: Database['public']['Tables']['products']['Row'] & {
    supplier: Database['public']['Tables']['users']['Row'];
  };
};

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
  cartItemsCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const vendorId = user?.id || "22222222-2222-2222-2222-222222222222";
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      console.log('🛒 CartContext: Fetching cart for vendor:', vendorId);
      setLoading(true);
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          product:products!cart_product_id_fkey(
            *,
            supplier:users!products_supplier_id_fkey(*)
          )
        `)
        .eq('vendor_id', vendorId);

      if (error) throw error;
      console.log('🛒 CartContext: Cart data fetched:', data);
      setCartItems(data as CartItem[]);
    } catch (err) {
      console.error('🛒 CartContext: Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      console.log('🛒 CartContext: Adding to cart - Product ID:', productId, 'Quantity:', quantity, 'Vendor ID:', vendorId);
      
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      // First, verify that the vendor and product exist
      const { data: vendor, error: vendorError } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', vendorId)
        .eq('role', 'vendor')
        .single();
      
      if (vendorError || !vendor) {
        console.error('🛒 CartContext: Vendor not found:', vendorId, vendorError);
        throw new Error('Vendor account not found');
      }
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', productId)
        .single();
      
      if (productError || !product) {
        console.error('🛒 CartContext: Product not found:', productId, productError);
        throw new Error('Product not found');
      }
      
      console.log('🛒 CartContext: Vendor and product verified:', vendor.name, product.name);
      
      // Use UPSERT logic to handle existing items
      const { data, error } = await supabase
        .from('cart')
        .upsert(
          { 
            vendor_id: vendorId, 
            product_id: productId, 
            quantity: quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'vendor_id,product_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();
      
      if (error) {
        console.error('🛒 CartContext: Error upserting cart item:', error);
        throw error;
      }
      
      console.log('🛒 CartContext: Successfully added to cart, cart item:', data);
      toast.success('Item added to cart');
      
      console.log('🛒 CartContext: Refreshing cart data');
      await fetchCart();
    } catch (err) {
      console.error('🛒 CartContext: Error adding to cart:', err);
      
      // Provide more specific error messages
      let message = 'Failed to add to cart';
      if (err instanceof Error) {
        if (err.message.includes('Vendor not found') || err.message.includes('Vendor account not found')) {
          message = 'Vendor account not found. Please log in again.';
        } else if (err.message.includes('Product not found')) {
          message = 'Product not found. Please refresh the page.';
        } else if (err.message.includes('foreign key')) {
          message = 'Product or vendor not found. Please refresh the page.';
        } else if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
          message = 'Item already in cart. Quantity updated.';
        } else if (err.message.includes('permission')) {
          message = 'Permission denied. Please check your account.';
        } else if (err.message.includes('Vendor ID is required')) {
          message = 'Please log in to add items to cart.';
        } else {
          message = err.message;
        }
      }
      
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      console.log('🛒 CartContext: Updating quantity - Cart Item ID:', cartItemId, 'New quantity:', quantity);
      
      if (!cartItemId) {
        throw new Error('Cart item ID is required');
      }
      
      // Validate quantity
      if (quantity <= 0) {
        console.log('🛒 CartContext: Removing item from cart');
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', cartItemId);
        
        if (error) {
          console.error('🛒 CartContext: Error removing item:', error);
          throw error;
        }
        toast.success('Item removed from cart');
      } else {
        console.log('🛒 CartContext: Updating item quantity to:', quantity);
        
        // Update the quantity directly
        const { error: updateError } = await supabase
          .from('cart')
          .update({ 
            quantity: quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', cartItemId);
        
        if (updateError) {
          console.error('🛒 CartContext: Error updating quantity:', updateError);
          throw updateError;
        }
        
        console.log('🛒 CartContext: Successfully updated quantity to:', quantity);
        toast.success('Cart updated successfully');
      }
      
      console.log('🛒 CartContext: Refreshing cart data after update');
      await fetchCart();
    } catch (err) {
      console.error('🛒 CartContext: Error updating cart:', err);
      
      // Provide more specific error messages
      let message = 'Failed to update cart';
      if (err instanceof Error) {
        if (err.message.includes('Cart item ID is required')) {
          message = 'Cart item not found. Please refresh the page.';
        } else if (err.message.includes('Cart item not found')) {
          message = 'Cart item not found. Please refresh the page.';
        } else if (err.message.includes('foreign key')) {
          message = 'Cart item not found. Please refresh the page.';
        } else if (err.message.includes('permission')) {
          message = 'Permission denied. Please check your account.';
        } else if (err.message.includes('quantity')) {
          message = 'Invalid quantity. Please try again.';
        } else {
          message = err.message;
        }
      }
      
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);
      
      if (error) throw error;
      toast.success('Item removed from cart');
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
      toast.error(message);
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('vendor_id', vendorId);
      
      if (error) throw error;
      setCartItems([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(message);
      toast.error(message);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (vendorId) {
      console.log('🛒 CartContext: Setting up cart for vendor:', vendorId);
      fetchCart();

      // Set up real-time subscription for cart changes
      const channel = supabase
        .channel(`cart-changes-${vendorId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart',
            filter: `vendor_id=eq.${vendorId}`
          },
          (payload) => {
            console.log('🛒 CartContext: Real-time cart change detected:', payload);
            console.log('🛒 CartContext: Change type:', payload.eventType);
            console.log('🛒 CartContext: Change data:', payload.new, payload.old);
            
            // Immediately refresh cart data when changes occur
            fetchCart();
          }
        )
        .subscribe((status) => {
          console.log('🛒 CartContext: Real-time subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('🛒 CartContext: Successfully subscribed to cart changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('🛒 CartContext: Real-time subscription error');
          }
        });

      return () => {
        console.log('🛒 CartContext: Cleaning up real-time subscription for vendor:', vendorId);
        supabase.removeChannel(channel);
      };
    } else {
      console.log('🛒 CartContext: No vendor ID, skipping cart setup');
    }
  }, [vendorId]);

  const total = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );

  const cartItemsCount = cartItems.reduce((sum, item) => 
    sum + item.quantity, 0
  );

  const value: CartContextType = {
    cartItems,
    loading,
    error,
    total,
    cartItemsCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 