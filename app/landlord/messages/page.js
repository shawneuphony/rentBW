// app/landlord/messages/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useMessages } from '@/app/lib/hooks/useMessages';
import MessageThread from '@/app/components/ui/MessageThread';
import { MagnifyingGlassIcon, UserCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function LandlordMessagesPage() {
  const { user } = useAuth();
  const { conversations, messages, currentConversation, fetchConversation, sendMessage, markAsRead } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    await fetchConversation(conv.other_user_id);
  };

  // 🔧 FIX (Bug 8): Add markAsRead to dependency array
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(msg => {
        if (msg.receiver_id === user?.id && !msg.read) markAsRead(msg.id);
      });
    }
  }, [messages, user, markAsRead]);

  return (
    <div className="bg-white rounded-2xl border border-border-light overflow-hidden h-[calc(100vh-180px)] flex flex-col md:flex-row">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-light flex flex-col">
        <div className="p-4 border-b border-border-light">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 bg-surface rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center"><UserCircleIcon className="w-10 h-10 text-text-muted/50 mb-3" /><p className="text-sm text-text-muted">No conversations yet</p></div>
          ) : (
            filteredConversations.map(conv => (
              <div key={conv.other_user_id} onClick={() => handleSelectConversation(conv)} className={`p-4 border-b border-border-light cursor-pointer transition-colors ${selectedConv?.other_user_id === conv.other_user_id ? 'bg-accent/5' : 'hover:bg-surface'}`}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">{conv.other_user_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start"><p className="text-sm font-bold truncate">{conv.other_user_name}</p><span className="text-[10px] text-text-muted">{new Date(conv.last_message_time).toLocaleDateString()}</span></div>
                    <p className="text-xs text-accent truncate mb-1">{conv.property_title}</p>
                    <p className="text-xs text-text-muted truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && <div className="flex items-center justify-center w-5 h-5 bg-accent text-white text-xs font-bold rounded-full">{conv.unread_count}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <MessageThread messages={messages} onSendMessage={(content) => sendMessage(selectedConv.other_user_id, content, selectedConv.property_id)} otherUser={{ name: selectedConv.other_user_name, id: selectedConv.other_user_id }} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4"><BuildingOfficeIcon className="w-8 h-8 text-text-muted" /></div><h3 className="text-lg font-bold font-display mb-2">Your Messages</h3><p className="text-sm text-text-muted">Select a conversation to start messaging</p></div>
          </div>
        )}
      </div>
    </div>
  );
}