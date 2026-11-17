import { Schema, model } from 'mongoose';
import {
  IFinancialIncentiveDocument,
  IEmployeeDevelopmentDocument,
  IHealthWellnessDocument,
  IWorkplaceLifeBalanceDocument,
} from './wellness.types';

// ========================= FINANCIAL INCENTIVES =========================

const vestingTrancheSchema = new Schema({
  trancheNumber: { type: Number, required: true },
  period: { type: String, required: true },
  vestingDate: { type: Date, required: true },
  shares: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Granted', 'Vested', 'Exercised', 'Forfeited', 'Expired'],
    default: 'Granted',
  },
  exercisedAt: { type: Date },
}, { _id: false });

const esopExerciseRecordSchema = new Schema({
  id: { type: String },
  trancheNumber: { type: Number, required: true },
  shares: { type: Number, required: true },
  grantPrice: { type: Number, required: true },
  exercisePrice: { type: Number, required: true },
  exercisedAt: { type: Date, default: Date.now },
  totalCost: { type: Number, default: 0 },
  estimatedValue: { type: Number, default: 0 },
}, { _id: true });

const bonusPlanSchema = new Schema({
  id: { type: String },
  planName: { type: String, required: true, trim: true },
  bonusYear: { type: Number, required: true },
  targetMetrics: { type: String, required: true, trim: true },
  targetAchievement: { type: Number, default: 0 },
  bonusMultiplier: { type: Number, default: 1.0 },
  estimatedBonusAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Paid'],
    default: 'Draft',
  },
  notes: { type: String },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
}, { _id: true });

const incentiveRecordSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true, trim: true },
  target: { type: String, required: true, trim: true },
  reward: { type: String, required: true, trim: true },
  rewardAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Active', 'Achieved', 'In_Progress', 'Missed', 'Cancelled'],
    default: 'Active',
  },
  quarter: { type: String, required: true },
  achievedAt: { type: Date },
  approvedAt: { type: Date },
}, { _id: true });

const financialLiteracyProgramSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  speaker: { type: String, required: true, trim: true },
  category: { type: String, default: 'Wealth Management' },
  topics: { type: String },
  materialsUrl: { type: String },
  registered: { type: Boolean, default: false },
  attended: { type: Boolean, default: false },
  score: { type: Number },
  completionDate: { type: Date },
}, { _id: true });

const financialIncentiveSchema = new Schema<IFinancialIncentiveDocument>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  grantedEsopShares: { type: Number, default: 0 },
  grantPrice: { type: Number, default: 0 },
  currentFMV: { type: Number, default: 0 },
  grantDate: { type: Date },
  vestingSchedule: [vestingTrancheSchema],
  exerciseHistory: [esopExerciseRecordSchema],
  bonusYear: { type: Number, default: new Date().getFullYear() },
  bonusMultiplier: { type: Number, default: 1.0 },
  estimatedBonusAmount: { type: Number, default: 0 },
  bonusStatus: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending Approval',
  },
  bonusTargetAchievement: { type: Number, default: 0 },
  bonusPlans: [bonusPlanSchema],
  incentives: [incentiveRecordSchema],
  financialLiteracySessionsAttended: { type: Number, default: 0 },
  financialLiteracyPrograms: [financialLiteracyProgramSchema],
}, { timestamps: true });

financialIncentiveSchema.index({ employeeId: 1 }, { unique: true });

export const FinancialIncentiveModel = model<IFinancialIncentiveDocument>(
  'FinancialIncentive',
  financialIncentiveSchema
);

// ========================= EMPLOYEE DEVELOPMENT =========================

const learningProgramSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true, trim: true },
  provider: { type: String, required: true, trim: true },
  totalModules: { type: Number, default: 1 },
  completedModules: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['Not_Started', 'In_Progress', 'Completed', 'On_Hold', 'Cancelled'],
    default: 'Not_Started',
  },
  trainingHours: { type: Number, default: 0 },
  allowanceCost: { type: Number, default: 0 },
  startDate: { type: Date },
  completionDate: { type: Date },
  externalUrl: { type: String },
}, { _id: true });

const certificationSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true, trim: true },
  issuingOrganization: { type: String, required: true, trim: true },
  issuedDate: { type: Date, required: true },
  expiryDate: { type: Date },
  certificationId: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Expiring Soon', 'Expired', 'Pending Verification'],
    default: 'Active',
  },
  certificateUrl: { type: String },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  renewedAt: { type: Date },
  badgeUrl: { type: String },
}, { _id: true });

const mentorshipSessionSchema = new Schema({
  id: { type: String },
  sessionDate: { type: String, required: true },
  time: { type: String },
  topic: { type: String, required: true, trim: true },
  notes: { type: String },
  feedback: { type: String },
  completed: { type: Boolean, default: false },
}, { _id: true });

const mentorshipProgramSchema = new Schema({
  mentorId: { type: String },
  mentorName: { type: String, trim: true },
  menteeId: { type: String },
  menteeName: { type: String, trim: true },
  status: {
    type: String,
    enum: ['Requested', 'Active', 'Completed', 'Terminated', 'Rejected'],
    default: 'Requested',
  },
  objectives: { type: String, default: '' },
  durationMonths: { type: Number, default: 6 },
  startDate: { type: Date },
  sessions: [mentorshipSessionSchema],
  mentorFeedback: { type: String },
  menteeFeedback: { type: String },
}, { _id: false });

const careerMilestoneSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: String },
}, { _id: true });

const careerGoalSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true, trim: true },
  targetDate: { type: String },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Under Review', 'Completed', 'On Hold'],
    default: 'In Progress',
  },
  milestones: [careerMilestoneSchema],
  managerFeedback: { type: String },
  reviewDate: { type: String },
}, { _id: true });

const employeeDevelopmentSchema = new Schema<IEmployeeDevelopmentDocument>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  completedTrainingHours: { type: Number, default: 0 },
  annualTargetHours: { type: Number, default: 60 },
  learningAllowanceBalance: { type: Number, default: 0 },
  learningAllowanceCurrency: { type: String, default: 'USD' },
  learningPrograms: [learningProgramSchema],
  certifications: [certificationSchema],
  mentorName: { type: String },
  mentorId: { type: String },
  mentorship: mentorshipProgramSchema,
  careerGoal: { type: String },
  careerGoals: [careerGoalSchema],
  nextReviewDate: { type: Date },
}, { timestamps: true });

employeeDevelopmentSchema.index({ employeeId: 1 }, { unique: true });

export const EmployeeDevelopmentModel = model<IEmployeeDevelopmentDocument>(
  'EmployeeDevelopment',
  employeeDevelopmentSchema
);

// ========================= HEALTH & WELLNESS =========================

const insuranceDependentSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true, trim: true },
  relationship: { type: String, required: true, trim: true },
  dateOfBirth: { type: String },
  status: {
    type: String,
    enum: ['Covered', 'Not_Covered', 'Pending'],
    default: 'Covered',
  },
  coveredDate: { type: String },
}, { _id: true });

const healthClaimSchema = new Schema({
  id: { type: String },
  claimId: { type: String, required: true },
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ['Medical', 'Dental', 'Vision', 'Mental_Health', 'Pharmacy', 'Fitness', 'Other'],
    default: 'Medical',
  },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Submitted',
  },
  receiptUrl: { type: String },
  rejectionReason: { type: String },
  processedAt: { type: Date },
  notes: { type: String },
}, { _id: true });

const counsellingAppointmentSchema = new Schema({
  id: { type: String },
  counsellorName: { type: String, required: true, trim: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  topic: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  notesConfidential: { type: String },
}, { _id: true });

const fitnessActivitySchema = new Schema({
  id: { type: String },
  activityName: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  durationMinutes: { type: Number, default: 30 },
  stepsCount: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
}, { _id: true });

const healthWellnessSchema = new Schema<IHealthWellnessDocument>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  groupInsurancePolicyNumber: { type: String, required: true },
  groupInsuranceSumInsured: { type: Number, default: 0 },
  groupInsuranceCurrency: { type: String, default: 'USD' },
  groupInsuranceEffective: { type: Date },
  groupInsuranceExpiry: { type: Date, required: true },
  groupInsuranceStatus: {
    type: String,
    enum: ['Active', 'Expiring Soon', 'Expired'],
    default: 'Active',
  },
  insuranceDependents: [insuranceDependentSchema],
  annualReimbursementAllowance: { type: Number, default: 5000 },
  healthClaims: [healthClaimSchema],
  eapSessionsAvailable: { type: Number, default: 12 },
  eapSessionsUsed: { type: Number, default: 0 },
  mindfulnessAppAccess: { type: Boolean, default: false },
  counsellingAppointments: [counsellingAppointmentSchema],
  fitnessChallengeName: { type: String },
  fitnessChallengeStepsGoal: { type: Number },
  fitnessChallengeCurrentSteps: { type: Number },
  fitnessChallengeRank: { type: Number },
  fitnessChallengeStatus: {
    type: String,
    enum: ['Active', 'Completed', 'Not_Enrolled'],
    default: 'Not_Enrolled',
  },
  fitnessActivities: [fitnessActivitySchema],
  fitnessRewardPoints: { type: Number, default: 0 },
}, { timestamps: true });

healthWellnessSchema.index({ employeeId: 1 }, { unique: true });

export const HealthWellnessModel = model<IHealthWellnessDocument>(
  'HealthWellness',
  healthWellnessSchema
);

// ========================= WORKPLACE LIFE BALANCE =========================

const fringeClaimSchema = new Schema({
  id: { type: String },
  claimId: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Connectivity', 'Commute', 'Equipment', 'Childcare', 'Housing', 'Meal', 'Other'],
    default: 'Other',
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Paid', 'Rejected'],
    default: 'Pending',
  },
  description: { type: String },
  receiptUrl: { type: String },
  rejectionReason: { type: String },
}, { _id: true });

const scheduleChangeRequestSchema = new Schema({
  id: { type: String },
  requestedSchedule: {
    type: String,
    enum: ['Office', 'Remote', 'Hybrid', 'Flexible Hours'],
    required: true,
  },
  officeDays: { type: Number, default: 3 },
  remoteDays: { type: Number, default: 2 },
  coreHours: { type: String, default: '09:00 - 17:00' },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  requestDate: { type: String, required: true },
  reviewedAt: { type: String },
}, { _id: true });

const paidLeaveRequestSchema = new Schema({
  id: { type: String },
  leaveType: {
    type: String,
    enum: ['Sabbatical', 'Wellness Day', 'Parental Leave', 'Vacation'],
    required: true,
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  daysCount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
  },
  rejectionReason: { type: String },
}, { _id: true });

const accommodationRequestSchema = new Schema({
  id: { type: String },
  facilityName: { type: String, required: true },
  roomType: {
    type: String,
    enum: ['Single Studio', 'Shared Dormitory', 'Executive Suite'],
    default: 'Single Studio',
  },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Allocated'],
    default: 'Pending',
  },
  allocatedRoomNumber: { type: String },
}, { _id: true });

const childCareRequestSchema = new Schema({
  id: { type: String },
  childName: { type: String, required: true },
  childAge: { type: Number, required: true },
  facilityName: { type: String, required: true },
  requestedMonthlyStipend: { type: Number, default: 400 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Enrolled'],
    default: 'Pending',
  },
}, { _id: true });

const familyEventSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  registered: { type: Boolean, default: false },
  attendeesCount: { type: Number, default: 0 },
}, { _id: true });

const familySupportRequestSchema = new Schema({
  id: { type: String },
  requestType: {
    type: String,
    enum: ['Elderly Care', 'Emergency Assistance', 'Education Support', 'Counseling'],
    required: true,
  },
  details: { type: String, required: true },
  status: {
    type: String,
    enum: ['Submitted', 'In Review', 'Approved', 'Closed'],
    default: 'Submitted',
  },
  createdAt: { type: String },
}, { _id: true });

const workplaceLifeBalanceSchema = new Schema<IWorkplaceLifeBalanceDocument>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  workScheduleType: { type: String, default: 'Hybrid 3/2' },
  officeDaysPerWeek: { type: Number, default: 3 },
  coreHoursStart: { type: String, default: '09:00' },
  coreHoursEnd: { type: String, default: '17:00' },
  flexiBandStart: { type: String, default: '08:00' },
  flexiBandEnd: { type: String, default: '10:00' },
  remoteWorkLocation: { type: String },
  scheduleChangeRequests: [scheduleChangeRequestSchema],
  sabbaticalLeaveWeeks: { type: Number, default: 0 },
  wellnessDaysTotal: { type: Number, default: 5 },
  wellnessDaysUsed: { type: Number, default: 0 },
  parentalLeaveWeeks: { type: Number, default: 0 },
  paidLeaveRequests: [paidLeaveRequestSchema],
  childCareStipendMonthly: { type: Number, default: 400 },
  childCareStipendCurrency: { type: String, default: 'USD' },
  childCareStipendActive: { type: Boolean, default: false },
  childCareRequests: [childCareRequestSchema],
  dormitoryAccessActive: { type: Boolean, default: false },
  accommodationRequests: [accommodationRequestSchema],
  familyEventsRegistered: [{ type: String }],
  familyEvents: [familyEventSchema],
  familySupportRequests: [familySupportRequestSchema],
  fringeMonthlyInternetAllowance: { type: Number, default: 150 },
  fringeMonthlyCommuteAllowance: { type: Number, default: 200 },
  fringeTotalYTDReimbursed: { type: Number, default: 0 },
  fringeCurrency: { type: String, default: 'USD' },
  fringeClaims: [fringeClaimSchema],
}, { timestamps: true });

workplaceLifeBalanceSchema.index({ employeeId: 1 }, { unique: true });

export const WorkplaceLifeBalanceModel = model<IWorkplaceLifeBalanceDocument>(
  'WorkplaceLifeBalance',
  workplaceLifeBalanceSchema
);
