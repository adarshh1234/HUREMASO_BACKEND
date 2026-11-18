import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const disbursementMethodEnum = z.enum([
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Stripe',
  'PayPal',
]);

export const disbursementStatusEnum = z.enum([
  'Draft',
  'Pending',
  'Approved',
  'Processing',
  'Paid',
  'Failed',
  'Cancelled',
]);

export const createSalaryDisbursementSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  period: z.string().min(1, 'Period is required'),
  grossAmount: z.number().positive('Gross amount must be positive'),
  deductions: z.number().min(0, 'Deductions cannot be negative').optional().default(0),
  netAmount: z.number().min(0).optional(),
  method: disbursementMethodEnum.optional().default('Bank Transfer'),
  status: disbursementStatusEnum.optional().default('Pending'),
  remarks: z.string().optional(),
  transactionRef: z.string().optional(),
});

export const updateSalaryDisbursementStatusSchema = z.object({
  status: disbursementStatusEnum,
  remarks: z.string().optional(),
  transactionRef: z.string().optional(),
  approvedBy: z.string().optional(),
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
