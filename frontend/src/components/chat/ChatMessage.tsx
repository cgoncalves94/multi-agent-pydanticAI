'use client';

import { Box, Paper, Typography, styled, Link, IconButton, Tooltip } from '@mui/material';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ComponentPropsWithoutRef, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
  padding: theme.spacing(1.2, 1.8),
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
    padding: theme.spacing(1, 1.2),
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <MessageContainer data-role={role}>
      <MessageBubble data-role={role} elevation={0}>
        {role === 'user' ? (
          // For user messages, keep simple text
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        ) : (
          // For assistant and system messages, use enhanced markdown with syntax highlighting
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
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
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: 1,
                    color: role === 'assistant' ? '#0a2f5e' : '#fff',
                    fontWeight: 600
                  }}
                  {...props}
                />
              ),
              h2: (props) => (
                <Typography
                  variant="subtitle1"
                  sx={{
                    mt: 2,
                    mb: 1,
                    color: role === 'assistant' ? '#0a2f5e' : '#fff',
                    fontWeight: 600
                  }}
                  {...props}
                />
              ),
              h3: (props) => (
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 1.5,
                    mb: 0.5,
                    color: role === 'assistant' ? '#0a2f5e' : '#fff',
                    fontWeight: 600
                  }}
                  {...props}
                />
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
              code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');

                if (!className?.includes('language-')) {
                  return (
                    <Typography
                      component="code"
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        p: '0.3em 0.4em',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '0.85em',
                        fontWeight: 500
                      }}
                      {...props}
                    >
                      {children}
                    </Typography>
                  );
                }

                return (
                  <Box sx={{ position: 'relative', my: 2, overflow: 'hidden', borderRadius: '6px' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#161b22',
                        borderBottom: '1px solid #30363d',
                        padding: '4px 16px',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#8b949e',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'lowercase'
                        }}
                      >
                        {match ? match[1] : 'code'}
                      </Typography>
                      <Tooltip title={copiedCode === codeContent ? "Copied!" : "Copy code"}>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(codeContent)}
                          sx={{
                            color: copiedCode === codeContent ? '#7ee787' : '#8b949e',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <SyntaxHighlighter
                      style={materialDark}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0 }}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </Box>
                );
              }
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
