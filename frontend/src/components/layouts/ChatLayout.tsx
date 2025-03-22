'use client';

import { Box, styled } from '@mui/material';
import ChatHeader from '../chat/ChatHeader';
import ChatMessages from '../chat/ChatMessages';
import { ChatInput } from '../chat/ChatInput';
import { Message } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { apiService } from '../../services/apiService';

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: theme.spacing(6), // Account for fixed footer
}));

const MainArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  transition: 'all 0.3s ease',
  paddingLeft: '0',
  paddingRight: '0',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    '& .MuiInputBase-root': {
      width: '100%',
    }
  }
}));

const Footer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: theme.spacing(6),
  backgroundColor: theme.palette.mode === 'light'
    ? theme.palette.grey[50]
    : theme.palette.grey[900],
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  padding: 0,
  zIndex: 1300,
}));

const LeftItem = styled(Box)(({ theme }) => ({
  paddingLeft: '16px',
  fontSize: '0.875rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    paddingLeft: '8px',
  }
}));

const CenterItem = styled(Box)(({ theme }) => ({
  flex: 1,
  textAlign: 'center',
  fontSize: '0.875rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const RightItem = styled(Box)(({ theme }) => ({
  paddingRight: '16px',
  fontSize: '0.875rem',
  marginLeft: 'auto',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    paddingRight: '8px',
  }
}));

interface ChatLayoutProps {
  sessionId: string;
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
  streamMode: boolean;
  onStreamModeChange: (enabled: boolean) => void;
}

export default function ChatLayout({ sessionId, messages, onMessagesUpdate, streamMode, onStreamModeChange }: ChatLayoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      // Create and add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        session_id: sessionId,
        metadata: {
          code: [],
          search_results: [],
          image_analysis: null,
        }
      };
      const newMessages = [...messages, userMessage];
      onMessagesUpdate(newMessages);

      if (!streamMode) {
        // Handle structured mode
        const response = await apiService.sendMessage(sessionId, content, currentImagePath);
        // Ensure we preserve the metadata from the API response
        onMessagesUpdate([...newMessages, {
          ...response,
          metadata: response.metadata || {
            code: [],
            search_results: [],
            image_analysis: null,
          }
        }]);
      } else {
        // Handle streaming mode
        try {
          setIsLoading(true); // Show typing indicator

          let currentContent = '';
          let assistantMessage: Message | null = null;

          for await (const chunk of apiService.streamChat(sessionId, content, currentImagePath)) {
            // Skip user messages and final messages
            if (chunk.role === 'user' || chunk.type === 'final') {
              if (chunk.type === 'final') {
                // Handle final message with metadata
                if (assistantMessage) {
                  const finalMessage: Message = {
                    ...assistantMessage,
                    content: currentContent,
                    metadata: {
                      code: chunk.metadata?.code || [],
                      search_results: chunk.metadata?.search_results || [],
                      image_analysis: chunk.metadata?.image_analysis || null,
                    }
                  };
                  onMessagesUpdate([...newMessages, finalMessage]);
                }
              }
              continue;
            }

            if (chunk.type === 'content' && chunk.content) {
              // Create assistant message if this is the first content chunk
              if (!assistantMessage) {
                assistantMessage = {
                  id: (Date.now() + 1).toString(),
                  content: '',
                  role: 'assistant',
                  session_id: sessionId,
                  metadata: {
                    code: [],
                    search_results: [],
                    image_analysis: null,
                  }
                };
              }

              // Update content
              currentContent = chunk.content;
              const updatedMessage = {
                ...assistantMessage,
                content: currentContent,
              };
              onMessagesUpdate([...newMessages, updatedMessage]);
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Error: Failed to stream response. Please try again.',
            role: 'assistant',
            session_id: sessionId,
            metadata: {
              code: [],
              search_results: [],
              image_analysis: null,
            }
          };
          onMessagesUpdate([...newMessages, errorMessage]);
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear the image path after sending the message
      setCurrentImagePath(null);
    }
  };

  const handleClearChat = async () => {
    try {
      await apiService.clearSession(sessionId);
      onMessagesUpdate([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
      setError('Failed to clear chat. Please try again.');
    }
  };

  // Note: Right sidebar open state is now managed in the parent component (page.tsx)

  return (
    <ChatContainer>
      <ChatHeader
        onClearChat={handleClearChat}
        isStructured={!streamMode}
        onModeToggle={() => onStreamModeChange(!streamMode)}
      />
      <MainArea>
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          currentImagePath={currentImagePath}
          setCurrentImagePath={setCurrentImagePath}
        />
      </MainArea>
      <Footer>
        <LeftItem>API Status: Connected</LeftItem>
        <CenterItem>© 2024 Chatbot</CenterItem>
        <RightItem>Debug Mode</RightItem>
      </Footer>
    </ChatContainer>
  );
}
