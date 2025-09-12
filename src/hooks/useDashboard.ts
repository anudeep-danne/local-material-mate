import { useState, useEffect } from 'react';

// Temporary stub for useDashboard hook
export const useDashboard = (userId?: string, userRole?: string) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyRevenue: [],
    recentActivity: [],
    topProducts: [],
    activeOrders: 0,
    monthlySpend: [],
    topSuppliers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    stats,
    loading,
    error,
    refetch: () => {}
  };
};