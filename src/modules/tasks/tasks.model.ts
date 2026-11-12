import { Schema, model } from 'mongoose';
import { ITaskDocument, ITodoDocument } from './tasks.types';

// Kanban Task Schema
const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'Operational',
      index: true,
      trim: true,
    },
    dueDate: {
      type: String,
      trim: true,
    },
    column: {
      type: String,
      enum: ['new-task', 'scheduled', 'in-progress', 'completed'],
      default: 'new-task',
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
    },
    assigneeName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

TaskSchema.index({ column: 1, createdAt: -1 });

export const TaskModel = model<ITaskDocument>('Task', TaskSchema);

// Todo Item Schema
const TodoSchema = new Schema<ITodoDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dueDate: {
      type: String,
      default: 'Today',
      trim: true,
    },
    priority: {
      type: String,
      default: 'Normal',
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

TodoSchema.index({ completed: 1, createdAt: -1 });

export const TodoModel = model<ITodoDocument>('Todo', TodoSchema);
