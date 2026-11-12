import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createOvertimeSchema = z.object({
  employeeId: objectIdSchema.optional(),
  employeeName: z.string().optional(),
  department: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  hours: z.number().min(0.5).max(24).optional().default(1),
  multiplier: z.string().optional().default('1.5x (Weekday OT)'),
  hourlyRate: z.number().min(0).optional().default(30),
  reason: z.string().optional().default('Scheduled project overtime'),
  status: z.enum(['Pending', 'Pending Approval', 'Approved', 'Rejected']).optional().default('Approved'),
});

export const updateOvertimeStatusSchema = z.object({
  status: z.enum(['Pending', 'Pending Approval', 'Approved', 'Rejected']),
  approverName: z.string().optional(),
  comments: z.string().optional(),
});
