import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createSalaryDisbursementSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  period: z.string().min(1, 'Period is required'),
  grossAmount: z.number().positive('Gross amount must be positive'),
  deductions: z.number().min(0, 'Deductions cannot be negative').optional().default(0),
  method: z.enum(['Bank Transfer', 'Cash', 'Cheque']).optional().default('Bank Transfer'),
});

export const updateSalaryDisbursementStatusSchema = z.object({
  status: z.enum(['Paid', 'Pending', 'Failed', 'Processing']),
});

export const querySalaryDisbursementSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  period: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
