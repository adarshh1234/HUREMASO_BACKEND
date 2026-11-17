import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const checklistItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  text: z.string().trim().min(1, 'Item text is required'),
  completed: z.boolean().default(false),
  order: z.number().optional().default(0),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Note title is required'),
  category: z.string().optional().default('HR Policy'),
  content: z.string().trim().min(1, 'Note content is required'),
  description: z.string().optional(),
  date: z.string().optional(),
  pinned: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  aiSummary: z.string().optional(),
  checklistItems: z.array(checklistItemSchema).optional().default([]),

  // Interview Notes metadata
  candidateName: z.string().optional(),
  candidateId: objectIdSchema.optional(),
  interviewId: objectIdSchema.optional(),
  vacancyName: z.string().optional(),
  interviewerName: z.string().optional(),
  interviewRound: z.string().optional(),
  interviewDate: z.string().optional(),
  technicalRating: z.number().min(1).max(10).optional(),
  communicationRating: z.number().min(1).max(10).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),

  // Policy / Memo metadata
  applicableScope: z.string().optional(),
  policyStatus: z.enum(['Draft', 'Active', 'Archived']).optional().default('Active'),
  memoSubject: z.string().optional(),
  visibility: z.enum(['public', 'internal', 'restricted']).optional().default('internal'),
  authorName: z.string().optional(),
  authorId: objectIdSchema.optional(),

  employeeId: objectIdSchema.optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const togglePinSchema = z.object({
  pinned: z.boolean().optional(),
});

export const updateChecklistSchema = z.object({
  checklistItems: z.array(checklistItemSchema),
});

export const toggleChecklistItemSchema = z.object({
  completed: z.boolean().optional(),
});
