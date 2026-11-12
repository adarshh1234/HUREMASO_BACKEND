import { Types, Document } from 'mongoose';

export type TaskColumn = 'new-task' | 'scheduled' | 'in-progress' | 'completed';
export type TaskType = 'Operational' | 'Technical' | 'Hiring' | 'Strategic' | 'Financial' | string;

export interface ITask {
  _id?: string | Types.ObjectId;
  title: string;
  type?: TaskType;
  dueDate?: string; // e.g. "Dec 18" or "2026-12-18"
  column: TaskColumn;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assigneeId?: Types.ObjectId | any;
  assigneeName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITaskDocument = Document & ITask;

export interface ITodo {
  _id?: string | Types.ObjectId;
  title: string;
  category: string; // e.g. "Payroll", "Off-Boarding", "Events", "Compliance", "General"
  completed: boolean;
  dueDate?: string; // e.g. "Today", "Tomorrow", "Sept 06"
  priority?: string;
  employeeId?: Types.ObjectId | any;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITodoDocument = Document & ITodo;

export interface CreateTaskDTO {
  title: string;
  type?: TaskType;
  dueDate?: string;
  column?: TaskColumn;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assigneeId?: string;
  assigneeName?: string;
}

export interface CreateTodoDTO {
  title: string;
  category?: string;
  completed?: boolean;
  dueDate?: string;
  priority?: string;
  employeeId?: string;
}

export interface TaskQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  column?: string;
  type?: string;
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
  employeeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
