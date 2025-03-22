'use client';

import { Box, Switch, Typography, styled } from '@mui/material';

const ModeLabel = styled(Typography)(({ }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'color 0.2s ease',
}));

interface ModeToggleProps {
  isStructured: boolean;
  onChange: () => void;
}

export default function ModeToggle({ isStructured, onChange }: ModeToggleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ModeLabel
        sx={{
          color: !isStructured ? 'primary.main' : 'text.secondary',
          cursor: 'pointer',
        }}
        onClick={() => !isStructured || onChange()}
      >
        Stream
      </ModeLabel>
      <Switch
        size="small"
        checked={isStructured}
        onChange={onChange}
        inputProps={{ 'aria-label': 'Toggle structured mode' }}
      />
      <ModeLabel
        sx={{
          color: isStructured ? 'primary.main' : 'text.secondary',
          cursor: 'pointer',
        }}
        onClick={() => isStructured || onChange()}
      >
        Structured
      </ModeLabel>
    </Box>
  );
}
