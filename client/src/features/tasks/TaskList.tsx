import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Fab,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useGetTasksQuery } from '@/features/tasks/tasksApi';
import type { Task } from '@/types/task';
import { TaskItem } from '@/features/tasks/components/TaskItem';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { getRtkQueryErrorMessage } from '@/utils/rtkQueryError';

function LoadingGrid() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Grid key={idx} item xs={12} sm={6} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="rounded" width={120} height={28} sx={{ mt: 2 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export function TaskList() {
  const { data: tasks, isLoading, isError, error, refetch } = useGetTasksQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const sortedTasks = useMemo(() => tasks ?? [], [tasks]);

  const openCreate = () => {
    setEditingTask(undefined);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTask(undefined);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <LoadingGrid />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Failed to load tasks</Typography>
            <Typography variant="body2" color="text.secondary">
              {getRtkQueryErrorMessage(error, 'Please try again.')}
            </Typography>
            <Box>
              <Button variant="contained" onClick={() => refetch()}>
                Retry
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3, position: 'relative' }}>
      {sortedTasks.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <TaskAltIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" gutterBottom>
            No tasks yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first task to get started.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create task
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {sortedTasks.map((task) => (
            <Grid key={task.id} item xs={12} sm={6} md={4}>
              <TaskItem task={task} onEdit={openEdit} />
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="Add task"
        onClick={openCreate}
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <AddIcon />
      </Fab>

      <TaskForm open={formOpen} onClose={closeForm} task={editingTask} />
    </Container>
  );
}
