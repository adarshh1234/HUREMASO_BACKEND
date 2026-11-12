import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Note title is required').trim(),
  category: z.string().optional().default('HR Policy'),
  content: z.string().min(1, 'Note content is required').trim(),
  date: z.string().optional(),
  pinned: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  aiSummary: z.string().optional(),
  employeeId: objectIdSchema.optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const togglePinSchema = z.object({
  pinned: z.boolean().optional(),
});
