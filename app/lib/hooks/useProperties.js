// lib/hooks/useProperties.js
'use client';

import { useState, useEffect } from 'react';

export function useProperties(filters = {}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchProperties();
  }, [JSON.stringify(filters), pagination.page]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        page: pagination.page,
        ...filters
      });

      const response = await fetch(`/api/properties?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProperty = async (id) => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) {
        throw new Error('Property not found');
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const createProperty = async (propertyData) => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const updateProperty = async (id, propertyData) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const deleteProperty = async (id) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  const saveProperty = async (propertyId) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/save`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  const unsaveProperty = async (propertyId) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/save`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to unsave property');
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return {
    properties,
    loading,
    error,
    pagination,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    saveProperty,
    unsaveProperty,
    goToPage,
    refetch: fetchProperties
  };
}