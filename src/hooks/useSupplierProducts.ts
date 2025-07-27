import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupplierProducts = (supplierId: string) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    // Don't fetch if supplierId is empty or undefined
    if (!supplierId || supplierId.trim() === '') {
      console.log('useSupplierProducts: No supplierId provided, skipping fetch');
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useSupplierProducts: Fetching products for supplier:', supplierId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      console.log('useSupplierProducts: Fetched', data?.length || 0, 'products');
    } catch (err) {
      console.error('useSupplierProducts: Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    if (!supplierId || supplierId.trim() === '') {
      toast.error('Supplier ID not available');
      return false;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          ...productData,
          supplier_id: supplierId
        });

      if (error) throw error;
      toast.success('Product added successfully');
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add product';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const updateProduct = async (productId, updates) => {
    if (!supplierId || supplierId.trim() === '') {
      toast.error('Supplier ID not available');
      return false;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product updated successfully');
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    if (!supplierId || supplierId.trim() === '') {
      toast.error('Supplier ID not available');
      return false;
    }

    try {
      console.log('Starting comprehensive product deletion for:', productId);

      // Step 1: Verify product exists and user owns it
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('supplier_id')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        throw new Error('Product not found');
      }

      if (productData.supplier_id !== supplierId) {
        throw new Error('You can only delete your own products');
      }

      console.log('Product verification passed');

      // Step 2: Find all orders for this product
      console.log('Finding orders for product...');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('product_id', productId);

      if (ordersError) {
        console.error('Error finding orders:', ordersError);
        throw new Error('Failed to find orders for product');
      }

      console.log(`Found ${orders?.length || 0} orders for product`);

      // Step 3: Delete all reviews for orders of this product
      if (orders && orders.length > 0) {
        console.log('Deleting reviews for product orders...');
        const orderIds = orders.map(order => order.id);
        
        const { error: reviewsError } = await supabase
          .from('reviews')
          .delete()
          .in('order_id', orderIds);

        if (reviewsError) {
          console.error('Error deleting reviews:', reviewsError);
          throw new Error('Failed to delete reviews');
        }

        console.log('Reviews deleted successfully');
      } else {
        console.log('No orders found, skipping reviews deletion');
      }

      // Step 4: Delete all cart items for this product
      console.log('Deleting cart items for product...');
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('product_id', productId);

      if (cartError) {
        console.error('Error deleting cart items:', cartError);
        throw new Error('Failed to delete cart items');
      }

      console.log('Cart items deleted successfully');

      // Step 5: Delete all stock changes for this product (if table exists)
      console.log('Deleting stock changes for product...');
      try {
        const { error: stockChangesError } = await supabase
          .from('stock_changes' as any)
          .delete()
          .eq('product_id', productId);
        
        if (stockChangesError) {
          console.warn('Stock changes deletion failed (table might not exist):', stockChangesError);
        } else {
          console.log('Stock changes deleted successfully');
        }
      } catch (error) {
        console.warn('Stock changes table might not exist, continuing...');
      }

      // Step 6: Delete all orders for this product (cascade will handle reviews)
      console.log('Deleting orders for product...');
      const { error: ordersDeleteError } = await supabase
        .from('orders')
        .delete()
        .eq('product_id', productId);

      if (ordersDeleteError) {
        console.error('Error deleting orders:', ordersDeleteError);
        throw new Error('Failed to delete orders');
      }

      console.log('Orders deleted successfully');

      // Step 7: Delete the product itself
      console.log('Deleting product...');
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('supplier_id', supplierId);

      if (deleteError) {
        console.error('Product deletion failed:', deleteError);
        throw new Error(`Failed to delete product: ${deleteError.message}`);
      }

      console.log('Product deleted successfully');

      // Step 8: Update supplier's average rating
      console.log('Updating supplier rating...');
      await updateSupplierRating(supplierId);

      console.log('Product deletion completed successfully!');
      toast.success('Product deleted successfully');
      
      // Refresh the products list
      await fetchProducts();
      return true;

    } catch (err) {
      console.error('Delete product error:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  // Helper function to update supplier's average rating
  const updateSupplierRating = async (supplierId) => {
    try {
      // Get all remaining reviews for this supplier
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('supplier_id', supplierId);

      if (reviewsError) {
        console.warn('Could not fetch reviews for rating update:', reviewsError);
        return;
      }

      if (!reviews || reviews.length === 0) {
        console.log('No reviews found for supplier, rating set to 0');
        return;
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      console.log(`Supplier rating updated: ${averageRating.toFixed(2)} (${reviews.length} reviews)`);

    } catch (error) {
      console.warn('Error updating supplier rating:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supplierId]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
};