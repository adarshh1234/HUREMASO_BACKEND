import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const educationItemSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().optional().default(''),
  year: z.union([z.string(), z.number()]).optional(),
  field: z.string().optional().default(''),
});

export const workExperienceItemSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

export const createResumeSchema = z.object({
  candidateId: objectIdSchema.optional().nullable(),
  candidateName: z.string().min(1, 'Candidate name is required').trim(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  title: z.string().optional().default(''),
  skills: z.array(z.string()).optional().default([]),
  experienceYears: z.number().min(0).optional().default(0),
  education: z.union([z.string(), z.array(educationItemSchema)]).optional(),
  workExperience: z.union([z.string(), z.array(workExperienceItemSchema)]).optional(),
  rawText: z.string().optional().default(''),
  fileUrl: z.string().optional().default(''),
  fileName: z.string().optional().default(''),
  fileType: z.string().optional().default(''),
  matchedVacancyId: objectIdSchema.optional().nullable(),
  matchScore: z.number().min(0).max(100).optional().default(0),
  matchedSkills: z.array(z.string()).optional().default([]),
  missingSkills: z.array(z.string()).optional().default([]),
  source: z.string().optional().default('Direct Upload'),
  isVerifiedLetsGetIn: z.boolean().optional().default(false),
  verifiedDate: z.string().optional().default(''),
  assessmentScore: z.number().optional().default(0),
  location: z.string().optional().default(''),
  expectedSalary: z.string().optional().default(''),
  noticePeriod: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
  previousCompany: z.string().optional().default(''),
  summary: z.string().optional().default(''),
  status: z.enum(['Uploaded', 'Parsed', 'Shortlisted', 'Archived', 'New', 'Screened', 'Interview', 'Offered']).optional().default('Parsed'),
});

export const updateResumeSchema = createResumeSchema.partial();

export const parseCvSchema = z.object({
  rawText: z.string().optional().default(''),
  fileUrl: z.string().optional().default(''),
  fileName: z.string().optional().default(''),
  vacancyId: objectIdSchema.optional().nullable(),
  targetSkills: z.array(z.string()).optional(),
});
