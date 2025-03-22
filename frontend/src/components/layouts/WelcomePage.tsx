import { Box, Typography, Paper, styled, alpha } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';

const WelcomeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(2),
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '220px',
  textAlign: 'left',
  borderRadius: theme.spacing(1.5),
  background: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '280px',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: '8px',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
  '& > svg': {
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
  },
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '960px',
  margin: '0 auto',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    flexWrap: 'wrap',
    padding: theme.spacing(0, 2),
    gap: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0, 1),
  },
}));



export default function WelcomePage() {
  return (
    <WelcomeContainer>
      <Typography
        variant="h1"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
          textAlign: 'center',
          mb: { xs: 1, sm: 2 },
          color: theme => theme.palette.primary.main,
        }}
      >
        Multi-Agent Chat System
      </Typography>

      <Typography
        variant="h5"
        color="textSecondary"
        sx={{
          mb: { xs: 2, sm: 4 },
          textAlign: 'center',
          maxWidth: '600px',
          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
          lineHeight: 1.5,
          px: { xs: 1, sm: 2 },
        }}
      >
        Your intelligent assistant powered by a team of specialized AI agents.
      </Typography>

      <FeatureGrid>
        <FeatureCard elevation={0}>
          <FeatureIcon>
            <CodeIcon />
          </FeatureIcon>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Python Code Expert
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            Python & Pydantic expertise for code generation and debugging.
          </Typography>
        </FeatureCard>

        <FeatureCard elevation={0}>
          <FeatureIcon>
            <SearchIcon />
          </FeatureIcon>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Web Search Expert
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            Real-time information with cited sources.
          </Typography>
        </FeatureCard>

        <FeatureCard elevation={0}>
          <FeatureIcon>
            <ImageIcon />
          </FeatureIcon>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Image Analysis Expert
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            Object detection and scene understanding.
          </Typography>
        </FeatureCard>

        <FeatureCard elevation={0}>
          <FeatureIcon>
            <ChatIcon />
          </FeatureIcon>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Coordination
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            Intelligent task delegation for solutions.
          </Typography>
        </FeatureCard>
      </FeatureGrid>


    </WelcomeContainer>
  );
}
