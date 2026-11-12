import { z } from 'zod';

export const legalAiQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
});
