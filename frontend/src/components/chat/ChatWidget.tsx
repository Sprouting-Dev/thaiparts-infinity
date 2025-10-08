'use client';

import { useChat } from './ChatProvider';
import { ChatWindow } from './ChatWindow';
import { ChatButton } from './ChatButton';

export function ChatWidget() {
  const { isOpen, openChat, closeChat } = useChat();

  return (
    <>
      {/* Chat Button - แสดงเมื่อปิด */}
      {!isOpen && (
        <ChatButton onClick={openChat} />
      )}
      
      {/* Chat Window - แสดงเมื่อเปิด */}
      {isOpen && (
        <ChatWindow onClose={closeChat} />
      )}
    </>
  );
}
