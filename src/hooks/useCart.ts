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
      setCartItems(data as CartItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
        toast.success('Cart updated successfully');
      } else {
        const { error } = await supabase
          .from('cart')
          .insert({ vendor_id: vendorId, product_id: productId, quantity });
        
        if (error) throw error;
        toast.success('Item added to cart');
      }
      
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(message);
      toast.error(message);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', cartItemId);
        
        if (error) throw error;
        toast.success('Item removed from cart');
      } else {
        const { error } = await supabase
          .from('cart')
          .update({ quantity })
          .eq('id', cartItemId);
        
        if (error) throw error;
        toast.success('Cart updated');
      }
      
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update cart';
      setError(message);
      toast.error(message);
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
      fetchCart();
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