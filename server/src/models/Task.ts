import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface ITaskDocument extends ITask, Document {
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, { _id, __v, ...rest }) => ({ id: String(_id), ...rest }),
    },
  }
);

const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;
