import { Box, Typography, Paper, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';
import { omitRef } from '../../utils/omitRef';

interface CodeBlockProps {
  code: {
    language?: string;
    content: string;
    explanation?: string;
    execution_result?: string;
  };
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  // Prepare code with language specification for markdown
  const codeWithLanguage = `\`\`\`${code.language || 'python'}\n${code.content}\n\`\`\``;

  const handleCopy = () => {
    navigator.clipboard.writeText(code.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 1.5,
        mb: 1.5,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Code header with language and copy button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#f0f2f5'
        }}
      >
        <Typography variant="caption" sx={{ color: '#57606a', fontWeight: 500, textTransform: 'uppercase' }}>
          {code.language || 'python'}
        </Typography>
        <IconButton
          size="small"
          onClick={handleCopy}
          aria-label="Copy code"
          title="Copy to clipboard"
          sx={{
            fontSize: '0.75rem',
            color: copied ? '#2e7d32' : '#57606a',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)', color: '#0969da' }
          }}
        >
          <ContentCopyIcon fontSize="small" />
          {copied && (
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold', color: '#2e7d32' }}>
              Copied!
            </Typography>
          )}
        </IconButton>
      </Box>

      {/* Code syntax highlighting */}
      <Box sx={{ backgroundColor: '#f6f8fa', color: '#24292e' }}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          components={{
            pre: (props) => (
              <Box
                component="pre"
                sx={{
                  margin: 0,
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  '& code': {
                    display: 'block',
                    overflow: 'auto',
                    p: 1.5
                  }
                }}
                {...omitRef(props)}
              />
            )
          }}
        >
          {codeWithLanguage}
        </ReactMarkdown>
      </Box>

      {/* Execution result */}
      {code.execution_result && (
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#f8f8f8',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Output:
          </Typography>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              p: (props) => (
                <Typography variant="body2" sx={{ my: 0.5 }} {...omitRef(props)} />
              ),
              pre: (props) => (
                <Box
                  component="pre"
                  sx={{
                    p: 1,
                    backgroundColor: '#f1f1f1',
                    borderRadius: 1,
                    fontSize: '0.85rem',
                    margin: 0,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    lineHeight: 1.5
                  }}
                  {...omitRef(props)}
                />
              ),
              code: (props) => (
                <Typography
                  component="code"
                  sx={{
                    display: 'block',
                    fontFamily: 'monospace'
                  }}
                  {...omitRef(props)}
                />
              )
            }}
          >
            {`\`\`\`\n${code.execution_result}\n\`\`\``}
          </ReactMarkdown>
        </Box>
      )}

      {/* Explanation with markdown */}
      {code.explanation && (
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Explanation:
          </Typography>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              p: (props) => (
                <Typography variant="body2" sx={{ my: 0.5 }} {...omitRef(props)} />
              ),
              a: (props) => (
                <Box
                  component="a"
                  href={props.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  {...omitRef(props)}
                />
              ),
              ul: (props) => (
                <Box component="ul" sx={{ pl: 2, mt: 1 }} {...omitRef(props)} />
              ),
              li: (props) => (
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }} {...omitRef(props)} />
              ),
              code: (props) => (
                <Typography
                  component="code"
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    p: 0.3,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                  {...omitRef(props)}
                />
              )
            }}
          >
            {code.explanation}
          </ReactMarkdown>
        </Box>
      )}
    </Paper>
  );
};
