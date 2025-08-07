import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLocked: boolean;
  currentUserName: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isLocked, currentUserName }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isLocked) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 flex flex-col h-full w-full mt-4 min-h-[300px] max-h-[400px] border border-gray-700">
      <h3 className="text-lg font-bold text-gray-200 mb-2 border-b border-gray-700 pb-2">Game Chat</h3>
      <div className="flex-grow overflow-y-auto pr-2 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.userName === currentUserName ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.userName === currentUserName ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className={`text-sm font-bold ${msg.userName === currentUserName ? 'text-white/80' : 'text-gray-100'}`}>{msg.userName}</p>
              <p className="break-words">{msg.message}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
            <p className="text-gray-400 text-center text-sm pt-4">No messages yet. Say something!</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isLocked ? "Wait for your turn to chat..." : "Type a message..."}
          disabled={isLocked}
          className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={isLocked || !newMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:text-gray-300 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;