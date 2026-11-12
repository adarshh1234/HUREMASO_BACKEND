import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const interviewerSchema = z.object({
  employeeId: objectIdSchema.optional().nullable(),
  name: z.string().min(1, 'Interviewer name is required'),
  email: z.string().email().optional().or(z.literal('')),
  role: z.string().optional().default(''),
});

export const createInterviewSchema = z.object({
  candidateId: objectIdSchema,
  vacancyId: objectIdSchema.optional().nullable(),
  applicationId: objectIdSchema.optional().nullable(),
  roundName: z.string().min(1, 'Round name is required').trim(),
  interviewDate: z.union([z.string(), z.date()]),
  startTime: z.string().optional().default(''),
  endTime: z.string().optional().default(''),
  interviewers: z.array(interviewerSchema).min(1, 'At least one interviewer is required'),
  interviewType: z.enum(['Technical', 'HR', 'Managerial', 'Cultural', 'Final', 'Other']).optional().default('Technical'),
  mode: z.enum(['Online', 'In-Person', 'Telephonic']).optional().default('Online'),
  meetingLink: z.string().optional().default(''),
  location: z.string().optional().default(''),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show']).optional().default('Scheduled'),
  result: z.enum(['Pending', 'Passed', 'Failed', 'On Hold']).optional().default('Pending'),
  notes: z.string().optional().default(''),
});

export const updateInterviewSchema = createInterviewSchema.partial();

export const createFeedbackSchema = z.object({
  interviewId: objectIdSchema,
  candidateId: objectIdSchema,
  interviewerName: z.string().min(1, 'Interviewer name is required').trim(),
  interviewerEmployeeId: objectIdSchema.optional().nullable(),
  technicalRating: z.number().min(1).max(5).optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  culturalFitRating: z.number().min(1).max(5).optional(),
  overallRating: z.number().min(1).max(5),
  strengths: z.string().optional().default(''),
  areasOfImprovement: z.string().optional().default(''),
  recommendation: z.enum(['Strong Hire', 'Hire', 'Hold', 'Reject']),
  comments: z.string().min(1, 'Comments are required'),
});

export const updateFeedbackSchema = createFeedbackSchema.partial();
