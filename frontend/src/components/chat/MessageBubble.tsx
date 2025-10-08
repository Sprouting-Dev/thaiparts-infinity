'use client';

interface Message {
  id?: string;
  sender: 'user' | 'bot' | 'staff';
  content: string;
  timestamp: Date;
  platform: 'web' | 'line';
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isStaff = message.sender === 'staff';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSenderIcon = () => {
    if (isUser) return '👤';
    if (isStaff) return '👨‍💼';
    return '🤖';
  };

  const getSenderName = () => {
    if (isUser) return 'คุณ';
    if (isStaff) return 'เจ้าหน้าที่';
    return 'ThaiParts Bot';
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Sender info for bot/staff messages */}
        {!isUser && (
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-sm">{getSenderIcon()}</span>
            <span className="text-xs text-gray-500">{getSenderName()}</span>
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : isStaff
              ? 'bg-green-100 text-green-800 border border-green-200 rounded-bl-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
          {message.platform === 'line' && (
            <span className="ml-1 text-blue-500">📱</span>
          )}
        </div>
      </div>
    </div>
  );
}
