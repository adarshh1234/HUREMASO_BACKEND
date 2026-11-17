import { Types, Document } from 'mongoose';

export type TaskColumn = 'new-task' | 'scheduled' | 'in-progress' | 'completed';
export type TaskType = 'Operational' | 'Technical' | 'Hiring' | 'Strategic' | 'Financial' | string;
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ITask {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  type?: TaskType;
  dueDate?: string; // e.g. "Dec 18" or "2026-12-18"
  startDate?: string;
  column: TaskColumn;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: Types.ObjectId | any;
  assigneeName?: string;
  assigneeAvatar?: string;
  completedAt?: Date;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITaskDocument = Document & ITask;

export interface ITodo {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  category: string; // e.g. "Payroll", "Off-Boarding", "Events", "Compliance", "General"
  completed: boolean;
  completedAt?: Date;
  dueDate?: string; // e.g. "Today", "Tomorrow", "Sept 06"
  priority?: string;
  description?: string;
  employeeId?: Types.ObjectId | any;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITodoDocument = Document & ITodo;

export interface CreateTaskDTO {
  title: string;
  type?: TaskType;
  dueDate?: string;
  startDate?: string;
  column?: TaskColumn;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdBy?: string;
}

export interface CreateTodoDTO {
  title: string;
  category?: string;
  completed?: boolean;
  dueDate?: string;
  priority?: string;
  description?: string;
  employeeId?: string;
}

export interface TaskQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  column?: string;
  type?: string;
  priority?: string;
  assigneeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TodoQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  completed?: boolean | string;
  priority?: string;
  employeeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TodoStatsSummary {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
}

export interface TaskCountsSummary {
  total: number;
  newTask: number;
  scheduled: number;
  inProgress: number;
  completed: number;
}
