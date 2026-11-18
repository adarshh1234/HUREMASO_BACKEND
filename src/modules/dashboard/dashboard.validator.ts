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

export const createBuzzPostSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  authorId: z.string().optional(),
  avatar: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['post', 'announcement', 'event', 'newsletter']).optional().default('post'),
});

export const updateBuzzPostSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['post', 'announcement', 'event', 'newsletter']).optional(),
});

export const clockInSchema = z.object({
  employeeId: z.string().optional(),
  note: z.string().optional(),
  time: z.string().optional(),
  date: z.string().optional(),
});

export const clockOutSchema = z.object({
  employeeId: z.string().optional(),
  note: z.string().optional(),
  time: z.string().optional(),
  date: z.string().optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type RecentActivityQueryInput = z.infer<typeof recentActivityQuerySchema>;
export type BuzzQueryInput = z.infer<typeof buzzQuerySchema>;
export type CreateBuzzPostInput = z.infer<typeof createBuzzPostSchema>;
export type UpdateBuzzPostInput = z.infer<typeof updateBuzzPostSchema>;
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
