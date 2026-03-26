// app/components/ui/MessageThread.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/lib/hooks/useAuth';

export default function MessageThread({ messages, onSendMessage, otherUser }) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const result = await onSendMessage(newMessage);
    if (result.success) {
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  let lastDate = null;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const messageDate = formatDate(msg.created_at);
          const showDate = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="px-3 py-1 bg-slate-100 text-xs font-medium rounded-full">
                    {messageDate}
                  </span>
                </div>
              )}
              <div className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.sender_id === user?.id 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-100 text-slate-900'} rounded-lg p-3`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary/70' : 'text-slate-500'}`}>
                    {formatTime(msg.created_at)}
                    {msg.sender_id === user?.id && (
                      <span className="ml-2">{msg.read ? '✓✓' : '✓'}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}