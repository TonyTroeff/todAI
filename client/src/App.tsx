import { Container, Typography, Box, Paper } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <TaskAltIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h1" component="h1" color="primary">
            todAI
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Your Intelligent Task Manager
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Welcome to todAI! The application is set up and ready for development.
        </Typography>
        <Box sx={{ mt: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Quick Start
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Backend API running on port 5000
            <br />
            • Frontend dev server running on port 5173
            <br />
            • RTK Query configured for task CRUD operations
            <br />
            • Material UI theme ready for customization
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
