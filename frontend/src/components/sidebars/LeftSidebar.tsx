'use client';

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Session } from '@/types';
import { Close, Delete, Add } from '@mui/icons-material';
import { useState } from 'react';

interface LeftSidebarProps {
  sessions: Session[];
  currentSession: Session | null;
  onSessionCreate: (username: string) => void;
  onSessionSelect: (session: Session) => void;
  onSessionDelete: (sessionId: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function LeftSidebar({
  sessions,
  currentSession,
  onSessionCreate,
  onSessionSelect,
  onSessionDelete,
  onClose,
}: LeftSidebarProps) {
  const [newUsername, setNewUsername] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateSession = () => {
    if (newUsername.trim()) {
      onSessionCreate(newUsername.trim());
      setNewUsername('');
      setDialogOpen(false);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onSessionDelete(sessionId);
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          size="small"
        >
          New Session
        </Button>
        <IconButton
          onClick={onClose}
          size="small"
          edge="end"
          aria-label="close"
        >
          <Close />
        </IconButton>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={!newUsername.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {sessions.map((session) => (
          <ListItem
            key={session.id}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(e) => handleDeleteSession(e, session.id)}
                size="small"
              >
                <Delete />
              </IconButton>
            }
          >
            <ListItemButton
              selected={currentSession?.id === session.id}
              onClick={() => onSessionSelect(session)}
            >
              <ListItemText
                primary={session.username}
                secondary={new Date(session.created_at).toLocaleString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {sessions.length === 0 && (
          <ListItem sx={{ justifyContent: 'center', py: 4 }}>
            <ListItemText
              primary="No sessions yet"
              secondary="Create one to get started!"
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
