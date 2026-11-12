import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createFinanceRequestSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  requestType: z.string().min(1, 'Request type is required'),
  department: z.string().min(1, 'Department is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const updateFinanceRequestStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  notes: z.string().optional(),
});

export const queryFinanceRequestSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
