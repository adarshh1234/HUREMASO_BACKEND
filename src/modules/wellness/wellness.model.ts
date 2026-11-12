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

const incentiveRecordSchema = new Schema({
  title: { type: String, required: true, trim: true },
  target: { type: String, required: true, trim: true },
  reward: { type: String, required: true, trim: true },
  rewardAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Active', 'Achieved', 'In_Progress', 'Missed', 'Cancelled'],
    default: 'Active',
  },
  achievedAt: { type: Date },
  quarter: { type: String, required: true },
}, { _id: true });

const financialIncentiveSchema = new Schema<IFinancialIncentiveDocument>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  grantedEsopShares: { type: Number, default: 0 },
  grantPrice: { type: Number, default: 0 },
  currentFMV: { type: Number, default: 0 },
  vestingSchedule: [vestingTrancheSchema],
  bonusYear: { type: Number, default: new Date().getFullYear() },
  bonusMultiplier: { type: Number, default: 1.0 },
  estimatedBonusAmount: { type: Number, default: 0 },
  bonusStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Paid', 'Rejected'],
    default: 'Pending',
  },
  bonusTargetAchievement: { type: Number, default: 0 },
  incentives: [incentiveRecordSchema],
  financialLiteracySessionsAttended: { type: Number, default: 0 },
}, { timestamps: true });

financialIncentiveSchema.index({ employeeId: 1 }, { unique: true });

export const FinancialIncentiveModel = model<IFinancialIncentiveDocument>(
  'FinancialIncentive',
  financialIncentiveSchema
);

// ========================= EMPLOYEE DEVELOPMENT =========================

const learningProgramSchema = new Schema({
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
  startDate: { type: Date },
  completionDate: { type: Date },
  externalUrl: { type: String },
}, { _id: true });

const certificationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  issuingOrganization: { type: String, required: true, trim: true },
  issuedDate: { type: Date, required: true },
  expiryDate: { type: Date },
  certificationId: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Pending_Renewal', 'In_Progress'],
    default: 'Active',
  },
  badgeUrl: { type: String },
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
  careerGoal: { type: String },
  nextReviewDate: { type: Date },
}, { timestamps: true });

employeeDevelopmentSchema.index({ employeeId: 1 }, { unique: true });

export const EmployeeDevelopmentModel = model<IEmployeeDevelopmentDocument>(
  'EmployeeDevelopment',
  employeeDevelopmentSchema
);

// ========================= HEALTH & WELLNESS =========================

const insuranceDependentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  relationship: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Covered', 'Not_Covered', 'Pending'],
    default: 'Covered',
  },
}, { _id: true });

const healthClaimSchema = new Schema({
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
    enum: ['Pending', 'Approved', 'Rejected', 'Reimbursed', 'Under_Review'],
    default: 'Pending',
  },
  receiptUrl: { type: String },
  processedAt: { type: Date },
  notes: { type: String },
}, { _id: true });

const healthWellnessSchema = new Schema<IHealthWellnessDocument>({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  groupInsurancePolicyNumber: { type: String, required: true },
  groupInsuranceSumInsured: { type: Number, default: 0 },
  groupInsuranceCurrency: { type: String, default: 'USD' },
  groupInsuranceExpiry: { type: Date, required: true },
  insuranceDependents: [insuranceDependentSchema],
  healthClaims: [healthClaimSchema],
  eapSessionsAvailable: { type: Number, default: 0 },
  eapSessionsUsed: { type: Number, default: 0 },
  mindfulnessAppAccess: { type: Boolean, default: false },
  fitnessChallengeName: { type: String },
  fitnessChallengeStepsGoal: { type: Number },
  fitnessChallengeCurrentSteps: { type: Number },
  fitnessChallengeRank: { type: Number },
  fitnessChallengeStatus: {
    type: String,
    enum: ['Active', 'Completed', 'Not_Enrolled'],
    default: 'Not_Enrolled',
  },
}, { timestamps: true });

healthWellnessSchema.index({ employeeId: 1 }, { unique: true });

export const HealthWellnessModel = model<IHealthWellnessDocument>(
  'HealthWellness',
  healthWellnessSchema
);

// ========================= WORKPLACE LIFE BALANCE =========================

const fringeClaimSchema = new Schema({
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
  sabbaticalLeaveWeeks: { type: Number, default: 0 },
  wellnessDaysTotal: { type: Number, default: 5 },
  wellnessDaysUsed: { type: Number, default: 0 },
  parentalLeaveWeeks: { type: Number, default: 0 },
  childCareStipendMonthly: { type: Number, default: 0 },
  childCareStipendCurrency: { type: String, default: 'USD' },
  childCareStipendActive: { type: Boolean, default: false },
  dormitoryAccessActive: { type: Boolean, default: false },
  familyEventsRegistered: [{ type: String }],
  fringeMonthlyInternetAllowance: { type: Number, default: 0 },
  fringeMonthlyCommuteAllowance: { type: Number, default: 0 },
  fringeTotalYTDReimbursed: { type: Number, default: 0 },
  fringeCurrency: { type: String, default: 'USD' },
  fringeClaims: [fringeClaimSchema],
}, { timestamps: true });

workplaceLifeBalanceSchema.index({ employeeId: 1 }, { unique: true });

export const WorkplaceLifeBalanceModel = model<IWorkplaceLifeBalanceDocument>(
  'WorkplaceLifeBalance',
  workplaceLifeBalanceSchema
);
