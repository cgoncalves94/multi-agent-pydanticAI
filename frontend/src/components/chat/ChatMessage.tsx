'use client';

import { Box, Paper, Typography, styled, Link } from '@mui/material';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';

interface MessageContainerProps {
  'data-role': 'user' | 'assistant' | 'system' | 'model';
}

const MessageContainer = styled(Box)<MessageContainerProps>(({ theme, 'data-role': role }) => ({
  maxWidth: '85%',
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
  }
}));

const MessageBubble = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  '&[data-role="user"]': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderBottomRightRadius: theme.spacing(0.5),
  },
  '&[data-role="assistant"]': {
    backgroundColor: theme.palette.grey[100],
    borderBottomLeftRadius: theme.spacing(0.5),
  },
  '&[data-role="system"]': {
    backgroundColor: theme.palette.warning.light,
    borderRadius: theme.spacing(1),
  },
  '&[data-role="model"]': {
    backgroundColor: theme.palette.grey[100],
    borderBottomLeftRadius: theme.spacing(0.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.2, 1.5),
  }
}));

const MessageMeta = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.25),
  padding: '0 4px',
}));

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { content, role } = message;

  // All metadata (code blocks, search results, image analysis) is now displayed only in the sidebar
  // We don't render metadata in the main chat messages anymore

  return (
    <MessageContainer data-role={role}>
      <MessageBubble data-role={role} elevation={0}>
        {role === 'user' ? (
          // For user messages, keep simple text
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        ) : (
          // For assistant and system messages, use markdown
          <ReactMarkdown
            components={{
              p: (props) => (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    mt: 1,
                    color: role === 'assistant' ? 'inherit' : 'inherit'
                  }}
                  {...props}
                />
              ),
              h1: (props) => (
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }} {...props} />
              ),
              h2: (props) => (
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }} {...props} />
              ),
              h3: (props) => (
                <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5 }} {...props} />
              ),
              ul: (props) => (
                <Box component="ul" sx={{ pl: 2, mt: 1 }} {...props} />
              ),
              ol: (props) => (
                <Box component="ol" sx={{ pl: 2, mt: 1 }} {...props} />
              ),
              li: (props) => (
                <Typography component="li" variant="body1" sx={{ mb: 0.5 }} {...props} />
              ),
              a: (props) => (
                <Link
                  href={props.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: role === 'assistant' ? 'primary.main' : 'inherit',
                    textDecoration: 'underline'
                  }}
                  {...props}
                />
              ),
              code: (props) => (
                <Typography
                  component="code"
                  sx={{
                    backgroundColor: role === 'assistant' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.15)',
                    p: 0.5,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.9em'
                  }}
                  {...props}
                />
              ),
              pre: (props) => (
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: role === 'assistant' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                    p: 1.5,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxWidth: '100%',
                    '& code': {
                      backgroundColor: 'transparent',
                      p: 0
                    }
                  }}
                  {...props}
                />
              )
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </MessageBubble>
      <MessageMeta>
        {role === 'user' ? 'You' : role === 'system' ? 'System' : 'Assistant'}
      </MessageMeta>
    </MessageContainer>
  );
};
