import { Box, Container, Typography } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { TaskList } from '@/features/tasks/TaskList';

function App() {
  return (
    <Box sx={{ pb: 6 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 1,
          }}
        >
          <TaskAltIcon sx={{ fontSize: 44, color: 'primary.main' }} />
          <Typography variant="h1" component="h1" color="primary">
            todAI
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" align="center">
          Your Intelligent Task Manager
        </Typography>
      </Container>

      <TaskList />
    </Box>
  );
}

export default App;
