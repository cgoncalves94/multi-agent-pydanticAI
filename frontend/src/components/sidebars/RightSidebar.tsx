'use client';

import { Box, IconButton, Typography, styled, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import { Message, MessageMetadata } from '@/types';
import { CodeBlock } from '@/components/chat/CodeBlock';
import { SearchResults } from '@/components/chat/SearchResults';
import { ImageAnalysis } from '@/components/chat/ImageAnalysis';
import { useState, useEffect, useCallback } from 'react';

const SidebarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: '48px', // Fixed distance from bottom (footer height)
  height: 'auto', // Let height auto-adjust based on top and bottom
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  transition: 'transform 0.3s ease-in-out, width 0.3s ease-in-out',
  zIndex: 1200,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

interface RightSidebarProps {
  messages: Message[];
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      sx={{ flex: 1, overflow: 'auto' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: '48px',
  '& .MuiTab-root': {
    minHeight: '48px',
    textTransform: 'none',
    fontWeight: 'medium',
    fontSize: '0.9rem',
  },
  '& .Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

export default function RightSidebar({ messages, open, onClose }: RightSidebarProps) {
  const [currentTab, setCurrentTab] = useState(0);

  const getAllResults = useCallback((): MessageMetadata => {
    const assistantMessages = messages.filter(msg => msg.role === 'model' || msg.role === 'assistant');

    const results: MessageMetadata = {
      code: [],
      search_results: [],
      image_analysis: null,
    };

    assistantMessages.reverse().forEach(msg => {
      if (!msg.metadata) return;

      // Handle code results
      if (msg.metadata.code?.length && !results.code.length) {
        results.code = msg.metadata.code;
      } else if (msg.metadata.code_result && !results.code.length) {
        // Convert from original schema
        results.code = [{
          content: msg.metadata.code_result.code,
          explanation: msg.metadata.code_result.explanation,
          execution_result: msg.metadata.code_result.execution_result
        }];
      }

      // Handle search results
      if (msg.metadata.search_results?.length && !results.search_results.length) {
        results.search_results = msg.metadata.search_results;
      } else if (msg.metadata.search_result && !results.search_results.length) {
        // Convert from original schema
        results.search_results = [{
          title: 'Search Results',
          snippet: msg.metadata.search_result.answer,
          sources: msg.metadata.search_result.sources
        }];
      }

      // Handle image analysis
      if (msg.metadata.image_analysis && !results.image_analysis) {
        results.image_analysis = msg.metadata.image_analysis;
      } else if (msg.metadata.image_analysis_result && !results.image_analysis) {
        // Convert from original schema
        results.image_analysis = {
          analysis: msg.metadata.image_analysis_result.description,
          detections: msg.metadata.image_analysis_result.objects.map(obj => ({ label: obj })),
          scene_type: msg.metadata.image_analysis_result.scene_type
        };
      }
    });

    return results;
  }, [messages]);

  const results = getAllResults();
  const hasCode = results.code.length > 0;
  const hasSearch = results.search_results.length > 0;
  const hasImage = results.image_analysis !== null;

  // Reset tab when sidebar is opened
  useEffect(() => {
    if (open) {
      // Always reset to the first tab (0) when opening
      setCurrentTab(0);
    }
  }, [open]);

  // Make sure the current tab is valid when content changes
  useEffect(() => {
    const tabCount = [hasCode, hasSearch, hasImage].filter(Boolean).length;
    if (tabCount > 0 && currentTab >= tabCount) {
      // If current tab is now invalid, set to the last valid tab
      setCurrentTab(tabCount - 1);
    }
  }, [hasCode, hasSearch, hasImage, currentTab]);

  // Ensure we pick the correct tab index based on which content types are available
  const getTabIndex = (contentType: 'code' | 'search' | 'image'): number => {
    // Count available tabs before the requested type
    let index = 0;

    if (contentType === 'code') return 0;

    if (contentType === 'search') {
      // If we have code tab, search will be at index 1
      if (hasCode) index += 1;
      return index;
    }

    if (contentType === 'image') {
      // Add 1 for each tab that comes before image
      if (hasCode) index += 1;
      if (hasSearch) index += 1;
      return index;
    }

    return 0;
  };

  return (
    <SidebarContainer
      sx={{
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        width: '350px',
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: '48px',
        backgroundColor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        zIndex: 1200,
      }}
    >
      <SidebarHeader>
        <Typography variant="h6">Results</Typography>
        <IconButton
          onClick={onClose}
          size="small"
          edge="end"
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </SidebarHeader>

      {(!hasCode && !hasSearch && !hasImage) ? (
        <Box p={2}>
          <Typography color="textSecondary" align="center">
            No results to display
          </Typography>
        </Box>
      ) : (
        <>
          <StyledTabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            aria-label="result tabs"
          >
            {hasCode && <Tab icon={<CodeIcon />} label="Python Code" />}
            {hasSearch && <Tab icon={<SearchIcon />} label="Search" />}
            {hasImage && <Tab icon={<ImageIcon />} label="Image" />}
          </StyledTabs>

          {hasCode && (
            <TabPanel value={currentTab} index={0}>
              {results.code.map((codeBlock, index) => (
                <Box key={index} mb={index < results.code.length - 1 ? 2 : 0}>
                  <CodeBlock code={codeBlock} />
                </Box>
              ))}
            </TabPanel>
          )}

          {hasSearch && (
            <TabPanel value={currentTab} index={getTabIndex('search')}>
              <SearchResults results={results.search_results} />
            </TabPanel>
          )}

          {hasImage && results.image_analysis && (
            <TabPanel value={currentTab} index={getTabIndex('image')}>
              <ImageAnalysis analysis={results.image_analysis} />
            </TabPanel>
          )}
        </>
      )}
    </SidebarContainer>
  );
}
