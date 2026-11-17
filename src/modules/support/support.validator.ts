import { z } from 'zod';

// ================= TICKET VALIDATORS =================

export const createTicketSchema = z.object({
  requesterName: z.string().min(1, 'Requester name is required'),
  requesterEmail: z.string().email('Valid email is required'),
  department: z.string().optional().default('General'),
  subject: z.string().min(2, 'Subject is required'),
  category: z
    .enum(['IT Support', 'Hardware', 'Software', 'Access / Permissions', 'HR Support', 'Facilities', 'Other'])
    .default('IT Support'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  description: z.string().min(5, 'Detailed description is required'),
  assignedAgent: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTicketSchema = createTicketSchema.partial().extend({
  status: z.enum(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened']).optional(),
  resolutionDetails: z.string().optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened']),
  resolutionDetails: z.string().optional(),
  notes: z.string().optional(),
});

export const assignTicketSchema = z.object({
  assignedAgent: z.string().min(1, 'Agent name is required'),
  assignedAgentEmail: z.string().email().optional(),
  assignedBy: z.string().optional(),
});

export const addTicketCommentSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  authorEmail: z.string().email().optional(),
  role: z.string().optional().default('Requester'),
  text: z.string().min(1, 'Comment text is required'),
  isStaff: z.boolean().optional().default(false),
});

export const addInternalNoteSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  authorEmail: z.string().email().optional(),
  text: z.string().min(1, 'Note text is required'),
});

export const voteHelpArticleSchema = z.object({
  isHelpful: z.boolean().optional().default(true),
});

export const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().optional().default('IT Operations'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().default(''),
  status: z.enum(['Online', 'Offline', 'Busy', 'On Leave']).optional().default('Online'),
  specialties: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
});

// ================= MAINTENANCE VALIDATORS =================

export const createMaintenanceSchema = z.object({
  system: z.string().min(2, 'System name is required'),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  category: z
    .enum(['Infrastructure', 'Database', 'Network', 'Software', 'Hardware', 'Facilities'])
    .default('Infrastructure'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  status: z
    .enum(['Reported', 'Scheduled', 'In Progress', 'Operational', 'Resolved', 'Cancelled'])
    .optional()
    .default('Reported'),
  requestedBy: z.string().min(1, 'Requester name is required'),
  requestedByEmail: z.string().email().optional(),
  department: z.string().optional().default('IT Operations'),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  targetUptime: z.string().optional().default('99.9%'),
  resolutionNotes: z.string().optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

// ================= HELP / KB VALIDATORS =================

export const createHelpArticleSchema = z.object({
  title: z.string().min(2, 'Article title is required'),
  category: z.string().min(1, 'Category is required'),
  question: z.string().min(5, 'Question is required'),
  answer: z.string().min(5, 'Answer content is required'),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(true),
  author: z.string().optional().default('Support Team'),
});

export const updateHelpArticleSchema = createHelpArticleSchema.partial();

// ================= CONTACT INQUIRY VALIDATORS =================

export const createContactRequestSchema = z.object({
  requesterName: z.string().min(1, 'Name is required'),
  requesterEmail: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  department: z.string().optional().default('General'),
  targetAgent: z.string().optional().default('General IT Desk'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(5, 'Message is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
});

export const updateContactRequestStatusSchema = z.object({
  status: z.enum(['New', 'In Progress', 'Replied', 'Closed']),
  responseMessage: z.string().optional(),
  respondedBy: z.string().optional(),
});

// ================= MISCELLANEOUS REQUEST VALIDATORS =================

export const createMiscRequestSchema = z.object({
  requestId: z.string().optional(),
  employeeId: z.string().optional(),
  employee: z.string().optional(),
  name: z.string().optional(),
  department: z.string().optional(),
  dept: z.string().optional(),
  title: z.string().optional(),
  requestType: z.string().optional(),
  type: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  date: z.string().optional(),
  requiredDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional().default('Medium'),
  status: z.enum(['Pending', 'In Review', 'Approved', 'Rejected', 'Processed']).optional().default('Pending'),
  createdBy: z.string().optional().default('Employee'),
  email: z.string().email().optional().or(z.literal('')),
  comments: z.string().optional(),
}).refine((data) => !!(data.employee || data.name), {
  message: 'Employee name is required',
  path: ['employee'],
});

export const updateMiscRequestSchema = z.object({
  requestId: z.string().optional(),
  employeeId: z.string().optional(),
  employee: z.string().optional(),
  name: z.string().optional(),
  department: z.string().optional(),
  dept: z.string().optional(),
  title: z.string().optional(),
  requestType: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  requiredDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  status: z.enum(['Pending', 'In Review', 'Approved', 'Rejected', 'Processed']).optional(),
  createdBy: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  comments: z.string().optional(),
  reviewerId: z.string().optional(),
  reviewerName: z.string().optional(),
  approvalRemarks: z.string().optional(),
  rejectionReason: z.string().optional(),
  processedAt: z.string().optional(),
  processedBy: z.string().optional(),
});

export const updateMiscRequestStatusSchema = z.object({
  status: z.enum(['Pending', 'In Review', 'Approved', 'Rejected', 'Processed']),
  comments: z.string().optional(),
  remarks: z.string().optional(),
  reviewerName: z.string().optional(),
  reviewerId: z.string().optional(),
  approvalRemarks: z.string().optional(),
  rejectionReason: z.string().optional(),
  processedBy: z.string().optional(),
});

export const startReviewSchema = z.object({
  reviewerName: z.string().optional(),
  reviewerId: z.string().optional(),
  remarks: z.string().optional(),
});

export const approveMiscRequestSchema = z.object({
  reviewerName: z.string().optional(),
  reviewerId: z.string().optional(),
  approvalRemarks: z.string().optional(),
  comments: z.string().optional(),
});

export const rejectMiscRequestSchema = z.object({
  reviewerName: z.string().optional(),
  reviewerId: z.string().optional(),
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
  comments: z.string().optional(),
});

export const processMiscRequestSchema = z.object({
  processedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export const miscRequestQueryFilterSchema = z.object({
  status: z.string().optional(),
  requestType: z.string().optional(),
  type: z.string().optional(),
  department: z.string().optional(),
  dept: z.string().optional(),
  priority: z.string().optional(),
  employee: z.string().optional(),
  name: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 50)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ================= QUERY PARAMS VALIDATOR =================

export const supportQueryFilterSchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type CreateHelpArticleInput = z.infer<typeof createHelpArticleSchema>;
export type CreateContactRequestInput = z.infer<typeof createContactRequestSchema>;
export type CreateMiscRequestInput = z.infer<typeof createMiscRequestSchema>;
export type UpdateMiscRequestInput = z.infer<typeof updateMiscRequestSchema>;
export type SupportQueryFilterInput = z.infer<typeof supportQueryFilterSchema>;
