import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const payRecordSchema = z.object({
  id: z.string().optional(),
  amount: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'number') return val;
    const clean = val.replace(/[$,]/g, '').trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }).refine((num) => num > 0, {
    message: 'Payment amount must be greater than zero',
  }),
  paymentMethod: z.string().optional().default('Bank Transfer'),
  notes: z.string().optional(),
});

export const createPayrollRecordSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  date: z.string().optional(),
  period: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  category: z.enum(['statement', 'upcoming', 'slips', 'pay-on-request', 'advance-payments']).optional(),
  status: z.enum(['Paid', 'Pending']).optional(),
  notes: z.string().optional(),
});

export const updatePayrollRecordSchema = createPayrollRecordSchema.partial();

export const queryPayrollRecordSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
