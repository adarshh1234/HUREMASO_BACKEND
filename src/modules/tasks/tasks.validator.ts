import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

// Kanban Task Validator
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').trim(),
  type: z.string().optional().default('Operational'),
  dueDate: z.string().optional(),
  column: z.enum(['new-task', 'scheduled', 'in-progress', 'completed']).optional().default('new-task'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  assigneeId: objectIdSchema.optional(),
  assigneeName: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const moveTaskSchema = z.object({
  column: z.enum(['new-task', 'scheduled', 'in-progress', 'completed']),
});

// Todo Validator
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Todo title is required').trim(),
  category: z.string().optional().default('General'),
  completed: z.boolean().optional().default(false),
  dueDate: z.string().optional().default('Today'),
  priority: z.string().optional().default('Normal'),
  employeeId: objectIdSchema.optional(),
});

export const updateTodoSchema = createTodoSchema.partial();

export const toggleTodoSchema = z.object({
  completed: z.boolean().optional(),
});
