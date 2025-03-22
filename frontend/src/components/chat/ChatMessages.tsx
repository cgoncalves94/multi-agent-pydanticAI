import { Box, Typography, Button, keyframes, styled } from '@mui/material';
import { Message } from '@/types';
import { ChatMessage } from './ChatMessage';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const typingAnimation = keyframes`
  0% { transform: translateY(0px); }
  28% { transform: translateY(-5px); }
  44% { transform: translateY(0px); }
`;

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '12px 16px',
  backgroundColor: theme.palette.grey[100],
  borderRadius: '16px',
  width: 'fit-content',
  marginBottom: theme.spacing(2),
  '& .dot': {
    width: '6px',
    height: '6px',
    backgroundColor: theme.palette.grey[500],
    borderRadius: '50%',
    animation: `${typingAnimation} 1.8s infinite`,
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    }
  }
}));

export default function ChatMessages({ messages, isLoading, error, messagesEndRef }: ChatMessagesProps) {
  // Create a combined array of all elements to render with proper keys
  const renderElements = [
    // Empty state with example prompts when no messages
    messages.length === 0 ? (
      <Box
        key="empty-state"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          my: 6
        }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Start a new conversation
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Try some of these examples:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: '600px' }}>
          {[
            'What are news about AI in the last 24 hours?',
            'How do I use Pydantic with FastAPI?',
            'Explain Python type hints',
            'Show me a FastAPI CRUD example'
          ].map((prompt) => (
            <Button
              key={prompt}
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                // Find the input field and set its value
                const inputField = document.querySelector('textarea');
                if (inputField) {
                  // Use the InputEvent to trigger React's onChange handler
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                  )?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(inputField, prompt);
                    const event = new Event('input', { bubbles: true });
                    inputField.dispatchEvent(event);
                    inputField.focus();
                  }
                }
              }}
            >
              {prompt}
            </Button>
          ))}
        </Box>
      </Box>
    ) : null,

    // Message elements - use index to ensure unique keys even if ids are undefined
    ...messages.map((message, index) => (
      <ChatMessage key={`message-${index}`} message={message} />
    )),

    // Modern typing indicator when loading
    isLoading ? (
      <TypingIndicator key="loading-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </TypingIndicator>
    ) : null,

    error ? <div key="error-message" style={{ color: 'red' }}>{error}</div> : null,

    // End reference
    <div key="messages-end-ref" ref={messagesEndRef} />
  ].filter(Boolean); // Filter out null elements

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        padding: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        backgroundColor: theme => theme.palette.background.default,
      }}
    >
      {renderElements}
    </Box>
  );
}
