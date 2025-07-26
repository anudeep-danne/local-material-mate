import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type CartItem = Database['public']['Tables']['cart']['Row'] & {
  product: Database['public']['Tables']['products']['Row'] & {
    supplier: Database['public']['Tables']['users']['Row'];
  };
};

export const useCart = (vendorId: string) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      console.log('🛒 useCart: Fetching cart for vendor:', vendorId);
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
      console.log('🛒 useCart: Cart data fetched:', data);
      setCartItems(data as CartItem[]);
    } catch (err) {
      console.error('🛒 useCart: Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      console.log('🛒 useCart: Adding to cart - Product ID:', productId, 'Quantity:', quantity, 'Vendor ID:', vendorId);
      
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
        console.error('🛒 useCart: Vendor not found:', vendorId, vendorError);
        throw new Error('Vendor account not found');
      }
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', productId)
        .single();
      
      if (productError || !product) {
        console.error('🛒 useCart: Product not found:', productId, productError);
        throw new Error('Product not found');
      }
      
      console.log('🛒 useCart: Vendor and product verified:', vendor.name, product.name);
      
      // Check for existing cart item
      const { data: existingItems, error: checkError } = await supabase
        .from('cart')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('product_id', productId);

      if (checkError) {
        console.error('🛒 useCart: Error checking existing cart item:', checkError);
        throw checkError;
      }

      if (existingItems && existingItems.length > 0) {
        const existingItem = existingItems[0];
        console.log('🛒 useCart: Updating existing cart item:', existingItem.id, 'New quantity:', existingItem.quantity + quantity);
        
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) {
          console.error('🛒 useCart: Error updating cart item:', error);
          throw error;
        }
        toast.success('Cart updated successfully');
      } else {
        console.log('🛒 useCart: Creating new cart item');
        
        const { error } = await supabase
          .from('cart')
          .insert({ 
            vendor_id: vendorId, 
            product_id: productId, 
            quantity: quantity 
          });
        
        if (error) {
          console.error('🛒 useCart: Error creating cart item:', error);
          throw error;
        }
        toast.success('Item added to cart');
      }
      
      console.log('🛒 useCart: Refreshing cart data');
      await fetchCart();
    } catch (err) {
      console.error('🛒 useCart: Error adding to cart:', err);
      
      // Provide more specific error messages
      let message = 'Failed to add to cart';
      if (err instanceof Error) {
        if (err.message.includes('foreign key')) {
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
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      console.log('🛒 useCart: Updating quantity - Cart Item ID:', cartItemId, 'New quantity:', quantity);
      
      if (!cartItemId) {
        throw new Error('Cart item ID is required');
      }
      
      // Validate quantity
      if (quantity <= 0) {
        console.log('🛒 useCart: Removing item from cart');
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', cartItemId);
        
        if (error) {
          console.error('🛒 useCart: Error removing item:', error);
          throw error;
        }
        toast.success('Item removed from cart');
      } else {
        console.log('🛒 useCart: Updating item quantity to:', quantity);
        
        // First, verify the cart item exists
        const { data: existingItem, error: checkError } = await supabase
          .from('cart')
          .select('id, quantity, vendor_id, product_id')
          .eq('id', cartItemId)
          .single();
        
        if (checkError || !existingItem) {
          console.error('🛒 useCart: Cart item not found:', cartItemId, checkError);
          throw new Error('Cart item not found. Please refresh the page.');
        }
        
        console.log('🛒 useCart: Found existing cart item:', existingItem);
        
        // Update the quantity
        const { error: updateError } = await supabase
          .from('cart')
          .update({ 
            quantity: quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', cartItemId);
        
        if (updateError) {
          console.error('🛒 useCart: Error updating quantity:', updateError);
          throw updateError;
        }
        
        console.log('🛒 useCart: Successfully updated quantity to:', quantity);
        toast.success('Cart updated successfully');
      }
      
      console.log('🛒 useCart: Refreshing cart data after update');
      await fetchCart();
    } catch (err) {
      console.error('🛒 useCart: Error updating cart:', err);
      
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
      throw err; // Re-throw to let calling function handle it
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

    useEffect(() => {
    if (vendorId) {
      console.log('🛒 useCart: Setting up cart for vendor:', vendorId);
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
            console.log('🛒 useCart: Real-time cart change detected:', payload);
            // Add a small delay to ensure database consistency
            setTimeout(() => {
              fetchCart(); // Refresh cart data when changes occur
            }, 100);
          }
        )
        .subscribe((status) => {
          console.log('🛒 useCart: Real-time subscription status:', status);
        });

      return () => {
        console.log('🛒 useCart: Cleaning up real-time subscription for vendor:', vendorId);
        supabase.removeChannel(channel);
      };
    } else {
      console.log('🛒 useCart: No vendor ID, skipping cart setup');
    }
  }, [vendorId]);

  const total = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );

  return {
    cartItems,
    loading,
    error,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch: fetchCart
  };
};