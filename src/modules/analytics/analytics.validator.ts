import { z } from 'zod';

export const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
  timeframe: z.enum(['7d', '30d', '90d', '180d', '1y', 'all']).optional().default('30d'),
});

export const analyticsQuerySchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '180d', '1y', 'all']).optional().default('30d'),
  department: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const employeeOfPeriodQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year', 'all']).optional().default('all'),
  department: z.string().optional(),
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : new Date().getFullYear())),
});

export const approveWinnerSchema = z.object({
  periodType: z.enum(['week', 'month', 'year']),
  periodLabel: z.string().min(1, 'Period label is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  remarks: z.string().optional(),
  approvedBy: z.string().optional(),
});

export const exportQuerySchema = reportQuerySchema.extend({
  format: z.enum(['csv', 'pdf', 'excel', 'xlsx']).optional().default('csv'),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type EmployeeOfPeriodQueryInput = z.infer<typeof employeeOfPeriodQuerySchema>;
export type ApproveWinnerInput = z.infer<typeof approveWinnerSchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
