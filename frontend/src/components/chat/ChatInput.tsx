import {
  Box,
  TextField,
  IconButton,
  Paper,
  styled,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { alpha } from '@mui/material/styles';

const InputContainer = styled(Paper)(({ theme }) => ({
  marginTop: 'auto',
  backgroundColor: theme.palette.background.default,
  padding: 0,
  position: 'relative',
  zIndex: 20,
  width: '100%',
  boxSizing: 'border-box',
  margin: 0,
  borderRadius: 0,
  borderTop: `1px solid ${theme.palette.divider}`
}));

const InputControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  width: '100%',
  padding: '8px 16px',
  '& .MuiTextField-root': {
    flex: 1,
    minWidth: 0,
    '& .MuiInputBase-root': {
      width: '100%',
    }
  },
  [theme.breakpoints.down('sm')]: {
    gap: '6px',
    padding: '8px',
  }
}));

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  currentImagePath: string | null;
  setCurrentImagePath: (path: string | null) => void;
}

// Image preview container styles
const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
  width: '100%',
  maxWidth: '300px',
  margin: '0 auto',
}));

// Image preview styles
const ImagePreview = styled('img')({
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  display: 'block',
});

// Style for the remove button
const RemoveImageButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: '5px',
  right: '5px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

// Style for the upload zone
const UploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: theme.spacing(2),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  currentImagePath,
  setCurrentImagePath,
}) => {
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(!!currentImagePath);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update hasImage when currentImagePath changes
  useEffect(() => {
    setHasImage(!!currentImagePath);
  }, [currentImagePath]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !hasImage) || disabled) return;

    onSendMessage(message);
    setMessage('');
    // clearImage not needed here as it will be handled in ChatLayout after sending
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((!message.trim() && !hasImage) || disabled) return;

      onSendMessage(message);
      setMessage('');
      clearImage();
    }
  };

  // Open dialog to upload an image
  const handleOpenUploadDialog = () => {
    setOpenDialog(true);
  };

  // Close the upload dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setHasImage(true);
    };
    reader.readAsDataURL(file);
  };

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setHasImage(false);
    setCurrentImagePath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload the image to the server
  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      const result = await apiService.uploadImage(imageFile);
      // Use the filename directly as returned by the API
      setCurrentImagePath(result.filename);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  return (
    <Box sx={{
      width: '100%',
      margin: 0,
      padding: 0,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent'
      }
    }}>
      {/* Image indicator shown as a small badge */}
      {hasImage && (imagePreview || currentImagePath) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: -1, mb: 0.5, ml: 2 }}>
          <Typography
            variant="caption"
            color="primary"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              borderRadius: 1,
              py: 0.5,
              px: 1
            }}
          >
            <ImageIcon fontSize="inherit" />
            Image attached
            <IconButton
              size="small"
              color="primary"
              onClick={clearImage}
              sx={{ p: 0, ml: 0.5, width: 14, height: 14 }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Typography>
        </Box>
      )}

      <InputContainer elevation={0}>
        <form onSubmit={handleSubmit} style={{ width: '100%', margin: 0, padding: 0 }}>
          <InputControls>
            <IconButton
              color="primary"
              onClick={handleOpenUploadDialog}
              disabled={disabled}
              size="small"
              sx={{
                flexShrink: 0,
                padding: '6px'
              }}
            >
              <ImageIcon fontSize="small" />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={hasImage ? "Add a description for your image..." : "Type your message..."}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '18px',
                  width: '100%',
                  padding: { xs: '8px 12px', sm: '8px 14px' }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& textarea': {
                  overflowY: 'auto !important'
                }
              }}
            />
            <IconButton
              type="submit"
              disabled={((!message.trim() && !hasImage) || disabled)}
              color="primary"
              size="small"
              sx={{
                flexShrink: 0,
                padding: '6px'
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </InputControls>
        </form>
      </InputContainer>

      {/* Image Upload Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Image
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {imagePreview ? (
            <ImagePreviewContainer>
              <ImagePreview src={imagePreview} alt="Preview" />
              <RemoveImageButton size="small" onClick={clearImage}>
                <CloseIcon fontSize="small" />
              </RemoveImageButton>
            </ImagePreviewContainer>
          ) : (
            <UploadZone onClick={handleUploadClick}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Click to select an image
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Supports: JPG, PNG, GIF (max 5MB)
              </Typography>
            </UploadZone>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleImageUpload}
            color="primary"
            disabled={!imageFile}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
