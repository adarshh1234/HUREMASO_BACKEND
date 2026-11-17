import { z } from 'zod';

// ========================= FINANCIAL INCENTIVES =========================

const vestingTrancheSchema = z.object({
  trancheNumber: z.number().min(1),
  period: z.string().min(1).trim(),
  vestingDate: z.union([z.string(), z.date()]),
  shares: z.number().min(0),
  status: z.enum(['Granted', 'Vested', 'Exercised', 'Forfeited', 'Expired']).optional().default('Granted'),
  exercisedAt: z.union([z.string(), z.date()]).optional(),
});

export const esopGrantSchema = z.object({
  totalGrantedShares: z.number().min(1).optional(),
  shares: z.number().min(1).optional(),
  grantPrice: z.number().min(0, 'Grant price must be non-negative'),
  currentFMV: z.number().min(0, 'FMV must be non-negative').optional().default(0),
  grantDate: z.union([z.string(), z.date()]).optional(),
  tranchesCount: z.number().min(1).max(10).optional().default(4),
});

const bonusPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required').trim(),
  bonusYear: z.number().min(2000).max(2100).optional().default(() => new Date().getFullYear()),
  targetMetrics: z.string().min(1, 'Target metrics is required').trim(),
  targetAchievement: z.number().min(0).optional().default(100),
  bonusMultiplier: z.number().min(0).optional().default(1.0),
  estimatedBonusAmount: z.number().min(0).optional().default(0),
  status: z.enum(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Paid']).optional().default('Draft'),
  notes: z.string().optional(),
});

const incentiveRecordSchema = z.object({
  title: z.string().min(1, 'Incentive title is required').trim(),
  target: z.string().min(1, 'Target is required').trim(),
  reward: z.string().min(1, 'Reward description is required').trim(),
  rewardAmount: z.number().min(0).optional().default(0),
  status: z.enum(['Active', 'Achieved', 'In_Progress', 'Missed', 'Cancelled']).optional().default('Active'),
  quarter: z.string().min(1, 'Quarter is required'),
});

const financialLiteracyProgramSchema = z.object({
  title: z.string().min(1, 'Workshop title is required').trim(),
  date: z.string().min(1, 'Date is required'),
  speaker: z.string().min(1, 'Speaker name is required').trim(),
  category: z.string().optional().default('Wealth Management'),
  topics: z.string().optional(),
  materialsUrl: z.string().optional(),
});

export const createFinancialIncentiveSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  grantedEsopShares: z.number().min(0).optional().default(0),
  grantPrice: z.number().min(0).optional().default(0),
  currentFMV: z.number().min(0).optional().default(0),
  grantDate: z.union([z.string(), z.date()]).optional(),
  vestingSchedule: z.array(vestingTrancheSchema).optional().default([]),
  bonusYear: z.number().min(2000).max(2100).optional().default(() => new Date().getFullYear()),
  bonusMultiplier: z.number().min(0).optional().default(1.0),
  estimatedBonusAmount: z.number().min(0).optional().default(0),
  bonusStatus: z.enum(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Paid']).optional().default('Pending Approval'),
  bonusTargetAchievement: z.number().min(0).optional().default(0),
  bonusPlans: z.array(bonusPlanSchema).optional().default([]),
  incentives: z.array(incentiveRecordSchema).optional().default([]),
  financialLiteracySessionsAttended: z.number().min(0).optional().default(0),
  financialLiteracyPrograms: z.array(financialLiteracyProgramSchema).optional().default([]),
});

export const updateFinancialIncentiveSchema = createFinancialIncentiveSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const exerciseEsopSchema = z.object({
  trancheNumber: z.number().min(1),
  notes: z.string().optional(),
});

export const updateBonusStatusSchema = z.object({
  bonusStatus: z.enum(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Paid']),
  notes: z.string().optional(),
});

export const addBonusPlanSchema = bonusPlanSchema;
export const addIncentiveRecordSchema = incentiveRecordSchema;
export const addLiteracyProgramSchema = financialLiteracyProgramSchema;

// ========================= EMPLOYEE DEVELOPMENT =========================

const learningProgramSchema = z.object({
  title: z.string().min(1, 'Program title is required').trim(),
  provider: z.string().min(1, 'Provider is required').trim(),
  totalModules: z.number().min(1).optional().default(1),
  completedModules: z.number().min(0).optional().default(0),
  progressPercent: z.number().min(0).max(100).optional().default(0),
  status: z.enum(['Not_Started', 'In_Progress', 'Completed', 'On_Hold', 'Cancelled']).optional().default('Not_Started'),
  trainingHours: z.number().min(0).optional().default(0),
  allowanceCost: z.number().min(0).optional().default(0),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  externalUrl: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').trim(),
  issuingOrganization: z.string().min(1, 'Issuing organization is required').trim(),
  issuedDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  certificationId: z.string().optional(),
  status: z.enum(['Active', 'Expiring Soon', 'Expired', 'Pending Verification']).optional().default('Active'),
  certificateUrl: z.string().optional(),
  badgeUrl: z.string().optional(),
});

const mentorshipRequestSchema = z.object({
  mentorId: z.string().optional(),
  mentorName: z.string().min(1, 'Mentor name or track is required').trim(),
  objectives: z.string().min(1, 'Mentorship objectives are required').trim(),
  durationMonths: z.number().min(1).max(24).optional().default(6),
});

const mentorshipSessionSchema = z.object({
  sessionDate: z.string().min(1, 'Session date is required'),
  time: z.string().optional(),
  topic: z.string().min(1, 'Topic is required').trim(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  completed: z.boolean().optional().default(false),
});

const careerGoalSchema = z.object({
  title: z.string().min(1, 'Career goal title is required').trim(),
  targetDate: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Under Review', 'Completed', 'On Hold']).optional().default('In Progress'),
  milestones: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Milestone title is required'),
    completed: z.boolean().optional().default(false),
    dueDate: z.string().optional(),
  })).optional().default([]),
  managerFeedback: z.string().optional(),
  reviewDate: z.string().optional(),
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
  careerGoals: z.array(careerGoalSchema).optional().default([]),
  nextReviewDate: z.string().optional(),
});

export const updateEmployeeDevelopmentSchema = createEmployeeDevelopmentSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const addLearningProgramSchema = learningProgramSchema;
export const updateLearningProgramSchema = learningProgramSchema.partial();
export const addCertificationSchema = certificationSchema;
export const updateCertificationSchema = certificationSchema.partial().extend({
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  renewedAt: z.string().optional(),
});
export const requestMentorshipSchema = mentorshipRequestSchema;
export const addMentorshipSessionSchema = mentorshipSessionSchema;
export const addCareerGoalSchema = careerGoalSchema;
export const updateCareerGoalSchema = careerGoalSchema.partial();

// ========================= HEALTH & WELLNESS =========================

const healthClaimSchema = z.object({
  description: z.string().min(1, 'Claim description is required').trim(),
  type: z.enum(['Medical', 'Dental', 'Vision', 'Mental_Health', 'Pharmacy', 'Fitness', 'Other']).optional().default('Medical'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  currency: z.string().optional().default('USD'),
  date: z.union([z.string(), z.date()]).optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid']).optional().default('Submitted'),
});

const insuranceDependentSchema = z.object({
  name: z.string().min(1, 'Dependent name is required').trim(),
  relationship: z.string().min(1, 'Relationship is required').trim(),
  dateOfBirth: z.string().optional(),
  status: z.enum(['Covered', 'Not_Covered', 'Pending']).optional().default('Covered'),
});

export const counsellingBookingSchema = z.object({
  counsellorName: z.string().min(1, 'Counsellor name is required').trim(),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  topic: z.string().min(1, 'Topic is required').trim(),
  notesConfidential: z.string().optional(),
});

export const fitnessActivitySchema = z.object({
  activityName: z.string().min(1, 'Activity name is required').trim(),
  date: z.union([z.string(), z.date()]).optional().default(() => new Date().toISOString().slice(0, 10)),
  durationMinutes: z.number().min(1).optional().default(30),
  stepsCount: z.number().min(0).optional().default(0),
  caloriesBurned: z.number().min(0).optional().default(0),
});

export const createHealthWellnessSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  groupInsurancePolicyNumber: z.string().min(1, 'Policy number is required'),
  groupInsuranceSumInsured: z.number().min(0).optional().default(0),
  groupInsuranceCurrency: z.string().optional().default('USD'),
  groupInsuranceEffective: z.string().optional(),
  groupInsuranceExpiry: z.string().min(1, 'Insurance expiry date is required'),
  groupInsuranceStatus: z.enum(['Active', 'Expiring Soon', 'Expired']).optional().default('Active'),
  insuranceDependents: z.array(insuranceDependentSchema).optional().default([]),
  annualReimbursementAllowance: z.number().min(0).optional().default(5000),
  eapSessionsAvailable: z.number().min(0).optional().default(12),
  eapSessionsUsed: z.number().min(0).optional().default(0),
  mindfulnessAppAccess: z.boolean().optional().default(false),
  fitnessChallengeName: z.string().optional(),
  fitnessChallengeStepsGoal: z.number().min(0).optional(),
  fitnessChallengeCurrentSteps: z.number().min(0).optional(),
  fitnessChallengeRank: z.number().min(1).optional(),
});

export const updateHealthWellnessSchema = createHealthWellnessSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const submitHealthClaimSchema = healthClaimSchema;
export const updateHealthClaimStatusSchema = z.object({
  status: z.enum(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});
export const addInsuranceDependentSchema = insuranceDependentSchema;

// ========================= WORKPLACE LIFE BALANCE =========================

const fringeClaimSchema = z.object({
  title: z.string().min(1, 'Claim title is required').trim(),
  category: z.enum(['Connectivity', 'Commute', 'Equipment', 'Childcare', 'Housing', 'Meal', 'Other']),
  amount: z.number().min(0.01, 'Amount must be positive'),
  currency: z.string().optional().default('USD'),
  date: z.union([z.string(), z.date()]).optional(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const scheduleChangeRequestSchema = z.object({
  requestedSchedule: z.enum(['Office', 'Remote', 'Hybrid', 'Flexible Hours']),
  officeDays: z.number().min(0).max(7).optional().default(3),
  remoteDays: z.number().min(0).max(7).optional().default(2),
  coreHours: z.string().optional().default('09:00 - 17:00'),
  reason: z.string().min(1, 'Reason is required').trim(),
});

export const paidLeaveRequestSchema = z.object({
  leaveType: z.enum(['Sabbatical', 'Wellness Day', 'Parental Leave', 'Vacation']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  daysCount: z.number().min(1).optional().default(1),
  reason: z.string().min(1, 'Reason is required').trim(),
});

export const accommodationRequestSchema = z.object({
  facilityName: z.string().min(1, 'Facility is required').trim(),
  roomType: z.enum(['Single Studio', 'Shared Dormitory', 'Executive Suite']).optional().default('Single Studio'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().optional(),
  reason: z.string().min(1, 'Reason is required').trim(),
});

export const childCareRequestSchema = z.object({
  childName: z.string().min(1, 'Child name is required').trim(),
  childAge: z.number().min(0).max(18, 'Age must be 0-18'),
  facilityName: z.string().min(1, 'Facility is required').trim(),
  requestedMonthlyStipend: z.number().min(0).optional().default(400),
});

export const familyEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').trim(),
  date: z.string().min(1, 'Event date is required'),
  location: z.string().min(1, 'Location is required').trim(),
  description: z.string().optional().default(''),
});

export const familySupportRequestSchema = z.object({
  requestType: z.enum(['Elderly Care', 'Emergency Assistance', 'Education Support', 'Counseling']),
  details: z.string().min(1, 'Details are required').trim(),
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
  childCareStipendMonthly: z.number().min(0).optional().default(400),
  childCareStipendCurrency: z.string().optional().default('USD'),
  childCareStipendActive: z.boolean().optional().default(false),
  dormitoryAccessActive: z.boolean().optional().default(false),
  fringeMonthlyInternetAllowance: z.number().min(0).optional().default(150),
  fringeMonthlyCommuteAllowance: z.number().min(0).optional().default(200),
  fringeCurrency: z.string().optional().default('USD'),
});

export const updateWorkplaceLifeBalanceSchema = createWorkplaceLifeBalanceSchema.partial().extend({
  employeeId: z.string().optional(),
});

export const submitFringeClaimSchema = fringeClaimSchema;
export const updateFringeClaimStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Paid', 'Rejected']),
  rejectionReason: z.string().optional(),
});
