// lib/hooks/useAuth.js
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Shared fetch-current-user logic ─────────────────────────────────────────
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // API returns { user: {...} }
        setUser(data.user ?? null);
        return data.user ?? null;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      return null;
    }
  }, []);

  // On mount — check if a session cookie already exists
  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error ?? 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // swallow — clear state regardless
    }
    setUser(null);
    window.location.href = '/';
  };

  // ── Refresh (called by profile page after saving) ────────────────────────────
  const refreshUser = useCallback(async () => {
    return fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}