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
} from '@heroicons/react/24/outline';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const diff = now - date;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2 * 86_400_000) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function buildConversations(messages, currentUserId) {
  const map = {};
  for (const msg of messages) {
    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    const otherName = msg.sender_id === currentUserId ? msg.receiver_name : msg.sender_name;
    if (!map[otherId]) {
      map[otherId] = {
        otherId,
        otherName: otherName ?? 'Unknown',
        avatar: getInitials(otherName),
        property: msg.property_title ?? '',
        propertyId: msg.property_id ?? null,
        lastMessage: msg.content,
        lastTs: msg.created_at,
        unread: !msg.read && msg.receiver_id === currentUserId,
        messages: [],
      };
    }
    map[otherId].messages.push(msg);
    if (msg.created_at > map[otherId].lastTs) {
      map[otherId].lastTs = msg.created_at;
      map[otherId].lastMessage = msg.content;
    }
    if (!msg.read && msg.receiver_id === currentUserId) map[otherId].unread = true;
  }
  for (const conv of Object.values(map)) conv.messages.sort((a, b) => a.created_at - b.created_at);
  return Object.values(map).sort((a, b) => b.lastTs - a.lastTs);
}

export default function TenantMessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/messages');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const convs = buildConversations(data.messages ?? [], user?.id);
      setConversations(convs);
      const landlordParam = searchParams.get('landlord');
      if (landlordParam) setSelectedId(landlordParam);
      else if (!selectedId && convs.length > 0) setSelectedId(convs[0].otherId);
    } catch {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [user?.id, searchParams]);

  useEffect(() => {
    if (user) fetchMessages();
  }, [user, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, conversations]);

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || !selectedId || sending) return;
    setSending(true);
    const conv = conversations.find(c => c.otherId === selectedId);
    try {
      const res = await fetch('/api/tenant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: selectedId, content, property_id: conv?.propertyId ?? null }),
      });
      if (!res.ok) throw new Error();
      const { message: newMsg } = await res.json();
      setMessageInput('');
      setConversations(prev => {
        const exists = prev.find(c => c.otherId === selectedId);
        if (exists) {
          return prev.map(c => c.otherId === selectedId
            ? { ...c, lastMessage: newMsg.content, lastTs: newMsg.created_at, messages: [...c.messages, newMsg] }
            : c);
        }
        return [{ otherId: selectedId, otherName: newMsg.receiver_name ?? 'Landlord', avatar: getInitials(newMsg.receiver_name), property: newMsg.property_title ?? '', propertyId: newMsg.property_id ?? null, lastMessage: newMsg.content, lastTs: newMsg.created_at, unread: false, messages: [newMsg] }, ...prev];
      });
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(c => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return c.otherName.toLowerCase().includes(q) || c.property.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  const activeConv = conversations.find(c => c.otherId === selectedId);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-2xl border border-border-light overflow-hidden h-[calc(100vh-180px)] flex flex-col md:flex-row">
      {/* Conversation List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-light flex flex-col">
        <div className="p-4 border-b border-border-light">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-surface rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <UserIcon className="w-10 h-10 text-text-muted/50 mb-3" />
              <p className="text-sm text-text-muted">No conversations yet</p>
            </div>
          ) : (
            filtered.map(conv => (
              <div
                key={conv.otherId}
                onClick={() => setSelectedId(conv.otherId)}
                className={`p-4 border-b border-border-light cursor-pointer transition-colors ${selectedId === conv.otherId ? 'bg-accent/5' : 'hover:bg-surface'}`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm truncate ${conv.unread ? 'font-bold text-ink' : 'font-medium text-ink-soft'}`}>{conv.otherName}</p>
                      <span className="text-[10px] text-text-muted">{formatTime(conv.lastTs)}</span>
                    </div>
                    {conv.property && <p className="text-xs text-accent truncate mb-0.5">{conv.property}</p>}
                    <p className="text-xs text-text-muted truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && <div className="w-2 h-2 rounded-full bg-accent mt-2" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-border-light flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                  {activeConv.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{activeConv.otherName}</h3>
                  {activeConv.property && <p className="text-xs text-accent">{activeConv.property}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface rounded-full"><PhoneIcon className="w-5 h-5 text-text-muted" /></button>
                <button className="p-2 hover:bg-surface rounded-full"><EnvelopeIcon className="w-5 h-5 text-text-muted" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConv.messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-accent text-white' : 'bg-surface text-ink'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-text-muted'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-border-light">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message... (Enter to send)"
                  className="flex-1 px-4 py-2 bg-surface rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button onClick={handleSend} disabled={!messageInput.trim() || sending} className="p-2 bg-accent text-white rounded-full disabled:opacity-50">
                  {sending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-bold font-display mb-2">Select a conversation</h3>
              <p className="text-sm text-text-muted">Choose a message from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}