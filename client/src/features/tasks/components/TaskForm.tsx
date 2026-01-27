import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Task, TaskStatus } from '@/types/task';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/features/tasks/tasksApi';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getRtkQueryErrorMessage } from '@/utils/rtkQueryError';
import {
  dateInputFromUnixSecondsUtcMidnight,
  unixSecondsUtcMidnightFromDateInput,
} from '@/utils/date';

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

type TaskFormProps = {
  open: boolean;
  onClose: () => void;
  task?: Task;
};

type FieldErrors = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
};

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export function TaskForm({ open, onClose, task }: TaskFormProps) {
  const isEdit = Boolean(task);
  const { showSuccess, showError } = useSnackbar();

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const isSaving = isCreating || isUpdating;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (task) {
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setStatus(task.status ?? 'todo');
      setPriority(task.priority !== undefined ? String(task.priority) : '');
      setDueDate(task.dueDate !== undefined ? dateInputFromUnixSecondsUtcMidnight(task.dueDate) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('');
      setDueDate('');
    }
  }, [open, task]);

  const titleHelperText = useMemo(() => {
    const count = title.length;
    const base = `${count}/${TITLE_MAX}`;
    if (errors.title) return `${errors.title} • ${base}`;
    return base;
  }, [errors.title, title]);

  const descriptionHelperText = useMemo(() => {
    const count = description.length;
    const base = `${count}/${DESCRIPTION_MAX}`;
    if (errors.description) return `${errors.description} • ${base}`;
    return base;
  }, [errors.description, description]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Title is required';
    } else if (trimmedTitle.length > TITLE_MAX) {
      nextErrors.title = `Title must be at most ${TITLE_MAX} characters`;
    }

    if (description.length > DESCRIPTION_MAX) {
      nextErrors.description = `Description must be at most ${DESCRIPTION_MAX} characters`;
    }

    if (!statusOptions.some((o) => o.value === status)) {
      nextErrors.status = 'Invalid status';
    }

    const trimmedPriority = priority.trim();
    if (trimmedPriority) {
      const asNumber = Number(trimmedPriority);
      if (!Number.isInteger(asNumber)) {
        nextErrors.priority = 'Priority must be an integer';
      } else if (asNumber < 1 || asNumber > 9) {
        nextErrors.priority = 'Priority must be between 1 and 9';
      }
    }

    if (dueDate.trim()) {
      try {
        unixSecondsUtcMidnightFromDateInput(dueDate);
      } catch {
        nextErrors.dueDate = 'Due date must be a valid date';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const priorityValue = priority.trim()
      ? Number(priority.trim())
      : null;

    const dueDateValue = dueDate.trim()
      ? unixSecondsUtcMidnightFromDateInput(dueDate.trim())
      : null;

    try {
      if (task) {
        await updateTask({
          id: task.id,
          updates: {
            title: title.trim(),
            description: description.trim(),
            status,
            priority: priorityValue,
            dueDate: dueDateValue,
          },
        }).unwrap();

        showSuccess('Task updated');
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          status,
          priority: priorityValue,
          dueDate: dueDateValue,
        }).unwrap();

        showSuccess('Task created');
      }

      onClose();
    } catch (error) {
      const message = getRtkQueryErrorMessage(error, 'Failed to save task');
      showError(message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit task' : 'Create a new task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            error={Boolean(errors.title)}
            helperText={titleHelperText}
            inputProps={{ maxLength: TITLE_MAX }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            error={Boolean(errors.description)}
            helperText={descriptionHelperText}
            inputProps={{ maxLength: DESCRIPTION_MAX }}
          />

          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel id="task-status-label">Status</InputLabel>
            <Select
              labelId="task-status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.status ? <FormHelperText>{errors.status}</FormHelperText> : null}
          </FormControl>

          <TextField
            label="Priority (1–9)"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            fullWidth
            type="number"
            error={Boolean(errors.priority)}
            helperText={errors.priority ?? 'Optional. 1 is most important, 9 is least important.'}
            inputProps={{ min: 1, max: 9, step: 1 }}
          />

          <TextField
            label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            type="date"
            error={Boolean(errors.dueDate)}
            helperText={errors.dueDate ?? 'Optional. Date-only (stored and displayed as UTC date).'}
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="body2" color="text.secondary">
            Validation matches the back-end rules (title required, max lengths, and allowed status values).
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          {isEdit ? 'Save changes' : 'Create task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
