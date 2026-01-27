import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Task, TaskStatus } from '@/types/task';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '@/features/tasks/tasksApi';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getRtkQueryErrorMessage } from '@/utils/rtkQueryError';
import {
  formatLocalDateTimeFromUnixSeconds,
  formatUtcDateFromUnixSeconds,
} from '@/utils/date';

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

function statusChipColor(status: TaskStatus): 'default' | 'primary' | 'success' {
  if (status === 'in-progress') return 'primary';
  if (status === 'done') return 'success';
  return 'default';
}

export type TaskItemProps = {
  task: Task;
  onEdit: (task: Task) => void;
};

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { showSuccess, showError } = useSnackbar();

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setStatus(task.status);
  }, [task.status]);

  const createdAt = useMemo(
    () => formatLocalDateTimeFromUnixSeconds(task.createdAt),
    [task.createdAt]
  );
  const updatedAt = useMemo(
    () => formatLocalDateTimeFromUnixSeconds(task.updatedAt),
    [task.updatedAt]
  );
  const dueDate = useMemo(
    () => (task.dueDate !== undefined ? formatUtcDateFromUnixSeconds(task.dueDate) : null),
    [task.dueDate]
  );

  const handleStatusChange = async (newStatus: TaskStatus) => {
    const previous = status;
    setStatus(newStatus);

    try {
      await updateTask({ id: task.id, updates: { status: newStatus } }).unwrap();
    } catch (error) {
      setStatus(previous);
      showError(getRtkQueryErrorMessage(error, 'Failed to update status'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id).unwrap();
      showSuccess('Task deleted');
      setConfirmOpen(false);
    } catch (error) {
      showError(getRtkQueryErrorMessage(error, 'Failed to delete task'));
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
            <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                {task.title}
              </Typography>
              {task.description ? (
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  {task.description}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No description
                </Typography>
              )}
            </Stack>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                renderValue={(value) => (
                  <Chip
                    size="small"
                    label={statusOptions.find((o) => o.value === value)?.label ?? value}
                    color={statusChipColor(value as TaskStatus)}
                    variant={value === 'todo' ? 'outlined' : 'filled'}
                  />
                )}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Chip
                      size="small"
                      label={option.label}
                      color={statusChipColor(option.value)}
                      variant={option.value === 'todo' ? 'outlined' : 'filled'}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: 2 }}>
            {task.priority !== undefined ? (
              <Typography variant="caption" color="text.secondary">
                Priority: {task.priority}
              </Typography>
            ) : null}
            {dueDate ? (
              <Typography variant="caption" color="text.secondary">
                Due: {dueDate}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              Created: {createdAt}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated: {updatedAt}
            </Typography>
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            aria-label="Edit task"
            onClick={() => onEdit(task)}
            sx={{ color: 'warning.main' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="Delete task"
            onClick={() => setConfirmOpen(true)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        message="This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        confirmLoading={isDeleting}
      />
    </>
  );
}
