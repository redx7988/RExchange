'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, UserProfile } from '@/lib/types';
import { getMessages, sendChatMessage } from '@/lib/firestoreService';
import { Send, Sparkles, User, MessageSquare } from 'lucide-react';

interface TeamChatProps {
  channelId: string;
  currentUser: UserProfile;
  channelName?: string;
}

export default function TeamChat({ channelId, currentUser, channelName }: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const list = await getMessages(channelId);
    setMessages(list);
  }, [channelId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    const content = text.trim();
    setText('');

    await sendChatMessage({
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content,
    });

    await fetchMessages();
    setIsSending(false);
  };

  const handleInsertIcebreaker = (prompt: string) => {
    setText(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Channel Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            {channelName || 'Team Discussion & Sync'}
          </span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Live Realtime
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[280px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
            <p className="text-xs font-medium text-slate-400">No messages yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Say hello to kick off sprint collaboration or share initial architecture thoughts!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.senderAvatar ? (
                  <img loading="lazy"
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 shrink-0 mt-0.5">
                    {msg.senderName.charAt(0)}
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 mb-0.5 px-1">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Icebreakers */}
      <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <Sparkles className="w-3 h-3 text-fuchsia-400 shrink-0" />
        <span className="text-slate-500 shrink-0 text-[10px]">Quick:</span>
        <button
          type="button"
          onClick={() => handleInsertIcebreaker("Let's do a 10-minute kickoff call to split up the tasks!")}
          className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
        >
          📞 10-min Kickoff
        </button>
        <button
          type="button"
          onClick={() => handleInsertIcebreaker("I've shared the Git repository link on our board.")}
          className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
        >
          🐙 Shared Git repo
        </button>
        <button
          type="button"
          onClick={() => handleInsertIcebreaker("What is our Day 1 hackathon MVP milestone?")}
          className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
        >
          🎯 Day 1 MVP Goal
        </button>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input aria-label="Input field"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message to team..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
