import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask {
  title: string;
  description: string;
  status: TaskStatus;
  priority?: number;
  dueDate?: Date;
}

export interface ITaskDocument extends ITask, Document {
  createdAt: Date;
  updatedAt: Date;
}

function toUnixSeconds(date: Date | undefined): number | undefined {
  if (!date) return undefined;
  const time = date.getTime();
  if (!Number.isFinite(time)) return undefined;
  return Math.floor(time / 1000);
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be one of: todo, in-progress, done',
      },
      default: 'todo',
    },
    priority: {
      type: Number,
      min: [1, 'Priority must be between 1 and 9'],
      max: [9, 'Priority must be between 1 and 9'],
      validate: {
        validator: (value: unknown) => value === undefined || Number.isInteger(value),
        message: 'Priority must be an integer',
      },
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { _id, __v, createdAt, updatedAt, dueDate, ...rest } = ret as {
          _id: unknown;
          __v?: unknown;
          createdAt?: Date;
          updatedAt?: Date;
          dueDate?: Date;
          [key: string]: unknown;
        };

        return {
          id: String(_id),
          ...rest,
          createdAt: toUnixSeconds(createdAt),
          updatedAt: toUnixSeconds(updatedAt),
          ...(dueDate ? { dueDate: toUnixSeconds(dueDate) } : {}),
        };
      },
    },
  }
);

const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;
