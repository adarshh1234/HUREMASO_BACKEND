import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createTimePayrollSchema = z.object({
  recordId: z.string().optional(),
  employeeId: objectIdSchema.optional(),
  name: z.string().min(1, 'Employee name is required'),
  dept: z.string().optional().default('Operations'),
  month: z.string().optional(),
  year: z.number().optional(),
  daysPresent: z.number().min(0, 'Days present cannot be negative'),
  paidLeave: z.number().min(0).optional().default(0),
  shiftAllowance: z.string().optional(),
  shiftAllowanceAmount: z.number().optional(),
  overtimeHours: z.number().optional(),
  overtimeAmount: z.number().optional(),
  lopDeductions: z.number().optional(),
  netAdjustment: z.string().optional(),
  netAdjustmentAmount: z.number().optional(),
  status: z.enum(['Processed', 'Pending Sync', 'Draft']).optional().default('Processed'),
  notes: z.string().optional(),
});

export const updateTimePayrollSchema = createTimePayrollSchema.partial();
