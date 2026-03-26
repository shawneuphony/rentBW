// lib/hooks/useLandlordData.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useLandlordData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    unreadCount: 0,
    responseRate: 100,
    viewTrends: [],
  });
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/landlord/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setUnreadCount(data.unreadCount ?? 0);
      } else {
        console.error('Stats fetch failed:', res.status);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/landlord/listings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings ?? []);
      } else {
        console.error('Listings fetch failed:', res.status);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/landlord/inquiries', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } else {
        console.error('Inquiries fetch failed:', res.status);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchListings(), fetchInquiries()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && (user.role === 'landlord' || user.role === 'admin')) {
      refreshAll();
    } else if (user) {
      // User loaded but wrong role — stop loading
      setLoading(false);
    }
  }, [user]);

  const updatePropertyStatus = async (propertyId, status) => {
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await refreshAll();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      const res = await fetch(`/api/landlord/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await refreshAll();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const markInquiryAsRead = async (inquiryId) => {
    try {
      await fetch(`/api/messages/${inquiryId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setInquiries(prev =>
        prev.map(i => i.id === inquiryId ? { ...i, read: true } : i)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking inquiry as read:', err);
    }
  };

  return {
    loading,
    stats,
    listings,
    inquiries,
    unreadCount,
    refreshAll,
    updatePropertyStatus,
    deleteProperty,
    markInquiryAsRead,
  };
}