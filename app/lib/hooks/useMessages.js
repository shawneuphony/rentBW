// app/lib/hooks/useMessages.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useMessages() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Conversations fetch failed:', res.status);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchConversation = async (otherUserId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/messages?conversation=${otherUserId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setCurrentConversation(otherUserId);
      } else {
        console.error('Conversation fetch failed:', res.status);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId, content, propertyId = null) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId, content, propertyId }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        await fetchConversations();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, read: 1 } : m)
      );
      // Decrement unread count in conversations
      setConversations(prev =>
        prev.map(c =>
          c.unread_count > 0 ? { ...c, unread_count: c.unread_count - 1 } : c
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    loading,
    conversations,
    messages,
    currentConversation,
    fetchConversations,
    fetchConversation,
    sendMessage,
    markAsRead,
  };
}