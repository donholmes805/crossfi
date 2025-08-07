import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';

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
    <div className="card bg-transparent w-100 mt-4" style={{ minHeight: '300px', maxHeight: '400px' }}>
      <div className="card-body p-2 d-flex flex-column h-100">
        <h3 className="h6 text-light mb-2 border-bottom border-secondary pb-2">Game Chat</h3>
        <div className="flex-grow-1 overflow-y-auto pe-2">
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex flex-column mb-2 ${msg.userName === currentUserName ? 'align-items-end' : 'align-items-start'}`}>
              <div className={`rounded p-2`} style={{ maxWidth: '80%', backgroundColor: msg.userName === currentUserName ? 'var(--bs-primary)' : 'var(--bs-secondary-bg)' }}>
                <p className="small fw-bold mb-0" style={{color: msg.userName === currentUserName ? 'var(--bs-light)' : 'var(--bs-info)'}}>{msg.userName}</p>
                <p className="mb-0" style={{wordBreak: 'break-word'}}>{msg.message}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
              <p className="text-body-secondary text-center small pt-4">No messages yet. Say something!</p>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="mt-2">
            <div className="input-group">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isLocked ? "Wait for your turn to chat..." : "Type a message..."}
                    disabled={isLocked}
                    className="form-control"
                    aria-label="Chat message input"
                />
                <button
                    type="submit"
                    disabled={isLocked || !newMessage.trim()}
                    className="btn btn-primary"
                >
                    Send
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
