import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createLeaveSalarySchema = z.object({
  employeeId: objectIdSchema.optional(),
  employeeName: z.string().optional(),
  department: z.string().optional(),
  leaveType: z.string().optional().default('Earned Leave (EL)'),
  availableBalance: z.number().min(0).optional().default(24),
  daysEncashing: z.number().min(1, 'Days to encash must be at least 1'),
  dailyRate: z.number().min(0).optional().default(180),
  reason: z.string().optional().default('Annual Leave Encashment'),
  status: z.enum(['Pending', 'Approved for Payroll', 'Disbursed', 'Rejected']).optional().default('Approved for Payroll'),
});

export const updateLeaveSalaryStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved for Payroll', 'Disbursed', 'Rejected']),
});
