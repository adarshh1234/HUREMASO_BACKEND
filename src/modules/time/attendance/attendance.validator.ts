import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const punchInSchema = z.object({
  employeeId: objectIdSchema.optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  note: z.string().optional().default(''),
});

export const punchOutSchema = z.object({
  employeeId: objectIdSchema.optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  note: z.string().optional().default(''),
});

export const attendanceConfigSchema = z.object({
  recordWorkingTime: z.boolean().optional(),
  canEditRecords: z.boolean().optional(),
  supervisorCanEdit: z.boolean().optional(),
});
