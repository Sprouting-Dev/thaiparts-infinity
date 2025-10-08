'use client';

import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from './LoadingSpinner';

interface Message {
  id?: string;
  sender: 'user' | 'bot' | 'staff';
  content: string;
  timestamp: Date;
  platform: 'web' | 'line';
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  // Show welcome message if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V9h2v4zm4 4h-2v-2h2v2zm0-4h-2V9h2v4z"/>
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-700 mb-2">สวัสดีครับ! 👋</h4>
        <p className="text-sm text-gray-500">
          ยินดีต้อนรับสู่ ThaiParts Support<br />
          มีอะไรให้ช่วยไหมครับ?
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id || index} 
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
      
      {/* Loading indicator when bot is responding */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
}
