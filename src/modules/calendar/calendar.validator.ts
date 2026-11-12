import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').trim(),
  date: z.string().min(1, 'Event date is required').trim(),
  time: z.string().optional().default('10:00 AM - 11:00 AM'),
  type: z.string().optional().default('Meeting'),
  location: z.string().optional().default('Main Auditorium & Zoom'),
  attendees: z.number().optional().default(1),
  description: z.string().optional(),
  employeeId: objectIdSchema.optional(),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled']).optional().default('Scheduled'),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();
