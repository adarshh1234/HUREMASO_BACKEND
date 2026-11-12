import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createOnboardingCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  startDate: z.string().optional(),
  status: z.enum([
    'Pending',
    'In Progress',
    'Offer Accepted',
    'Verification Pending',
    'Contract Signed',
    'Provisioning',
    'Ready to Join',
    'Completed',
  ]).optional(),
  baseSalary: z.string().optional(),
  equity: z.string().optional(),
  buddyName: z.string().optional(),
  managerName: z.string().optional(),
});

export const updateOnboardingCandidateSchema = createOnboardingCandidateSchema.partial();

export const updateVerificationSchema = z.object({
  checkType: z.enum(['legal', 'pcc', 'immigration', 'biometrics', 'credentials', 'digital', 'postHire']),
  status: z.enum(['Verified', 'Pending', 'Flagged', 'In Progress']),
  notes: z.string().optional(),
  verifiedBy: z.string().optional(),
});

export const updateOfferSchema = z.object({
  roleTitle: z.string().optional(),
  baseSalary: z.string().optional(),
  equity: z.string().optional(),
  bonus: z.string().optional(),
  signOnBonus: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Offer Accepted', 'Declined']).optional(),
});

export const updateDocumentSchema = z.object({
  docType: z.enum(['contract', 'nda', 'custom']),
  status: z.enum(['Pending', 'Drafted', 'Signed']),
  signedDate: z.string().optional(),
  docUrl: z.string().optional(),
});

export const updateProvisionsSchema = z.object({
  laptop: z.object({ assigned: z.boolean(), model: z.string().optional(), serialNo: z.string().optional(), status: z.string().optional() }).optional(),
  workstation: z.object({ assigned: z.boolean(), deskNo: z.string().optional(), location: z.string().optional() }).optional(),
  simCard: z.object({ assigned: z.boolean(), number: z.string().optional() }).optional(),
  creditCard: z.object({ assigned: z.boolean(), cardType: z.string().optional() }).optional(),
  car: z.object({ assigned: z.boolean(), vehicleNo: z.string().optional() }).optional(),
  homeOffice: z.object({ assigned: z.boolean(), allowance: z.number().optional() }).optional(),
});

export const updateBuddyManagerSchema = z.object({
  buddyName: z.string().optional(),
  buddyRole: z.string().optional(),
  managerName: z.string().optional(),
  managerRole: z.string().optional(),
  department: z.string().optional(),
  meetingScheduled: z.boolean().optional(),
});

export const updateTrainingSchema = z.object({
  modules: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    progress: z.number().min(0).max(100),
    status: z.enum(['Not Started', 'In Progress', 'Completed']),
  })),
});

export const updateVisaSchema = z.object({
  visaType: z.string().optional(),
  passportNo: z.string().optional(),
  expiryDate: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['Applied', 'In Review', 'Approved', 'Issued', 'Not Required']).optional(),
});

export const updateInsuranceSchema = z.object({
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  coverageAmount: z.string().optional(),
  dependentsCount: z.number().min(0).optional(),
  status: z.enum(['Active', 'Pending Enrolment', 'Underwriting']).optional(),
});

export const queryOnboardingSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
