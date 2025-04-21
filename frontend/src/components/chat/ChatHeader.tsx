import { Box, IconButton, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { ChatHeaderProps } from '@/types/chatTypes';
import ModeToggle from './ModeToggle';

export default function ChatHeader({ onClearChat, isStructured, onModeToggle }: ChatHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" component="h1">
        Chat
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ModeToggle isStructured={isStructured} onChange={onModeToggle} />
        <IconButton onClick={onClearChat} aria-label="Clear chat">
          <Delete />
        </IconButton>
      </Box>
    </Box>
  );
}
