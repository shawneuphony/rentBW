// app/landlord/messages/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useMessages } from '@/app/lib/hooks/useMessages';
import MessageThread from '@/app/components/ui/MessageThread';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function LandlordMessagesPage() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    currentConversation,
    fetchConversation,
    sendMessage,
    markAsRead
  } = useMessages();

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

  useEffect(() => {
    // Mark messages as read when conversation is opened
    if (messages.length > 0) {
      messages.forEach(msg => {
        if (msg.receiver_id === user?.id && !msg.read) {
          markAsRead(msg.id);
        }
      });
    }
  }, [messages, user]);

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 border-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.other_user_id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                  selectedConv?.other_user_id === conv.other_user_id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {conv.other_user_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900 truncate">{conv.other_user_name}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.last_message_time).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium mb-1 truncate">{conv.property_title}</p>
                    <p className="text-xs text-slate-500 truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="flex items-center justify-center size-5 bg-primary text-white text-xs font-bold rounded-full">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <UserCircleIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <MessageThread
              messages={messages}
              onSendMessage={(content) => 
                sendMessage(selectedConv.other_user_id, content, selectedConv.property_id)
              }
              otherUser={{
                name: selectedConv.other_user_name,
                id: selectedConv.other_user_id
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Your Messages</h3>
                <p className="text-sm text-slate-500">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}