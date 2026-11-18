import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createBenefitAdvanceSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  benefitType: z.string().min(1, 'Benefit type is required'),
  category: z.enum(['employee-benefits', 'performance-benefits', 'other-benefits', 'benefit-advance']),
  tab: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  description: z.string().optional(),
  supportingDoc: z.string().optional(),
  vestingSchedule: z.string().optional(),
  grantedUnits: z.number().optional(),
  currentSalary: z.number().optional(),
  proposedSalary: z.number().optional(),
  incrementPercent: z.number().optional(),
  statutoryContributionEmployee: z.number().optional(),
  statutoryContributionEmployer: z.number().optional(),
  leaveBalanceEncashing: z.number().optional(),
  policyNumber: z.string().optional(),
  insuranceProvider: z.string().optional(),
  coverageDetails: z.string().optional(),
  dependentsCount: z.number().optional(),
  notes: z.string().optional(),
});

export const updateBenefitAdvanceStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Processing', 'Completed']),
  remarks: z.string().optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
});

export const queryBenefitAdvanceSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  tab: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createBenefitSchemeSchema = z.object({
  schemeId: z.string().optional(),
  category: z.enum(['employee-benefits', 'performance-benefits', 'other-benefits', 'benefit-advance']),
  tab: z.string().min(1),
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  annualLimit: z.number().min(0).optional(),
  maxLimit: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  eligibilityCriteria: z.string().optional(),
  eligibility: z.string().optional(),
  frequency: z.string().optional(),
  applicationDeadline: z.string().optional(),
  formula: z.string().optional(),
  statutoryType: z.enum(['EPF', 'Gratuity', 'ESI', 'Insurance', 'None']).optional(),
  isEnabled: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  title: data.title || data.name || 'Untitled Benefit',
  description: data.description || 'Corporate benefit scheme',
  annualLimit: data.annualLimit ?? data.maxLimit ?? 5000,
  maxAmount: data.maxAmount ?? data.maxLimit ?? 2500,
  eligibilityCriteria: data.eligibilityCriteria || data.eligibility || 'All employees',
}));

export const updateBenefitSchemeSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  annualLimit: z.number().min(0).optional(),
  maxLimit: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  eligibilityCriteria: z.string().optional(),
  eligibility: z.string().optional(),
  frequency: z.string().optional(),
  applicationDeadline: z.string().optional(),
  formula: z.string().optional(),
  statutoryType: z.enum(['EPF', 'Gratuity', 'ESI', 'Insurance', 'None']).optional(),
  isEnabled: z.boolean().optional(),
});
