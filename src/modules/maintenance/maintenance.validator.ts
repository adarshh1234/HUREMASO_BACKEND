import { z } from 'zod';

// ================= 1. ACTIVE TICKET SCHEMAS =================
export const createMaintenanceTicketSchema = z.object({
  title: z.string().min(2, 'Ticket title is required'),
  description: z.string().min(5, 'Ticket description is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent', 'Critical']).optional().default('High'),
  category: z
    .enum(['System Error', 'Access Issue', 'Hardware', 'Software', 'Network', 'Database', 'Other'])
    .optional()
    .default('System Error'),
  requesterName: z.string().optional().default('Employee'),
  requesterEmail: z.string().email().optional(),
  department: z.string().optional().default('Engineering'),
  assignedAgent: z.string().optional().default('Unassigned'),
  assignedAgentId: z.string().optional(),
  attachments: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export const updateMaintenanceTicketSchema = createMaintenanceTicketSchema.partial().extend({
  status: z.enum(['Open', 'In Progress', 'On Hold', 'Pending', 'Resolved', 'Closed', 'Reopened']).optional(),
  resolutionDetails: z.string().optional(),
});

export const assignTicketSchema = z.object({
  assignedAgent: z.string().min(1, 'Agent name is required'),
  assignedAgentId: z.string().optional(),
  performedBy: z.string().optional().default('System Administrator'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'On Hold', 'Pending', 'Resolved', 'Closed', 'Reopened']),
  resolutionNotes: z.string().optional(),
  performedBy: z.string().optional().default('Support Agent'),
});

export const addCommentSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  authorEmail: z.string().email().optional(),
  role: z.string().optional().default('Requester'),
  text: z.string().min(1, 'Comment text is required'),
  isStaff: z.boolean().optional().default(false),
});

// ================= 2. HUREMASO LOG SCHEMAS =================
export const createHuremasoLogSchema = z.object({
  title: z.string().min(2, 'Log title is required'),
  description: z.string().optional().default(''),
  category: z.string().optional().default('Infrastructure'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledTime: z.string().optional().default('02:00 AM'),
  duration: z.string().optional().default('15 mins'),
  status: z.enum(['Scheduled', 'Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled']).optional().default('Scheduled'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  affectedServices: z.array(z.string()).optional().default(['Huremaso Core API']),
  performedBy: z.string().optional().default('Huremaso Infrastructure Team'),
  responsibleAdmin: z.string().optional().default('Infrastructure Lead'),
  resolutionNotes: z.string().optional(),
  notes: z.string().optional(),
});

export const updateHuremasoLogSchema = createHuremasoLogSchema.partial();

export const updateHuremasoLogStatusSchema = z.object({
  status: z.enum(['Scheduled', 'Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled']),
  notes: z.string().optional(),
  performedBy: z.string().optional().default('Infrastructure Lead'),
});

export const cancelHuremasoLogSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  performedBy: z.string().optional().default('Infrastructure Lead'),
});

// ================= 3. QUERY FILTER SCHEMA =================
export const maintenanceQueryFilterSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  assignedAgent: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'priority', 'status', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
});

export type CreateMaintenanceTicketInput = z.infer<typeof createMaintenanceTicketSchema>;
export type UpdateMaintenanceTicketInput = z.infer<typeof updateMaintenanceTicketSchema>;
export type CreateHuremasoLogInput = z.infer<typeof createHuremasoLogSchema>;
export type UpdateHuremasoLogInput = z.infer<typeof updateHuremasoLogSchema>;
export type MaintenanceQueryFilterInput = z.infer<typeof maintenanceQueryFilterSchema>;
