export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number; // unix seconds
  updatedAt: number; // unix seconds
  priority?: number;
  dueDate?: number; // unix seconds at UTC midnight (date-only)
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: number | null;
  dueDate?: number | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number | null;
  dueDate?: number | null;
}
