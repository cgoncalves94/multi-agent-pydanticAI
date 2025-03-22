import { Box, Typography, Paper } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';

interface CodeBlockProps {
  code: {
    language?: string;
    content: string;
    explanation?: string;
    execution_result?: string;
  };
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 1,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Code syntax highlighting */}
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <SyntaxHighlighter
          language={code.language || 'python'}
          style={github}
          customStyle={{ margin: 0, fontSize: '0.75rem' }}
        >
          {code.content}
        </SyntaxHighlighter>
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
          <Typography
            component="pre"
            sx={{
              p: 1,
              backgroundColor: '#f1f1f1',
              borderRadius: 1,
              fontSize: '0.75rem',
              margin: 0,
              overflow: 'auto',
              fontFamily: 'monospace'
            }}
          >
            {code.execution_result}
          </Typography>
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
            components={{
              p: (props) => (
                <Typography variant="body2" sx={{ my: 0.5 }} {...props} />
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
                  {...props}
                />
              ),
              ul: (props) => (
                <Box component="ul" sx={{ pl: 2, mt: 1 }} {...props} />
              ),
              li: (props) => (
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }} {...props} />
              ),
              code: (props) => (
                <Typography
                  component="code"
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    p: 0.5,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                  {...props}
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
