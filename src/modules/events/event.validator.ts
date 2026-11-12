import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  eventType: z.string().default('Training Session'),
  category: z.string().optional(),
  description: z.string().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().default('UTC+4 (Dubai)'),
  venue: z.string().default('Main Conference Room'),
  locationType: z.enum(['in-person', 'online']).default('in-person'),
  onlineUrl: z.string().optional(),
  department: z.string().default('All Department'),
  organizer: z.string().default('Sarah Jo'),
  organizerId: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  attendeeCount: z.number().optional(),
  status: z.enum(['Draft', 'Planing', 'In Progress', 'Up coming', 'Completed', 'Cancelled']).default('Up coming'),
  progress: z.string().optional(),
  tasks: z.array(
    z.object({
      name: z.string(),
      due: z.string(),
      assignee: z.string(),
      status: z.enum(['In Progress', 'Pending', 'Not Started', 'Completed']).default('In Progress'),
      progress: z.number().optional(),
    })
  ).optional(),
  budget: z.object({
    allocated: z.number().default(0),
    spent: z.number().default(0),
    status: z.enum(['Approved', 'Pending Review', 'Over Budget']).default('Approved'),
  }).optional(),
  sendReminder: z.boolean().default(true),
  syncCalendar: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
});

export const updateEventSchema = createEventSchema.partial();

export const createSupportEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().default('Sarah Jo'),
  status: z.enum(['Open', 'Pending', 'Resolved', 'Closed']).default('Open'),
  timeAgo: z.string().optional(),
  replaysCount: z.number().default(0),
});

export const updateSupportEventSchema = createSupportEventSchema.partial().extend({
  reply: z.object({
    author: z.string(),
    text: z.string(),
  }).optional(),
});

export const createNewsletterSchema = z.object({
  title: z.string().min(1, 'Newsletter title is required'),
  category: z.string().default('Company Events'),
  publishDate: z.string().default('Today'),
  author: z.string().default('HR Communications Team'),
  status: z.enum(['Published', 'Draft', 'Scheduled']).default('Published'),
  summary: z.string().min(1, 'Summary is required'),
  content: z.string().optional(),
});

export const updateNewsletterSchema = createNewsletterSchema.partial();

export const createBudgetSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  eventId: z.string().optional(),
  category: z.string().default('Venue & Catering'),
  allocated: z.number().min(0, 'Allocated budget must be non-negative'),
  spent: z.number().default(0),
  status: z.enum(['Approved', 'Pending Review', 'Over Budget']).default('Pending Review'),
  owner: z.string().default('Sarah Joseph'),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const queryEventSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  eventType: z.string().optional(),
  department: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
});

export const mongoIdSchema = z.string().min(1, 'Valid ID is required');
