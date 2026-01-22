import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task.js';

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
    const { title, description, status } = req.body as ITask;

    const task = await Task.create({
      title,
      description,
      status,
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
    const { title, description, status } = req.body as Partial<ITask>;

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

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
