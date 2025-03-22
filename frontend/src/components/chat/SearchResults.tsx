import { Box, Link, Typography, Paper } from '@mui/material';
import { SearchResult } from '@/types';
import ReactMarkdown from 'react-markdown';

interface SearchResultsProps {
  results: SearchResult[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

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
      <Box sx={{ p: 1.5 }}>
        {results.map((result, index) => (
          <Box
            key={`${result.url}-${index}`}
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'white',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Remove individual titles since they're redundant with the section title */}

            <ReactMarkdown
              components={{
                p: (props) => (
                  <Typography variant="body2" color="text.secondary" {...props} />
                ),
                a: (props) => (
                  <Link
                    href={props.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    {...props}
                  />
                ),
                ul: (props) => (
                  <Box component="ul" sx={{ pl: 2, mt: 1 }} {...props} />
                ),
                li: (props) => (
                  <Typography component="li" variant="body2" color="text.secondary" {...props} />
                ),
                code: (props) => (
                  <Typography
                    component="code"
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      p: 0.5,
                      borderRadius: 0.5,
                      fontFamily: 'monospace'
                    }}
                    {...props}
                  />
                )
              }}
            >
              {result.snippet}
            </ReactMarkdown>

            {/* Display nested sources if they exist */}
            {result.sources && Array.isArray(result.sources) && result.sources.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Sources:</Typography>
                {result.sources.map((source, i) => (
                  <Box key={`source-${i}`} sx={{ ml: 1, mt: 0.5 }}>
                    <Link
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontSize: '0.8rem',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {source}
                    </Link>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
