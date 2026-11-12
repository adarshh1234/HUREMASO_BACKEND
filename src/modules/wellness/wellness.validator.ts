import { z } from 'zod';

// ========================= FINANCIAL INCENTIVES =========================

const vestingTrancheSchema = z.object({
  trancheNumber: z.number().min(1),
  period: z.string().min(1).trim(),
  vestingDate: z.string().min(1, 'Vesting date is required'),
  shares: z.number().min(0),
  status: z.enum(['Granted', 'Vested', 'Exercised', 'Forfeited', 'Expired']).optional().default('Granted'),
  exercisedAt: z.string().optional(),
});

const incentiveRecordSchema = z.object({
  title: z.string().min(1, 'Incentive title is required').trim(),
  target: z.string().min(1, 'Target is required').trim(),
  reward: z.string().min(1, 'Reward description is required').trim(),
  rewardAmount: z.number().min(0).optional().default(0),
  status: z.enum(['Active', 'Achieved', 'In_Progress', 'Missed', 'Cancelled']).optional().default('Active'),
  achievedAt: z.string().optional(),
  quarter: z.string().min(1, 'Quarter is required'),
});

export const createFinancialIncentiveSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  grantedEsopShares: z.number().min(0).optional().default(0),
  grantPrice: z.number().min(0).optional().default(0),
  currentFMV: z.number().min(0).optional().default(0),
  vestingSchedule: z.array(vestingTrancheSchema).optional().default([]),
  bonusYear: z.number().min(2000).max(2100).optional(),
  bonusMultiplier: z.number().min(0).optional().default(1.0),
  estimatedBonusAmount: z.number().min(0).optional().default(0),
  bonusStatus: z.enum(['Pending', 'Approved', 'Paid', 'Rejected']).optional().default('Pending'),
  bonusTargetAchievement: z.number().min(0).optional().default(0),
  incentives: z.array(incentiveRecordSchema).optional().default([]),
  financialLiteracySessionsAttended: z.number().min(0).optional().default(0),
});

export const updateFinancialIncentiveSchema = createFinancialIncentiveSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const exerciseEsopSchema = z.object({
  trancheNumber: z.number().min(1),
  notes: z.string().optional(),
});

export const updateBonusStatusSchema = z.object({
  bonusStatus: z.enum(['Pending', 'Approved', 'Paid', 'Rejected']),
  notes: z.string().optional(),
});

// ========================= EMPLOYEE DEVELOPMENT =========================

const learningProgramSchema = z.object({
  title: z.string().min(1, 'Program title is required').trim(),
  provider: z.string().min(1, 'Provider is required').trim(),
  totalModules: z.number().min(1).optional().default(1),
  completedModules: z.number().min(0).optional().default(0),
  progressPercent: z.number().min(0).max(100).optional().default(0),
  status: z.enum(['Not_Started', 'In_Progress', 'Completed', 'On_Hold', 'Cancelled']).optional().default('Not_Started'),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
});

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').trim(),
  issuingOrganization: z.string().min(1, 'Issuing organization is required').trim(),
  issuedDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  certificationId: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Pending_Renewal', 'In_Progress']).optional().default('Active'),
  badgeUrl: z.string().optional(),
});

export const createEmployeeDevelopmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  completedTrainingHours: z.number().min(0).optional().default(0),
  annualTargetHours: z.number().min(1).optional().default(60),
  learningAllowanceBalance: z.number().min(0).optional().default(0),
  learningAllowanceCurrency: z.string().optional().default('USD'),
  learningPrograms: z.array(learningProgramSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
  mentorName: z.string().optional(),
  mentorId: z.string().optional(),
  careerGoal: z.string().optional(),
  nextReviewDate: z.string().optional(),
});

export const updateEmployeeDevelopmentSchema = createEmployeeDevelopmentSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const addLearningProgramSchema = learningProgramSchema;
export const addCertificationSchema = certificationSchema;

export const updateLearningProgressSchema = z.object({
  completedModules: z.number().min(0),
  progressPercent: z.number().min(0).max(100),
  status: z.enum(['Not_Started', 'In_Progress', 'Completed', 'On_Hold', 'Cancelled']).optional(),
});

// ========================= HEALTH & WELLNESS =========================

const healthClaimSchema = z.object({
  description: z.string().min(1, 'Claim description is required').trim(),
  type: z.enum(['Medical', 'Dental', 'Vision', 'Mental_Health', 'Pharmacy', 'Fitness', 'Other']).optional().default('Medical'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  currency: z.string().optional().default('USD'),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

const insuranceDependentSchema = z.object({
  name: z.string().min(1, 'Dependent name is required').trim(),
  relationship: z.string().min(1, 'Relationship is required').trim(),
  status: z.enum(['Covered', 'Not_Covered', 'Pending']).optional().default('Covered'),
});

export const createHealthWellnessSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  groupInsurancePolicyNumber: z.string().min(1, 'Policy number is required'),
  groupInsuranceSumInsured: z.number().min(0).optional().default(0),
  groupInsuranceCurrency: z.string().optional().default('USD'),
  groupInsuranceExpiry: z.string().min(1, 'Insurance expiry date is required'),
  insuranceDependents: z.array(insuranceDependentSchema).optional().default([]),
  eapSessionsAvailable: z.number().min(0).optional().default(0),
  eapSessionsUsed: z.number().min(0).optional().default(0),
  mindfulnessAppAccess: z.boolean().optional().default(false),
  fitnessChallengeName: z.string().optional(),
  fitnessChallengeStepsGoal: z.number().min(0).optional(),
  fitnessChallengeCurrentSteps: z.number().min(0).optional(),
  fitnessChallengeRank: z.number().min(1).optional(),
  fitnessChallengeStatus: z.enum(['Active', 'Completed', 'Not_Enrolled']).optional().default('Not_Enrolled'),
});

export const updateHealthWellnessSchema = createHealthWellnessSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const submitHealthClaimSchema = healthClaimSchema;

export const updateHealthClaimStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Reimbursed', 'Under_Review']),
  notes: z.string().optional(),
});

// ========================= WORKPLACE LIFE BALANCE =========================

const fringeClaimSchema = z.object({
  title: z.string().min(1, 'Claim title is required').trim(),
  category: z.enum(['Connectivity', 'Commute', 'Equipment', 'Childcare', 'Housing', 'Meal', 'Other']).optional().default('Other'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  currency: z.string().optional().default('USD'),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const createWorkplaceLifeBalanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  workScheduleType: z.string().optional().default('Hybrid 3/2'),
  officeDaysPerWeek: z.number().min(0).max(7).optional().default(3),
  coreHoursStart: z.string().optional().default('09:00'),
  coreHoursEnd: z.string().optional().default('17:00'),
  flexiBandStart: z.string().optional().default('08:00'),
  flexiBandEnd: z.string().optional().default('10:00'),
  remoteWorkLocation: z.string().optional(),
  sabbaticalLeaveWeeks: z.number().min(0).optional().default(0),
  wellnessDaysTotal: z.number().min(0).optional().default(5),
  wellnessDaysUsed: z.number().min(0).optional().default(0),
  parentalLeaveWeeks: z.number().min(0).optional().default(0),
  childCareStipendMonthly: z.number().min(0).optional().default(0),
  childCareStipendCurrency: z.string().optional().default('USD'),
  childCareStipendActive: z.boolean().optional().default(false),
  dormitoryAccessActive: z.boolean().optional().default(false),
  fringeMonthlyInternetAllowance: z.number().min(0).optional().default(0),
  fringeMonthlyCommuteAllowance: z.number().min(0).optional().default(0),
  fringeTotalYTDReimbursed: z.number().min(0).optional().default(0),
  fringeCurrency: z.string().optional().default('USD'),
});

export const updateWorkplaceLifeBalanceSchema = createWorkplaceLifeBalanceSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const submitFringeClaimSchema = fringeClaimSchema;

export const updateFringeClaimStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Paid', 'Rejected']),
  notes: z.string().optional(),
});
