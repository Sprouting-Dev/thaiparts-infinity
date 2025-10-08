'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
interface Message {
  id?: string;
  sender: 'user' | 'bot' | 'staff';
  content: string;
  timestamp: Date;
  platform: 'web' | 'line';
}

interface ChatState {
  isOpen: boolean;
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatContextType extends ChatState {
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

// Initial State
const initialState: ChatState = {
  isOpen: false,
  sessionId: null,
  messages: [],
  isLoading: false,
  error: null,
};

// Action Types
type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SET_SESSION'; payload: string }
  | { type: 'LOAD_SESSION'; payload: { sessionId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return { ...state, isOpen: true };
    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };
    case 'SET_SESSION':
      return { ...state, sessionId: action.payload };
    case 'LOAD_SESSION':
      return { 
        ...state, 
        sessionId: action.payload.sessionId, 
        messages: action.payload.messages 
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider Component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize session when component mounts
  useEffect(() => {
    initializeSession();
  }, []);

  // Save session ID to localStorage
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem('chatSessionId', state.sessionId);
    }
  }, [state.sessionId]);

  const initializeSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check for existing session in localStorage
      const savedSessionId = localStorage.getItem('chatSessionId');
      
      if (savedSessionId) {
        // Try to load existing session
        await loadSession(savedSessionId);
      } else {
        // Create new session
        await createNewSession();
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize chat session' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { sessionId } = await response.json();
      dispatch({ type: 'SET_SESSION', payload: sessionId });
    } catch (error) {
      console.error('Failed to create session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create chat session' });
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-sessions/${sessionId}`);
      
      if (!response.ok) {
        // Session not found, create new one
        await createNewSession();
        return;
      }

      const sessionData = await response.json();
      
      // Convert timestamp strings to Date objects
      const messages = sessionData.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      dispatch({ 
        type: 'LOAD_SESSION', 
        payload: { sessionId: sessionData.sessionId, messages } 
      });
    } catch (error) {
      console.error('Failed to load session:', error);
      // If loading fails, create new session
      await createNewSession();
    }
  };

  const sendMessage = async (content: string) => {
    if (!state.sessionId) {
      dispatch({ type: 'SET_ERROR', payload: 'No active session' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Add user message to state immediately
      const userMessage: Message = {
        sender: 'user',
        content,
        timestamp: new Date(),
        platform: 'web'
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      // Send message to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          content,
          platform: 'web'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const botMessage = await response.json();
      
      // Add bot response to state
      const botResponse: Message = {
        sender: 'bot',
        content: botMessage.content,
        timestamp: new Date(botMessage.timestamp),
        platform: 'web'
      };
      dispatch({ type: 'ADD_MESSAGE', payload: botResponse });

    } catch (error) {
      console.error('Failed to send message:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const openChat = () => {
    dispatch({ type: 'OPEN_CHAT' });
  };

  const closeChat = () => {
    dispatch({ type: 'CLOSE_CHAT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <ChatContext.Provider value={{
      ...state,
      openChat,
      closeChat,
      sendMessage,
      loadSession,
      clearError
    }}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
