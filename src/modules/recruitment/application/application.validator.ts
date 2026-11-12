import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const applicationStatusEnum = z.enum([
  'Applied',
  'Screening',
  'Shortlisted',
  'Interview Scheduled',
  'Interviewed',
  'Offered',
  'Hired',
  'Rejected',
  'Withdrawn',
]);

export const createApplicationSchema = z.object({
  candidateId: objectIdSchema,
  vacancyId: objectIdSchema,
  jobPostingId: objectIdSchema.optional().nullable(),
  appliedDate: z.union([z.string(), z.date()]).optional(),
  status: applicationStatusEnum.optional().default('Applied'),
  currentStage: z.string().optional().default('Initial Screening'),
  resumeUrl: z.string().optional().default(''),
  matchScore: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().default(''),
});

export const updateApplicationSchema = z.object({
  candidateId: objectIdSchema.optional(),
  vacancyId: objectIdSchema.optional(),
  jobPostingId: objectIdSchema.optional().nullable(),
  status: applicationStatusEnum.optional(),
  currentStage: z.string().optional(),
  resumeUrl: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  offerDetails: z
    .object({
      offeredSalary: z.number().optional(),
      offeredDate: z.union([z.string(), z.date()]).optional(),
      joiningDate: z.union([z.string(), z.date()]).optional(),
      status: z.enum(['Pending', 'Accepted', 'Declined']).optional(),
    })
    .optional(),
});

export const updateStatusSchema = z.object({
  status: applicationStatusEnum,
  stage: z.string().optional(),
  comment: z.string().optional(),
  changedBy: z.string().optional(),
});
