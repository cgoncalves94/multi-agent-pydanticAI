import { Box, Typography, Paper } from '@mui/material';
import { ImageDetection } from '@/types/chatTypes';
import ReactMarkdown from 'react-markdown';
import { omitRef } from '../../utils/omitRef';

interface ImageAnalysisProps {
  analysis: {
    analysis: string;
    detections?: ImageDetection[];
    scene_type?: string;
  };
}

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ analysis }) => {
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
      {/* Main analysis with markdown rendering */}
      <Box sx={{ p: 1.5 }}>
        <ReactMarkdown
          components={{
            p: (props) => (
              <Typography variant="body2" component="p" color="text.secondary" sx={{ mt: 1 }} {...omitRef(props)} />
            ),
            h1: (props) => (
              <Typography variant="h6" component="h1" sx={{ mt: 2, mb: 1 }} {...omitRef(props)} />
            ),
            h2: (props) => (
              <Typography variant="subtitle1" component="h2" sx={{ mt: 2, mb: 1 }} {...omitRef(props)} />
            ),
            h3: (props) => (
              <Typography variant="subtitle2" component="h3" sx={{ mt: 1.5, mb: 0.5 }} {...omitRef(props)} />
            ),
            ul: (props) => (
              <Box component="ul" sx={{ pl: 2, mt: 1 }} {...omitRef(props)} />
            ),
            li: (props) => (
              <Typography component="li" variant="body2" color="text.secondary" {...omitRef(props)} />
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
                {...omitRef(props)}
              />
            )
          }}
        >
          {analysis.analysis}
        </ReactMarkdown>
      </Box>

      {/* Scene type section */}
      {analysis.scene_type && (
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Scene Type:
          </Typography>
          <ReactMarkdown
            components={{
              p: (props) => (
                <Typography variant="body2" component="p" color="text.secondary" {...omitRef(props)} />
              )
            }}
          >
            {analysis.scene_type}
          </ReactMarkdown>
        </Box>
      )}

      {/* Detections section */}
      {analysis.detections && analysis.detections.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#f8f8f8',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Detections:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysis.detections.map((detection, index) => (
              <Box
                key={`${detection.label}-${index}`}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2">
                  {detection.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
