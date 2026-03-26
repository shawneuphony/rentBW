// lib/hooks/useTenantData.js
'use client';

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_STATS = {
  savedCount: 0,
  applicationsCount: 0,
  unreadMessages: 0,
  upcomingViewings: [],   // kept for UI compatibility; extend later
  recentSearches: [],     // kept for UI compatibility; extend later
};

export function useTenantData() {
  const [loading, setLoading]               = useState(true);
  const [stats, setStats]                   = useState(DEFAULT_STATS);
  const [savedProperties, setSavedProperties] = useState([]);
  const [applications, setApplications]     = useState([]);
  const [messages, setMessages]             = useState([]);
  const [error, setError]                   = useState(null);

  // ─── Fetch helpers ────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/tenant/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();
    setStats({
      savedCount:        data.savedProperties   ?? 0,
      applicationsCount: data.activeApplications ?? 0,
      unreadMessages:    data.unreadMessages     ?? 0,
      upcomingViewings:  [],   // no viewings table yet
      recentSearches:    [],   // no search-history table yet
    });
  }, []);

  const fetchSaved = useCallback(async () => {
    const res = await fetch('/api/tenant/saved');
    if (!res.ok) throw new Error('Failed to load saved properties');
    const data = await res.json();
    setSavedProperties(data.saved ?? []);
  }, []);

  const fetchApplications = useCallback(async () => {
    const res = await fetch('/api/tenant/applications');
    if (!res.ok) throw new Error('Failed to load applications');
    const data = await res.json();

    // Normalise fields that the dashboard template references
    const normalised = (data.applications ?? []).map((app) => ({
      ...app,
      property: app.title    ?? 'Unknown Property',
      location: app.location ?? '',
      statusText: capitalise(app.status),
    }));
    setApplications(normalised);
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await fetch('/api/tenant/messages');
    if (!res.ok) throw new Error('Failed to load messages');
    const data = await res.json();

    // Normalise fields the dashboard template references
    const normalised = (data.messages ?? []).map((msg) => ({
      ...msg,
      sender:   msg.sender_name    ?? 'Unknown',
      avatar:   getInitials(msg.sender_name),
      property: msg.property_title ?? '',
      message:  msg.content        ?? '',
      time:     formatTime(msg.created_at),
    }));
    setMessages(normalised);
  }, []);

  // ─── Load all at once ─────────────────────────────────────────────────────

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchSaved(),
        fetchApplications(),
        fetchMessages(),
      ]);
    } catch (err) {
      console.error('[useTenantData]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchSaved, fetchApplications, fetchMessages]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    loading,
    error,
    stats,
    savedProperties,
    applications,
    messages,
    refreshAll,
    // individual refreshers for targeted re-fetches
    refreshStats:       fetchStats,
    refreshSaved:       fetchSaved,
    refreshApplications: fetchApplications,
    refreshMessages:    fetchMessages,
  };
}

// ─── Tiny utilities ───────────────────────────────────────────────────────────

function capitalise(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now  = new Date();
  const diff = now - date;

  if (diff < 60_000)              return 'Just now';
  if (diff < 3_600_000)           return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)          return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000)      return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString();
}