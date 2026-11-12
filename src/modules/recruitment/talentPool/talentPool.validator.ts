import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const createTalentPoolSchema = z.object({
  name: z.string().min(1, 'Talent pool name is required').trim(),
  description: z.string().optional().default(''),
  department: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['Active', 'Archived']).optional().default('Active'),
});

export const updateTalentPoolSchema = createTalentPoolSchema.partial();

export const addCandidateToPoolSchema = z.object({
  candidateId: objectIdSchema,
  notes: z.string().optional().default(''),
  rating: z.number().min(1).max(5).optional(),
});
