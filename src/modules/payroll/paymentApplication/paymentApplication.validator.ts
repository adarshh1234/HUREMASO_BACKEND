import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createPaymentApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().optional(),
  webhookUrl: z.string().optional(),
  autoDisburse: z.boolean().optional(),
  disbursementDay: z.number().min(1).max(31).optional(),
  notes: z.string().optional(),
});

export const updatePaymentApplicationSchema = createPaymentApplicationSchema.partial().extend({
  status: z.enum(['Active', 'Pending', 'Inactive', 'Error']).optional(),
});

export const queryPaymentApplicationSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
});
