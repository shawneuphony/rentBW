// lib/hooks/useInvestorData.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useInvestorData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marketStats, setMarketStats] = useState({
    totalProperties: 0,
    avgPrice: 0,
    totalValue: 0,
    avgYield: 0
  });
  const [districts, setDistricts] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topProperties, setTopProperties] = useState([]);
  const [yieldData, setYieldData] = useState([]);
  const [benchmarks, setBenchmarks] = useState({});

  const fetchMarketStats = async () => {
    try {
      const response = await fetch('/api/investor/stats');
      if (response.ok) {
        const data = await response.json();
        setMarketStats(data.marketStats);
        setDistricts(data.districts || []);
        setPropertyTypes(data.propertyTypes || []);
        setMonthlyTrends(data.monthlyTrends || []);
        setTopProperties(data.topProperties || []);
      }
    } catch (error) {
      console.error('Error fetching market stats:', error);
    }
  };

  const fetchYieldData = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/investor/yield?${params}`);
      if (response.ok) {
        const data = await response.json();
        setYieldData(data.results || []);
        setBenchmarks(data.benchmarks || {});
      }
    } catch (error) {
      console.error('Error fetching yield data:', error);
    }
  };

  const calculateYield = async (formData) => {
    try {
      const response = await fetch('/api/investor/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        return { error: error.error };
      }
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  useEffect(() => {
    if (user && (user.role === 'investor' || user.role === 'admin')) {
      Promise.all([
        fetchMarketStats(),
        fetchYieldData()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  return {
    loading,
    marketStats,
    districts,
    propertyTypes,
    monthlyTrends,
    topProperties,
    yieldData,
    benchmarks,
    fetchYieldData,
    calculateYield,
    refresh: fetchMarketStats
  };
}