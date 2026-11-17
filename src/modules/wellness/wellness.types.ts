import { Document } from 'mongoose';

// ========================= FINANCIAL INCENTIVES =========================

export type EsopStatus = 'Granted' | 'Vested' | 'Exercised' | 'Forfeited' | 'Expired';
export type BonusStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Paid';
export type IncentiveStatus = 'Active' | 'Achieved' | 'In_Progress' | 'Missed' | 'Cancelled';

export interface IEsopVestingTranche {
  trancheNumber: number;
  period: string;
  vestingDate: Date;
  shares: number;
  status: EsopStatus;
  exercisedAt?: Date;
}

export interface IEsopExerciseRecord {
  id?: string;
  trancheNumber: number;
  shares: number;
  grantPrice: number;
  exercisePrice: number;
  exercisedAt: Date;
  totalCost: number;
  estimatedValue: number;
}

export interface IBonusPlan {
  id?: string;
  planName: string;
  bonusYear: number;
  targetMetrics: string;
  targetAchievement: number; // percentage, e.g. 110%
  bonusMultiplier: number; // e.g. 1.25x
  estimatedBonusAmount: number;
  status: BonusStatus;
  notes?: string;
  submittedAt?: Date;
  approvedAt?: Date;
}

export interface IIncentiveRecord {
  id?: string;
  title: string;
  target: string;
  reward: string;
  rewardAmount: number;
  status: IncentiveStatus;
  quarter: string; // e.g. "Q3-2026"
  achievedAt?: Date;
  approvedAt?: Date;
}

export interface IFinancialLiteracyProgram {
  id?: string;
  title: string;
  date: string;
  speaker: string;
  category: string;
  topics?: string;
  materialsUrl?: string;
  registered: boolean;
  attended: boolean;
  score?: number;
  completionDate?: Date;
}

export interface IFinancialIncentive {
  employeeId: string;
  employeeName: string;
  department: string;
  // ESOP
  grantedEsopShares: number;
  grantPrice: number;
  currentFMV: number;
  grantDate?: Date;
  vestingSchedule: IEsopVestingTranche[];
  exerciseHistory?: IEsopExerciseRecord[];
  // Performance Bonus
  bonusYear: number;
  bonusMultiplier: number;
  estimatedBonusAmount: number;
  bonusStatus: BonusStatus;
  bonusTargetAchievement: number;
  bonusPlans?: IBonusPlan[];
  // Quarterly Incentives
  incentives: IIncentiveRecord[];
  // Financial Literacy
  financialLiteracySessionsAttended: number;
  financialLiteracyPrograms?: IFinancialLiteracyProgram[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFinancialIncentiveDocument extends IFinancialIncentive, Document {}

// ========================= EMPLOYEE DEVELOPMENT =========================

export type ProgramStatus = 'Not_Started' | 'In_Progress' | 'Completed' | 'On_Hold' | 'Cancelled';
export type CertificationStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Pending Verification';
export type CareerGoalStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'On Hold';
export type MentorshipStatus = 'Requested' | 'Active' | 'Completed' | 'Terminated' | 'Rejected';

export interface ILearningProgram {
  _id?: string;
  id?: string;
  title: string;
  provider: string;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  status: ProgramStatus;
  trainingHours?: number;
  allowanceCost?: number;
  startDate?: Date;
  completionDate?: Date;
  externalUrl?: string;
}

export interface ICertification {
  _id?: string;
  id?: string;
  name: string;
  issuingOrganization: string;
  issuedDate: Date;
  expiryDate?: Date;
  certificationId?: string;
  status: CertificationStatus;
  certificateUrl?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  renewedAt?: Date;
  badgeUrl?: string;
}

export interface IMentorshipSession {
  id?: string;
  sessionDate: string;
  time?: string;
  topic: string;
  notes?: string;
  feedback?: string;
  completed: boolean;
}

export interface IMentorshipProgram {
  mentorId?: string;
  mentorName: string;
  menteeId?: string;
  menteeName?: string;
  status: MentorshipStatus;
  objectives: string;
  durationMonths: number;
  startDate?: Date;
  sessions: IMentorshipSession[];
  mentorFeedback?: string;
  menteeFeedback?: string;
}

export interface ICareerMilestone {
  id?: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface ICareerGoal {
  id?: string;
  title: string;
  targetDate?: string;
  status: CareerGoalStatus;
  milestones: ICareerMilestone[];
  managerFeedback?: string;
  reviewDate?: string;
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
  mentorship?: IMentorshipProgram;
  careerGoal?: string;
  careerGoals?: ICareerGoal[];
  nextReviewDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmployeeDevelopmentDocument extends IEmployeeDevelopment, Document {}

// ========================= HEALTH & WELLNESS =========================

export type ClaimStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
export type ClaimType = 'Medical' | 'Dental' | 'Vision' | 'Mental_Health' | 'Pharmacy' | 'Fitness' | 'Other';

export interface IInsuranceDependent {
  _id?: string;
  id?: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  status: 'Covered' | 'Not_Covered' | 'Pending';
  coveredDate?: string;
}

export interface IHealthClaim {
  _id?: string;
  claimId: string;
  date: Date;
  type: ClaimType;
  description: string;
  amount: number;
  currency: string;
  status: ClaimStatus;
  receiptUrl?: string;
  rejectionReason?: string;
  processedAt?: Date;
  notes?: string;
}

export interface ICounsellingAppointment {
  id?: string;
  counsellorName: string;
  appointmentDate: string;
  appointmentTime: string;
  topic: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notesConfidential?: string;
}

export interface IFitnessActivity {
  id?: string;
  activityName: string;
  date: string;
  durationMinutes: number;
  stepsCount: number;
  caloriesBurned?: number;
}

export interface IHealthWellness {
  employeeId: string;
  employeeName: string;
  department: string;
  // Insurance
  groupInsurancePolicyNumber: string;
  groupInsuranceSumInsured: number;
  groupInsuranceCurrency: string;
  groupInsuranceEffective?: Date;
  groupInsuranceExpiry: Date;
  groupInsuranceStatus?: 'Active' | 'Expiring Soon' | 'Expired';
  insuranceDependents: IInsuranceDependent[];
  // Health Claims
  annualReimbursementAllowance?: number;
  healthClaims: IHealthClaim[];
  // Mental Health
  eapSessionsAvailable: number;
  eapSessionsUsed: number;
  mindfulnessAppAccess: boolean;
  counsellingAppointments?: ICounsellingAppointment[];
  // Fitness
  fitnessChallengeName?: string;
  fitnessChallengeStepsGoal?: number;
  fitnessChallengeCurrentSteps?: number;
  fitnessChallengeRank?: number;
  fitnessChallengeStatus?: 'Active' | 'Completed' | 'Not_Enrolled';
  fitnessActivities?: IFitnessActivity[];
  fitnessRewardPoints?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHealthWellnessDocument extends IHealthWellness, Document {}

// ========================= WORKPLACE LIFE BALANCE =========================

export type FringeClaimStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';
export type FringeCategory = 'Connectivity' | 'Commute' | 'Equipment' | 'Childcare' | 'Housing' | 'Meal' | 'Other';
export type ScheduleType = 'Office' | 'Remote' | 'Hybrid' | 'Flexible Hours';

export interface IFringeClaim {
  _id?: string;
  claimId: string;
  date: Date;
  title: string;
  category: FringeCategory;
  amount: number;
  currency: string;
  status: FringeClaimStatus;
  description?: string;
  receiptUrl?: string;
  rejectionReason?: string;
}

export interface IScheduleChangeRequest {
  id?: string;
  requestedSchedule: ScheduleType;
  officeDays: number;
  remoteDays: number;
  coreHours: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  reviewedAt?: string;
}

export interface IPaidLeaveRequest {
  id?: string;
  leaveType: 'Sabbatical' | 'Wellness Day' | 'Parental Leave' | 'Vacation';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  rejectionReason?: string;
}

export interface IAccommodationRequest {
  id?: string;
  facilityName: string;
  roomType: 'Single Studio' | 'Shared Dormitory' | 'Executive Suite';
  checkInDate: string;
  checkOutDate?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Allocated';
  allocatedRoomNumber?: string;
}

export interface IChildCareRequest {
  id?: string;
  childName: string;
  childAge: number;
  facilityName: string;
  requestedMonthlyStipend: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Enrolled';
}

export interface IFamilyEvent {
  id?: string;
  title: string;
  date: string;
  location: string;
  description: string;
  registered: boolean;
  attendeesCount?: number;
}

export interface IFamilySupportRequest {
  id?: string;
  requestType: 'Elderly Care' | 'Emergency Assistance' | 'Education Support' | 'Counseling';
  details: string;
  status: 'Submitted' | 'In Review' | 'Approved' | 'Closed';
  createdAt?: string;
}

export interface IWorkplaceLifeBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  // Flexible Work
  workScheduleType: string;
  officeDaysPerWeek: number;
  coreHoursStart: string;
  coreHoursEnd: string;
  flexiBandStart: string;
  flexiBandEnd: string;
  remoteWorkLocation?: string;
  scheduleChangeRequests?: IScheduleChangeRequest[];
  // Paid Leave Package
  sabbaticalLeaveWeeks: number;
  wellnessDaysTotal: number;
  wellnessDaysUsed: number;
  parentalLeaveWeeks: number;
  paidLeaveRequests?: IPaidLeaveRequest[];
  // Care Assistance
  childCareStipendMonthly: number;
  childCareStipendCurrency: string;
  childCareStipendActive: boolean;
  childCareRequests?: IChildCareRequest[];
  dormitoryAccessActive: boolean;
  accommodationRequests?: IAccommodationRequest[];
  // Family Events
  familyEventsRegistered: string[];
  familyEvents?: IFamilyEvent[];
  familySupportRequests?: IFamilySupportRequest[];
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

// ========================= AGGREGATED STATS =========================

export interface IWellnessStatsSummary {
  // Financial
  totalGrantedEsopShares: number;
  totalVestedShares: number;
  totalPortfolioValue: number;
  totalBonusAmount: number;
  activeIncentivesCount: number;
  // Development
  totalCompletedTrainingHours: number;
  totalActiveCertifications: number;
  learningAllowanceBalance: number;
  enrolledProgramsCount: number;
  completionRate: number;
  // Health
  activeInsurancePoliciesCount: number;
  coveredDependentsCount: number;
  pendingHealthClaimsCount: number;
  approvedHealthClaimsCount: number;
  wellnessParticipationScore: number;
  // Workplace
  activeFlexibleSchedulesCount: number;
  pendingLeaveRequestsCount: number;
  accommodationOccupancyCount: number;
  childcareEnrolledCount: number;
  totalFringeReimbursed: number;
}
