// app/tenant/messages/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now  = new Date();
  const diff = now - date;
  if (diff < 60_000)         return 'Just now';
  if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)     return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2 * 86_400_000) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Group flat messages into conversations keyed by the other party's user id.
 * Returns an array sorted by most-recent message descending.
 */
function buildConversations(messages, currentUserId) {
  const map = {};

  for (const msg of messages) {
    const otherId   = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    const otherName = msg.sender_id === currentUserId ? msg.receiver_name : msg.sender_name;

    if (!map[otherId]) {
      map[otherId] = {
        otherId,
        otherName:  otherName ?? 'Unknown',
        avatar:     getInitials(otherName),
        property:   msg.property_title ?? '',
        propertyId: msg.property_id    ?? null,
        lastMessage: msg.content,
        lastTs:      msg.created_at,
        unread:      !msg.read && msg.receiver_id === currentUserId,
        messages:    [],
      };
    }

    map[otherId].messages.push(msg);

    // Keep track of most-recent
    if (msg.created_at > map[otherId].lastTs) {
      map[otherId].lastTs      = msg.created_at;
      map[otherId].lastMessage = msg.content;
      map[otherId].property    = msg.property_title ?? map[otherId].property;
    }

    if (!msg.read && msg.receiver_id === currentUserId) {
      map[otherId].unread = true;
    }
  }

  // Sort each thread chronologically
  for (const conv of Object.values(map)) {
    conv.messages.sort((a, b) => a.created_at - b.created_at);
  }

  // Sort conversations newest-first
  return Object.values(map).sort((a, b) => b.lastTs - a.lastTs);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TenantMessagesPage() {
  const { user }       = useAuth();
  const searchParams   = useSearchParams();
  const bottomRef      = useRef(null);

  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId]       = useState(null);   // otherId
  const [searchTerm, setSearchTerm]       = useState('');
  const [messageInput, setMessageInput]   = useState('');
  const [sending, setSending]             = useState(false);
  const [sendError, setSendError]         = useState(null);

  // ── Fetch all messages ───────────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenant/messages');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const convs = buildConversations(data.messages ?? [], user?.id);
      setConversations(convs);

      // Auto-select from ?landlord= param or first conversation
      const landlordParam = searchParams.get('landlord');
      if (landlordParam) {
        setSelectedId(landlordParam);
      } else if (!selectedId && convs.length > 0) {
        setSelectedId(convs[0].otherId);
      }
    } catch (err) {
      console.error('[TenantMessages]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) fetchMessages();
  }, [user, fetchMessages]);

  // ── Scroll to bottom when thread changes ────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, conversations]);

  // ── Mark messages as read when conversation is opened ───────────────────────

  useEffect(() => {
    if (!selectedId) return;
    const conv = conversations.find((c) => c.otherId === selectedId);
    if (!conv?.unread) return;

    const unreadIds = conv.messages
      .filter((m) => !m.read && m.receiver_id === user?.id)
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    // Fire-and-forget mark-read calls
    unreadIds.forEach((id) => {
      fetch(`/api/messages/${id}/read`, { method: 'PATCH' }).catch(console.error);
    });

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) =>
        c.otherId === selectedId
          ? {
              ...c,
              unread: false,
              messages: c.messages.map((m) => ({ ...m, read: true })),
            }
          : c
      )
    );
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ─────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || !selectedId || sending) return;

    setSending(true);
    setSendError(null);

    const conv = conversations.find((c) => c.otherId === selectedId);

    try {
      const res = await fetch('/api/tenant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: selectedId,
          content,
          property_id: conv?.propertyId ?? null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      const { message: newMsg } = await res.json();
      setMessageInput('');

      // Optimistic insert into the correct conversation
      setConversations((prev) => {
        const exists = prev.find((c) => c.otherId === selectedId);
        if (exists) {
          return prev.map((c) =>
            c.otherId === selectedId
              ? {
                  ...c,
                  lastMessage: newMsg.content,
                  lastTs:      newMsg.created_at,
                  messages:    [...c.messages, newMsg],
                }
              : c
          );
        }
        // Brand-new conversation (first message)
        return [
          {
            otherId:     selectedId,
            otherName:   newMsg.receiver_name ?? 'Landlord',
            avatar:      getInitials(newMsg.receiver_name),
            property:    newMsg.property_title ?? '',
            propertyId:  newMsg.property_id ?? null,
            lastMessage: newMsg.content,
            lastTs:      newMsg.created_at,
            unread:      false,
            messages:    [newMsg],
          },
          ...prev,
        ];
      });
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────

  const filtered = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.otherName.toLowerCase().includes(q) ||
      c.property.toLowerCase().includes(q)  ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const activeConv = conversations.find((c) => c.otherId === selectedId);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <div className="h-[calc(100vh-250px)] bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading messages…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <div className="h-[calc(100vh-250px)] bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium mb-2">Failed to load messages</p>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <button
          onClick={fetchMessages}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="h-[calc(100vh-250px)] bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex h-full">

          {/* ── Conversation list ──────────────────────────────────────────────── */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col">

            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search messages…"
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 border-none outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <UserIcon className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">
                    {conversations.length === 0
                      ? 'No messages yet. Contact a landlord to start a conversation.'
                      : 'No conversations match your search.'}
                  </p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <div
                    key={conv.otherId}
                    onClick={() => setSelectedId(conv.otherId)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedId === conv.otherId ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm truncate ${conv.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {conv.otherName}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                            {formatTime(conv.lastTs)}
                          </span>
                        </div>
                        {conv.property && (
                          <p className="text-xs text-primary font-medium mb-0.5 truncate">
                            {conv.property}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread && (
                        <div className="size-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Chat area ─────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {activeConv.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{activeConv.otherName}</h3>
                      {activeConv.property && (
                        <p className="text-xs text-primary truncate">{activeConv.property}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="p-2 hover:bg-slate-100 rounded-lg" title="Call">
                      <PhoneIcon className="w-5 h-5 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg" title="Email">
                      <EnvelopeIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Messages thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeConv.messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          isMe ? 'bg-primary text-white' : 'bg-slate-100 text-slate-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Send error */}
                {sendError && (
                  <p className="px-4 pb-1 text-xs text-red-500">{sendError}</p>
                )}

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message… (Enter to send)"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim() || sending}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending
                        ? <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        : <PaperAirplaneIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Select a conversation</h3>
                  <p className="text-sm text-slate-500">Choose a message from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}