import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  subUnit: z.string().optional(),
  employeeId: z.string().optional(),
});

export const recentActivityQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10))) : 10)),
  type: z.enum(['all', 'leave', 'recruitment', 'attendance', 'payroll', 'employee', 'task']).optional().default('all'),
});

export const buzzQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10))) : 10)),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type RecentActivityQueryInput = z.infer<typeof recentActivityQuerySchema>;
export type BuzzQueryInput = z.infer<typeof buzzQuerySchema>;
