'use client';

import { Box, styled, IconButton, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';
import { Session, Message } from '@/types';
import LeftSidebar from '@/components/sidebars/LeftSidebar';
import RightSidebar from '@/components/sidebars/RightSidebar';
import ChatLayout from '@/components/layouts/ChatLayout';
import WelcomePage from '@/components/layouts/WelcomePage';
import { apiService } from '@/services/apiService';
import MenuIcon from '@mui/icons-material/Menu';
import CodeIcon from '@mui/icons-material/Code';

// Add interface for sidebar props
interface SidebarProps {
  isOpen: boolean;
}

const Backdrop = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<SidebarProps>(({ isOpen }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1,
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? 'visible' : 'hidden',
  transition: 'all 0.3s ease',
  '@media (min-width: 769px)': {
    display: 'none',
  },
}));

const AppContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
  position: 'relative',
});

const MainContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
});

const LeftSidebarContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<SidebarProps>(({ theme, isOpen }) => ({
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: '48px', // Account for footer height
  width: '300px',
  borderRight: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  zIndex: theme.zIndex.drawer,
  '@media (max-width: 1200px)': {
    width: '250px',
  },
  '@media (max-width: 768px)': {
    width: '85%',
    maxWidth: '360px',
    boxShadow: isOpen ? '4px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
    zIndex: theme.zIndex.modal,
  },
}));

const RightSidebarContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<SidebarProps>(({ theme, isOpen }) => ({
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: '48px', // Account for footer height
  width: '350px',
  borderLeft: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  zIndex: theme.zIndex.drawer,
  '@media (max-width: 1200px)': {
    width: '300px',
  },
  '@media (max-width: 768px)': {
    width: '85%',
    maxWidth: '360px',
    boxShadow: isOpen ? '-4px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
    zIndex: theme.zIndex.modal,
  },
}));

const MainArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'leftOpen' && prop !== 'rightOpen',
})<{ leftOpen?: boolean; rightOpen?: boolean }>(({ leftOpen, rightOpen }) => ({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  transition: 'all 0.3s ease',
  '@media (min-width: 769px)': {
    marginLeft: leftOpen ? '300px' : '36px',
    marginRight: rightOpen ? '350px' : '36px',
    width: 'auto',
    '@media (max-width: 1200px)': {
      marginLeft: leftOpen ? '250px' : '36px',
      marginRight: rightOpen ? '300px' : '36px',
    },
  },
  '@media (max-width: 768px)': {
    marginLeft: '36px',
    marginRight: '36px',
    position: 'relative',
    zIndex: 1,
    width: 'calc(100% - 72px)', // Account for both toggle buttons
  }
}));

const SidebarToggle = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  zIndex: 1040,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: 0,
  padding: '8px',
  minHeight: '36px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '@media (max-width: 768px)': {
    minHeight: '32px',
    padding: '6px',
  },
}));

const LeftSidebarToggle = styled(SidebarToggle)({
  left: 0,
  top: 0,
});

const RightSidebarToggle = styled(SidebarToggle)({
  right: 0,
  top: 0,
});

const Footer = styled(Box)(({ theme }) => ({
  height: '48px',
  minHeight: '48px',
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: 15,
  fontSize: '0.875rem',
  width: '100%',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'fixed',
  bottom: 0,
  left: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  alignItems: 'center',
  padding: '0 1.5rem',
}));

const ApiStatus = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'connected',
})<{ connected: boolean }>(({ theme, connected }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: connected ? theme.palette.success.main : theme.palette.error.main,
  gridColumn: 1,
  justifySelf: 'start',
}));

const Copyright = styled(Box)(({ theme }) => ({
  gridColumn: 2,
  justifySelf: 'center',
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const DebugContainer = styled(Box)({
  gridColumn: 3,
  justifySelf: 'end',
});

export default function Page() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [streamMode, setStreamMode] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiService.getSessions();
        setSessions(response);
        setApiConnected(true);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setApiConnected(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // On mobile, don't allow both sidebars to be open
        if (leftSidebarOpen && rightSidebarOpen) {
          setRightSidebarOpen(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [leftSidebarOpen, rightSidebarOpen]);

  const handleSessionCreate = async (username: string) => {
    try {
      const newSession = await apiService.createSession(username);
      setSessions([...sessions, newSession]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSessionSelect = async (session: Session) => {
    setCurrentSession(session);
    try {
      const messages = await apiService.getMessages(session.id);
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]); // Clear messages on error
    }
  };

  const handleMessagesUpdate = (updatedMessages: Message[]) => {
    setMessages(updatedMessages);

    if (!streamMode) {
      const hasMetadata = updatedMessages.some(msg =>
        (msg.role === 'model' || msg.role === 'assistant') &&
        msg.metadata && (
          msg.metadata.code?.length > 0 ||
          msg.metadata.search_results?.length > 0 ||
          msg.metadata.image_analysis
        )
      );

      if (hasMetadata) {
        setRightSidebarOpen(true);
      }
    }
  };

  const handleSessionDelete = async (sessionId: string) => {
    try {
      await apiService.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleLeftSidebarToggle = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
    if (!leftSidebarOpen && rightSidebarOpen && window.innerWidth <= 768) {
      setRightSidebarOpen(false);
    }
  };

  const handleRightSidebarToggle = () => {
    setRightSidebarOpen(!rightSidebarOpen);
    if (!rightSidebarOpen && leftSidebarOpen && window.innerWidth <= 768) {
      setLeftSidebarOpen(false);
    }
  };

  // Stream mode effect
  useEffect(() => {
    if (streamMode) {
      setRightSidebarOpen(false);
    }
  }, [streamMode]);

  const handleBackdropClick = () => {
    if (window.innerWidth <= 768) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  };

  return (
    <AppContainer>
      <Backdrop isOpen={leftSidebarOpen || rightSidebarOpen} onClick={handleBackdropClick} />

      <LeftSidebarToggle
        onClick={handleLeftSidebarToggle}
        sx={{
          display: leftSidebarOpen ? 'none' : 'flex'
        }}
      >
        <MenuIcon />
      </LeftSidebarToggle>

      <RightSidebarToggle
        onClick={handleRightSidebarToggle}
        sx={{
          display: rightSidebarOpen ? 'none' : 'flex',
          visibility: streamMode ? 'hidden' : 'visible'
        }}
        aria-label="Python Code"
      >
        <Tooltip title="Python Code" placement="left">
          <CodeIcon />
        </Tooltip>
      </RightSidebarToggle>

      <MainContainer>
        <LeftSidebarContainer isOpen={leftSidebarOpen}>
          <LeftSidebar
            sessions={sessions}
            currentSession={currentSession}
            onSessionCreate={handleSessionCreate}
            onSessionSelect={handleSessionSelect}
            onSessionDelete={handleSessionDelete}
            open={leftSidebarOpen}
            onClose={handleLeftSidebarToggle}
          />
        </LeftSidebarContainer>

        <MainArea leftOpen={leftSidebarOpen} rightOpen={rightSidebarOpen}>
          {currentSession ? (
            <ChatLayout
              sessionId={currentSession.id}
              messages={messages}
              onMessagesUpdate={handleMessagesUpdate}
              streamMode={streamMode}
              onStreamModeChange={setStreamMode}
            />
          ) : (
            <WelcomePage />
          )}
        </MainArea>

        <RightSidebarContainer isOpen={rightSidebarOpen}>
          <RightSidebar
            messages={messages}
            open={rightSidebarOpen}
            onClose={handleRightSidebarToggle}
          />
        </RightSidebarContainer>
      </MainContainer>
      <Footer>
        <ApiStatus connected={apiConnected}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }} />
          API {apiConnected ? 'Connected' : 'Disconnected'}
        </ApiStatus>
        <Copyright>
          © 2024 Chatbot
        </Copyright>
        <DebugContainer>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
            }
            label="Debug Mode"
            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
          />
        </DebugContainer>
      </Footer>
    </AppContainer>
  );
}
