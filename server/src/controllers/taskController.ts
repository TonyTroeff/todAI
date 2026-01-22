import { Request, Response } from 'express';
import Task, { ITask, TaskStatus } from '../models/Task.js';

type Nullable<T> = T | null;

type CreateTaskBody = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Nullable<number>;
  dueDate?: Nullable<number>; // unix seconds (UTC midnight)
};

type UpdateTaskBody = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Nullable<number>;
  dueDate?: Nullable<number>; // unix seconds (UTC midnight)
};

function isValidPriority(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 9;
}

function parseDueDateUnixSeconds(value: unknown): { ok: true; date: Date } | { ok: false; message: string } {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ok: false, message: 'dueDate must be a unix timestamp in seconds' };
  }

  const ms = value * 1000;
  const date = new Date(ms);
  if (!Number.isFinite(date.getTime())) {
    return { ok: false, message: 'dueDate must be a valid unix timestamp in seconds' };
  }

  if (
    date.getUTCHours() !== 0 ||
    date.getUTCMinutes() !== 0 ||
    date.getUTCSeconds() !== 0 ||
    date.getUTCMilliseconds() !== 0
  ) {
    return { ok: false, message: 'dueDate must represent UTC midnight (date-only)' };
  }

  return { ok: true, date };
}

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate } = req.body as CreateTaskBody;

    if (priority !== undefined && priority !== null && !isValidPriority(priority)) {
      res.status(400).json({ message: 'priority must be an integer between 1 and 9' });
      return;
    }

    let dueDateAsDate: Date | undefined;
    if (dueDate !== undefined && dueDate !== null) {
      const parsed = parseDueDateUnixSeconds(dueDate);
      if (!parsed.ok) {
        res.status(400).json({ message: parsed.message });
        return;
      }
      dueDateAsDate = parsed.date;
    }

    const task = await Task.create({
      title,
      description: description ?? '',
      status: status ?? 'todo',
      ...(priority !== undefined && priority !== null ? { priority } : {}),
      ...(dueDateAsDate ? { dueDate: dueDateAsDate } : {}),
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate } = req.body as UpdateTaskBody;

    if (priority !== undefined && priority !== null && !isValidPriority(priority)) {
      res.status(400).json({ message: 'priority must be an integer between 1 and 9' });
      return;
    }

    let dueDateAsDate: Date | undefined;
    if (dueDate !== undefined && dueDate !== null) {
      const parsed = parseDueDateUnixSeconds(dueDate);
      if (!parsed.ok) {
        res.status(400).json({ message: parsed.message });
        return;
      }
      dueDateAsDate = parsed.date;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    if (priority === null) {
      (task as unknown as ITask).priority = undefined;
    } else if (priority !== undefined) {
      (task as unknown as ITask).priority = priority;
    }

    if (dueDate === null) {
      (task as unknown as ITask).dueDate = undefined;
    } else if (dueDate !== undefined) {
      (task as unknown as ITask).dueDate = dueDateAsDate;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};
