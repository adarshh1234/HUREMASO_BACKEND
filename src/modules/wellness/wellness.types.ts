import { Document } from 'mongoose';

// ========================= FINANCIAL INCENTIVES =========================

export type EsopStatus = 'Granted' | 'Vested' | 'Exercised' | 'Forfeited' | 'Expired';
export type BonusStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';
export type IncentiveStatus = 'Active' | 'Achieved' | 'In_Progress' | 'Missed' | 'Cancelled';

export interface IEsopVestingTranche {
  trancheNumber: number;
  period: string;
  vestingDate: Date;
  shares: number;
  status: EsopStatus;
  exercisedAt?: Date;
}

export interface IFinancialIncentive {
  employeeId: string;
  employeeName: string;
  department: string;
  // ESOP
  grantedEsopShares: number;
  grantPrice: number;
  currentFMV: number;
  vestingSchedule: IEsopVestingTranche[];
  // Performance Bonus
  bonusYear: number;
  bonusMultiplier: number;
  estimatedBonusAmount: number;
  bonusStatus: BonusStatus;
  bonusTargetAchievement: number; // e.g. 112 for 112%
  // Quarterly Incentives
  incentives: IIncentiveRecord[];
  // Financial Literacy
  financialLiteracySessionsAttended: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIncentiveRecord {
  title: string;
  target: string;
  reward: string;
  rewardAmount: number;
  status: IncentiveStatus;
  achievedAt?: Date;
  quarter: string; // e.g. "Q3-2026"
}

export interface IFinancialIncentiveDocument extends IFinancialIncentive, Document {}

// ========================= EMPLOYEE DEVELOPMENT =========================

export type ProgramStatus = 'Not_Started' | 'In_Progress' | 'Completed' | 'On_Hold' | 'Cancelled';
export type CertificationStatus = 'Active' | 'Expired' | 'Pending_Renewal' | 'In_Progress';

export interface ILearningProgram {
  title: string;
  provider: string;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  status: ProgramStatus;
  startDate?: Date;
  completionDate?: Date;
  externalUrl?: string;
}

export interface ICertification {
  name: string;
  issuingOrganization: string;
  issuedDate: Date;
  expiryDate?: Date;
  certificationId?: string;
  status: CertificationStatus;
  badgeUrl?: string;
}

export interface IEmployeeDevelopment {
  employeeId: string;
  employeeName: string;
  department: string;
  completedTrainingHours: number;
  annualTargetHours: number;
  learningAllowanceBalance: number;
  learningAllowanceCurrency: string;
  learningPrograms: ILearningProgram[];
  certifications: ICertification[];
  mentorName?: string;
  mentorId?: string;
  careerGoal?: string;
  nextReviewDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmployeeDevelopmentDocument extends IEmployeeDevelopment, Document {}

// ========================= HEALTH & WELLNESS =========================

export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed' | 'Under_Review';
export type ClaimType = 'Medical' | 'Dental' | 'Vision' | 'Mental_Health' | 'Pharmacy' | 'Fitness' | 'Other';

export interface IInsuranceDependent {
  name: string;
  relationship: string;
  status: 'Covered' | 'Not_Covered' | 'Pending';
}

export interface IHealthClaim {
  claimId: string;
  date: Date;
  type: ClaimType;
  description: string;
  amount: number;
  currency: string;
  status: ClaimStatus;
  receiptUrl?: string;
  processedAt?: Date;
  notes?: string;
}

export interface IHealthWellness {
  employeeId: string;
  employeeName: string;
  department: string;
  // Insurance
  groupInsurancePolicyNumber: string;
  groupInsuranceSumInsured: number;
  groupInsuranceCurrency: string;
  groupInsuranceExpiry: Date;
  insuranceDependents: IInsuranceDependent[];
  // Health Claims
  healthClaims: IHealthClaim[];
  // Mental Health
  eapSessionsAvailable: number;
  eapSessionsUsed: number;
  mindfulnessAppAccess: boolean;
  // Fitness
  fitnessChallengeName?: string;
  fitnessChallengeStepsGoal?: number;
  fitnessChallengeCurrentSteps?: number;
  fitnessChallengeRank?: number;
  fitnessChallengeStatus?: 'Active' | 'Completed' | 'Not_Enrolled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHealthWellnessDocument extends IHealthWellness, Document {}

// ========================= WORKPLACE LIFE BALANCE =========================

export type FringeClaimStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';
export type FringeCategory = 'Connectivity' | 'Commute' | 'Equipment' | 'Childcare' | 'Housing' | 'Meal' | 'Other';

export interface IFringeClaim {
  claimId: string;
  date: Date;
  title: string;
  category: FringeCategory;
  amount: number;
  currency: string;
  status: FringeClaimStatus;
  description?: string;
  receiptUrl?: string;
}

export interface IWorkplaceLifeBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  // Flexible Work
  workScheduleType: string; // e.g. "Hybrid 3/2"
  officeDaysPerWeek: number;
  coreHoursStart: string;
  coreHoursEnd: string;
  flexiBandStart: string;
  flexiBandEnd: string;
  remoteWorkLocation?: string;
  // Paid Leave Package
  sabbaticalLeaveWeeks: number;
  wellnessDaysTotal: number;
  wellnessDaysUsed: number;
  parentalLeaveWeeks: number;
  // Care Assistance
  childCareStipendMonthly: number;
  childCareStipendCurrency: string;
  childCareStipendActive: boolean;
  dormitoryAccessActive: boolean;
  // Family Events
  familyEventsRegistered: string[];
  // Fringe Reimbursements
  fringeMonthlyInternetAllowance: number;
  fringeMonthlyCommuteAllowance: number;
  fringeTotalYTDReimbursed: number;
  fringeCurrency: string;
  fringeClaims: IFringeClaim[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWorkplaceLifeBalanceDocument extends IWorkplaceLifeBalance, Document {}
