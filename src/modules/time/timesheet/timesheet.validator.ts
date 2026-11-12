import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const timesheetRowSchema = z.object({
  projectId: objectIdSchema.optional().nullable(),
  projectName: z.string().min(1, 'Project name is required').trim(),
  activity: z.string().min(1, 'Activity is required').trim(),
  monHours: z.number().min(0).max(24).optional().default(0),
  tueHours: z.number().min(0).max(24).optional().default(0),
  wedHours: z.number().min(0).max(24).optional().default(0),
  thuHours: z.number().min(0).max(24).optional().default(0),
  friHours: z.number().min(0).max(24).optional().default(0),
  satHours: z.number().min(0).max(24).optional().default(0),
  sunHours: z.number().min(0).max(24).optional().default(0),
  totalHours: z.number().min(0).optional().default(0),
});

export const createTimesheetSchema = z.object({
  employeeId: objectIdSchema.optional(),
  periodStartDate: z.string().optional(),
  periodEndDate: z.string().optional(),
  period: z.string().optional(),
  rows: z.array(timesheetRowSchema).optional().default([]),
  status: z.enum(['Draft', 'Submitted', 'Approved', 'Rejected']).optional().default('Draft'),
  comment: z.string().optional().default(''),
});

export const updateTimesheetSchema = z.object({
  rows: z.array(timesheetRowSchema).optional(),
  status: z.enum(['Draft', 'Submitted', 'Approved', 'Rejected']).optional(),
  comment: z.string().optional(),
});
