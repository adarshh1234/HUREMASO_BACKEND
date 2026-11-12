import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createBenefitAdvanceSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  benefitType: z.string().min(1, 'Benefit type is required'),
  category: z.enum(['employee-benefits', 'performance-benefits', 'other-benefits', 'benefit-advance']),
  amount: z.number().min(0, 'Amount must be non-negative'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBenefitAdvanceStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  notes: z.string().optional(),
});

export const queryBenefitAdvanceSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
