import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DashboardStats = {
  // Vendor stats
  activeOrders: number;
  cartItems: number;
  monthlySpend: number;
  totalSuppliers: number;
  
  // Supplier stats
  totalProducts: number;
  pendingOrders: number;
  averageRating: number;
  monthlyRevenue: number;
  totalReviews: number;
  
  // Common stats
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status?: string;
  }>;
  
  // Top performing items
  topProducts?: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
  
  topSuppliers?: Array<{
    id: string;
    name: string;
    business_name: string;
    averageRating: number;
    totalReviews: number;
  }>;
};

export const useDashboard = (userId: string, userRole: 'vendor' | 'supplier') => {
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    cartItems: 0,
    monthlySpend: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    averageRating: 0,
    monthlyRevenue: 0,
    totalReviews: 0,
    recentActivity: [],
    topProducts: [],
    topSuppliers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendorStats = async () => {
    try {
      // Fetch active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', userId)
        .in('status', ['Pending', 'Packed']);

      if (ordersError) throw ordersError;

      // Cart items are now handled by CartContext for real-time updates
      // No need to fetch cart items here as they're managed globally

      // Fetch monthly spend
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders, error: monthlyError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .eq('status', 'Delivered');

      if (monthlyError) throw monthlyError;

      // Fetch unique suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('orders')
        .select('supplier_id')
        .eq('vendor_id', userId);

      if (suppliersError) throw suppliersError;

      const uniqueSuppliers = new Set(suppliers.map(s => s.supplier_id));

      // Fetch recent activity
      const { data: recentOrders, error: activityError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          product:products!orders_product_id_fkey(name),
          supplier:users!orders_supplier_id_fkey(business_name, name)
        `)
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;

      const recentActivity = recentOrders.map(order => ({
        id: order.id,
        type: 'order',
        message: `Order for ${order.product?.name || 'product'} from ${order.supplier?.business_name || order.supplier?.name || 'supplier'}`,
        timestamp: order.created_at,
        status: order.status
      }));

      // Fetch top suppliers by rating
      const { data: topSuppliersData, error: topSuppliersError } = await supabase
        .from('reviews')
        .select(`
          rating,
          supplier:users!reviews_supplier_id_fkey(
            id,
            name,
            business_name
          )
        `)
        .eq('vendor_id', userId);

      if (topSuppliersError) throw topSuppliersError;

      // Calculate supplier ratings
      const supplierRatings = topSuppliersData.reduce((acc: any, review) => {
        const supplierId = review.supplier?.id;
        if (!supplierId) return acc;

        if (!acc[supplierId]) {
          acc[supplierId] = {
            id: supplierId,
            name: review.supplier?.name || '',
            business_name: review.supplier?.business_name || '',
            ratings: [],
            totalReviews: 0
          };
        }
        acc[supplierId].ratings.push(review.rating);
        acc[supplierId].totalReviews++;
        return acc;
      }, {});

      const topSuppliers = Object.values(supplierRatings)
        .map((supplier: any) => ({
          ...supplier,
          averageRating: supplier.ratings.reduce((a: number, b: number) => a + b, 0) / supplier.ratings.length
        }))
        .sort((a: any, b: any) => b.averageRating - a.averageRating)
        .slice(0, 5);

      setStats(prev => ({
        ...prev,
        activeOrders: activeOrders?.length || 0,
        cartItems: 0, // Cart items are now handled by CartContext
        monthlySpend: monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        totalSuppliers: uniqueSuppliers.size,
        recentActivity,
        topSuppliers
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendor stats');
    }
  };

  const fetchSupplierStats = async () => {
    try {
      // Fetch total products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', userId);

      if (productsError) throw productsError;

      // Fetch pending orders
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .eq('supplier_id', userId)
        .eq('status', 'Pending');

      if (pendingError) throw pendingError;

      // Fetch monthly revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders, error: monthlyError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('supplier_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .eq('status', 'Delivered');

      if (monthlyError) throw monthlyError;

      // Fetch reviews and ratings
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('supplier_id', userId);

      if (reviewsError) throw reviewsError;

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Fetch recent activity
      const { data: recentOrders, error: activityError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          product:products!orders_product_id_fkey(name),
          vendor:users!orders_vendor_id_fkey(name)
        `)
        .eq('supplier_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;

      const recentActivity = recentOrders.map(order => ({
        id: order.id,
        type: 'order',
        message: `Order for ${order.product?.name || 'product'} from ${order.vendor?.name || 'vendor'}`,
        timestamp: order.created_at,
        status: order.status
      }));

      // Fetch top performing products
      const { data: productOrders, error: productOrdersError } = await supabase
        .from('orders')
        .select(`
          product_id,
          quantity,
          total_amount,
          product:products!orders_product_id_fkey(name)
        `)
        .eq('supplier_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (productOrdersError) throw productOrdersError;

      // Calculate product performance
      const productStats = productOrders.reduce((acc: any, order) => {
        const productId = order.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            name: order.product?.name || '',
            orders: 0,
            revenue: 0
          };
        }
        acc[productId].orders += order.quantity;
        acc[productId].revenue += order.total_amount;
        return acc;
      }, {});

      const topProducts = Object.values(productStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 3)
        .map((product: any) => ({
          ...product,
          growth: Math.floor(Math.random() * 30) + 5 // Mock growth for now
        }));

      setStats(prev => ({
        ...prev,
        totalProducts: products?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        monthlyRevenue: monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        averageRating,
        totalReviews: reviews?.length || 0,
        recentActivity,
        topProducts
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier stats');
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (userRole === 'vendor') {
        await fetchVendorStats();
      } else {
        await fetchSupplierStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userId.trim() !== '' && userRole) {
      fetchStats();
    } else {
      // Clear stats if no valid userId
      setStats({
        activeOrders: 0,
        cartItems: 0,
        monthlySpend: 0,
        totalSuppliers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        averageRating: 0,
        monthlyRevenue: 0,
        totalReviews: 0,
        recentActivity: [],
        topProducts: [],
        topSuppliers: []
      });
      setLoading(false);
    }
  }, [userId, userRole]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}; 