import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createReplacementSchema = z.object({
  originalEmployeeId: objectIdSchema.optional(),
  originalEmployeeName: z.string().optional(),
  substituteEmployeeId: objectIdSchema.optional(),
  substituteEmployeeName: z.string().optional(),
  employeeName: z.string().optional(),
  department: z.string().optional(),
  shiftDate: z.string().optional(),
  workDate: z.string().optional(),
  claimDate: z.string().optional(),
  shiftTime: z.string().optional(),
  shift: z.string().optional().default('Morning Shift (08:00 - 16:00)'),
  reason: z.string().optional().default('Shift replacement coverage'),
  status: z.enum(['Pending', 'Pending Manager Sign-off', 'Approved', 'Rejected']).optional().default('Approved'),
  hoursWorked: z.number().optional(),
  daysEarned: z.number().optional(),
  expiryDate: z.string().optional(),
});

export const updateReplacementStatusSchema = z.object({
  status: z.enum(['Pending', 'Pending Manager Sign-off', 'Approved', 'Rejected']),
  approverName: z.string().optional(),
  comments: z.string().optional(),
});
