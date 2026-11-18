import { Types, Document } from 'mongoose';

// ─── Payroll Record (One-Tap Payroll) ─────────────────────────────────────────
export type PayrollRecordStatus = 'Paid' | 'Pending' | 'Processing' | 'Failed';

export interface IPayrollRecord {
  _id?: string | Types.ObjectId;
  employeeName: string;
  employeeId?: string;
  department: string;
  designation?: string;
  date: string;
  period?: string;
  basicSalary?: number;
  allowances?: number;
  bonuses?: number;
  incentives?: number;
  grossSalary?: number;
  taxDeductions?: number;
  epfDeduction?: number;
  esiDeduction?: number;
  advanceDeduction?: number;
  otherDeductions?: number;
  totalDeductions?: number;
  netSalary?: number;
  amount: number; // net payout / display amount
  paidAmount?: number;
  status: PayrollRecordStatus;
  category?: 'statement' | 'upcoming' | 'slips' | 'pay-on-request' | 'advance-payments';
  paymentMethod?: string;
  paidAt?: string;
  transactionRef?: string;
  notes?: string;
  slipsGenerated?: boolean;
  slipUrl?: string;
  slipPublishedDate?: string;
  advanceDetails?: {
    totalAdvanceAmount?: number;
    installmentAmount?: number;
    remainingBalance?: number;
    repaymentSchedule?: string;
    installmentsRemaining?: number;
  };
  payOnRequestDetails?: {
    requestedAmount?: number;
    reason?: string;
    description?: string;
    supportingDoc?: string;
    approvedBy?: string;
    approvalRemarks?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type IPayrollRecordDocument = Document & IPayrollRecord;

export interface CreatePayrollRecordDTO {
  employeeName: string;
  employeeId?: string;
  department: string;
  designation?: string;
  date?: string;
  period?: string;
  basicSalary?: number;
  allowances?: number;
  bonuses?: number;
  incentives?: number;
  grossSalary?: number;
  taxDeductions?: number;
  otherDeductions?: number;
  amount: number;
  category?: 'statement' | 'upcoming' | 'slips' | 'pay-on-request' | 'advance-payments';
  status?: PayrollRecordStatus;
  notes?: string;
  advanceDetails?: IPayrollRecord['advanceDetails'];
  payOnRequestDetails?: IPayrollRecord['payOnRequestDetails'];
}

export interface PayRecordDTO {
  id?: string;
  amount: number;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
}

export interface PayrollRecordQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  category?: string;
  department?: string;
  period?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Pay Grade Management ────────────────────────────────────────────────────
export interface IPayGradeAllowance {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface IPayGradeAssignedEmployee {
  employeeId: string;
  employeeName: string;
  department: string;
  currentSalary: number;
  assignedDate?: string;
}

export interface IPayGrade {
  _id?: string | Types.ObjectId;
  gradeCode: string;
  gradeName: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  allowances?: IPayGradeAllowance[];
  description?: string;
  assignedEmployees?: IPayGradeAssignedEmployee[];
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type IPayGradeDocument = Document & IPayGrade;

export interface CreatePayGradeDTO {
  gradeCode: string;
  gradeName: string;
  minSalary: number;
  maxSalary: number;
  currency?: string;
  allowances?: IPayGradeAllowance[];
  description?: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdatePayGradeDTO extends Partial<CreatePayGradeDTO> {
  assignedEmployees?: IPayGradeAssignedEmployee[];
}

// ─── Finance Requests ────────────────────────────────────────────────────────
export type FinanceRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Completed';

export interface IFinanceRequestHistoryItem {
  status: FinanceRequestStatus;
  changedBy: string;
  timestamp: string;
  remarks?: string;
}

export interface IFinanceRequest {
  _id?: string | Types.ObjectId;
  requestId: string;
  employeeName: string;
  employeeId?: string;
  requestType: string;
  department: string;
  amount: number;
  description?: string;
  status: FinanceRequestStatus;
  dateRequested: string;
  supportingDoc?: string;
  approvalRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  history?: IFinanceRequestHistoryItem[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IFinanceRequestDocument = Document & IFinanceRequest;

export interface CreateFinanceRequestDTO {
  employeeName: string;
  employeeId?: string;
  requestType: string;
  department: string;
  amount: number;
  description?: string;
  supportingDoc?: string;
  notes?: string;
}

export interface FinanceRequestQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  department?: string;
  requestType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Benefit Scheme & Advance Management ─────────────────────────────────────
export type BenefitCategory = 'employee-benefits' | 'performance-benefits' | 'other-benefits' | 'benefit-advance';
export type BenefitAdvanceStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Completed';

export interface IBenefitScheme {
  _id?: string | Types.ObjectId;
  schemeId: string;
  category: BenefitCategory;
  tab: string; // e.g. 'Bonus', 'Stock Options', 'EPF', 'Health Check-ups'
  title: string;
  description: string;
  annualLimit?: number;
  maxAmount?: number;
  eligibilityCriteria?: string;
  applicationDeadline?: string;
  formula?: string;
  statutoryType?: 'EPF' | 'Gratuity' | 'ESI' | 'Insurance' | 'None';
  isEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IBenefitSchemeDocument = Document & IBenefitScheme;

export interface CreateBenefitSchemeDTO {
  schemeId?: string;
  category: BenefitCategory;
  tab: string;
  title: string;
  description: string;
  annualLimit?: number;
  maxAmount?: number;
  eligibilityCriteria?: string;
  applicationDeadline?: string;
  formula?: string;
  statutoryType?: 'EPF' | 'Gratuity' | 'ESI' | 'Insurance' | 'None';
  isEnabled?: boolean;
}

export interface UpdateBenefitSchemeDTO extends Partial<CreateBenefitSchemeDTO> {}

export interface IBenefitAdvanceHistoryItem {
  status: BenefitAdvanceStatus;
  changedBy: string;
  timestamp: string;
  remarks?: string;
}

export interface IBenefitAdvance {
  _id?: string | Types.ObjectId;
  advanceId: string;
  employeeName: string;
  employeeId?: string;
  benefitType: string;
  category: BenefitCategory;
  tab?: string;
  amount: number;
  description?: string;
  status: BenefitAdvanceStatus;
  dateRequested: string;
  supportingDoc?: string;
  // Specific benefit metadata:
  vestingSchedule?: string;
  grantedUnits?: number;
  currentSalary?: number;
  proposedSalary?: number;
  incrementPercent?: number;
  statutoryContributionEmployee?: number;
  statutoryContributionEmployer?: number;
  leaveBalanceEncashing?: number;
  policyNumber?: string;
  insuranceProvider?: string;
  coverageDetails?: string;
  dependentsCount?: number;
  approvalRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  history?: IBenefitAdvanceHistoryItem[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IBenefitAdvanceDocument = Document & IBenefitAdvance;

export interface CreateBenefitAdvanceDTO {
  employeeName: string;
  employeeId?: string;
  benefitType: string;
  category: BenefitCategory;
  tab?: string;
  amount: number;
  description?: string;
  supportingDoc?: string;
  vestingSchedule?: string;
  grantedUnits?: number;
  currentSalary?: number;
  proposedSalary?: number;
  incrementPercent?: number;
  statutoryContributionEmployee?: number;
  statutoryContributionEmployer?: number;
  leaveBalanceEncashing?: number;
  policyNumber?: string;
  insuranceProvider?: string;
  coverageDetails?: string;
  dependentsCount?: number;
  notes?: string;
}

export interface BenefitAdvanceQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  category?: string;
  tab?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Salary Disbursement ─────────────────────────────────────────────────────
export type DisbursementStatus = 'Draft' | 'Pending' | 'Approved' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled';
export type DisbursementMethod = 'Bank Transfer' | 'Cash' | 'Cheque' | 'Stripe' | 'PayPal';

export interface ISalaryDisbursement {
  _id?: string | Types.ObjectId;
  disbursementId: string;
  employeeName: string;
  employeeId?: string;
  department: string;
  period: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  method: DisbursementMethod;
  status: DisbursementStatus;
  disbursedAt?: string;
  transactionRef?: string;
  remarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ISalaryDisbursementDocument = Document & ISalaryDisbursement;

export interface CreateSalaryDisbursementDTO {
  employeeName: string;
  employeeId?: string;
  department: string;
  period: string;
  grossAmount: number;
  deductions?: number;
  netAmount?: number;
  method?: DisbursementMethod;
  status?: DisbursementStatus;
  remarks?: string;
  transactionRef?: string;
}

export interface SalaryDisbursementQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  department?: string;
  period?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DisbursementSummary {
  totalGross: number;
  totalNet: number;
  totalPaid: number;
  totalPending: number;
  count: number;
  paidCount: number;
  pendingCount: number;
}

// ─── Payment Application ──────────────────────────────────────────────────────
export type PaymentApplicationStatus = 'Active' | 'Pending' | 'Inactive' | 'Error';

export interface IPaymentApplication {
  _id?: string | Types.ObjectId;
  applicationId: string;
  name: string;
  provider: string;
  environment: 'Sandbox' | 'Production';
  apiKeyMasked?: string;
  webhookUrl?: string;
  webhookSecretMasked?: string;
  status: PaymentApplicationStatus;
  autoDisburse: boolean;
  disbursementDay?: number;
  lastSync?: string;
  lastSyncStatus?: 'Success' | 'Error' | 'Pending';
  lastError?: string;
  testedAt?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IPaymentApplicationDocument = Document & IPaymentApplication;

export interface CreatePaymentApplicationDTO {
  name: string;
  provider: string;
  environment?: 'Sandbox' | 'Production';
  apiKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  autoDisburse?: boolean;
  disbursementDay?: number;
  notes?: string;
}

export interface PaymentApplicationQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  provider?: string;
}

// ─── AI Chat & Analytics ──────────────────────────────────────────────────────
export interface PayrollAIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PayrollAIChatRequest {
  message: string;
  context?: string;
}

export interface PayrollAIChatResponse {
  reply: string;
  timestamp: string;
  suggestedAction?: string;
}

export interface PayrollReportsSummary {
  totalMonthlyOutflow: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  totalDeductions: number;
  pendingRequestsCount: number;
  budgetVariancePercent: number;
  paidCount: number;
  pendingCount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  completionRatePercent: number;
  departmentDistribution: { department: string; gross: number; count: number }[];
  monthlyTrends: { month: string; outflow: number; net: number }[];
  gradeDistribution: { grade: string; employeeCount: number }[];
  advancesSummary: { totalAdvances: number; outstandingBalance: number };
}

export interface WorkforceAnalyticsResponse {
  annualizedTurnoverRate: number;
  retentionIndicatorPercent: number;
  forecastNextQuarterOutflow: number;
  departmentTurnover: { department: string; turnoverRate: number; riskLevel: 'Low' | 'Medium' | 'High' }[];
  retentionDrivers: string[];
}

export interface PerformanceSkillsResponse {
  skillGaps: { skill: string; requiredCount: number; qualifiedCount: number; gapPercent: number }[];
  recommendations: { role: string; developmentFocus: string; targetEmployees: number }[];
}

export interface EmployeeExperienceResponse {
  satisfactionScore: number;
  benefitsUtilizationRate: number;
  engagementTrend: 'Rising' | 'Stable' | 'Declining';
  topUtilizedBenefits: { benefit: string; utilizationCount: number }[];
}

export interface ComplianceCheckResponse {
  healthScorePercent: number;
  missingPayrollInfoEmployees: { employeeId: string; employeeName: string; missingField: string }[];
  statutoryChecks: { rule: string; status: 'Compliant' | 'Action Required'; details: string }[];
}

export interface KnowledgeSyncResponse {
  success: boolean;
  syncedEntities: number;
  lastSyncedAt: string;
  details: string;
}

// ─── Payroll Calculation Engine ───────────────────────────────────────────────
export interface PayrollCalculationInput {
  basicSalary: number;
  hra?: number;
  allowances?: number;
  bonuses?: number;
  incentives?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  advanceDeduction?: number;
  loanRepayment?: number;
  otherDeductions?: number;
  includeEpf?: boolean;
  includeEsi?: boolean;
  taxRatePercent?: number;
}

export interface PayrollCalculationResult {
  basicSalary: number;
  hra: number;
  allowances: number;
  bonuses: number;
  incentives: number;
  overtimeEarnings: number;
  grossSalary: number;
  epfDeduction: number;
  epfEmployerContribution: number;
  esiDeduction: number;
  esiEmployerContribution: number;
  taxDeductions: number;
  advanceDeduction: number;
  loanRepayment: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}
