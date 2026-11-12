import { Types, Document } from 'mongoose';

// ─── Payroll Record (One-Tap Payroll) ─────────────────────────────────────────
export type PayrollRecordStatus = 'Paid' | 'Pending';

export interface IPayrollRecord {
  _id?: string | Types.ObjectId;
  employeeName: string;
  employeeId?: string;
  department: string;
  date: string;
  period?: string;
  amount: number;
  paidAmount?: number;
  status: PayrollRecordStatus;
  category?: 'statement' | 'upcoming' | 'slips' | 'pay-on-request' | 'advance-payments';
  paymentMethod?: string;
  paidAt?: string;
  transactionRef?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IPayrollRecordDocument = Document & IPayrollRecord;

export interface CreatePayrollRecordDTO {
  employeeName: string;
  employeeId?: string;
  department: string;
  date?: string;
  period?: string;
  amount: number;
  category?: 'statement' | 'upcoming' | 'slips' | 'pay-on-request' | 'advance-payments';
  status?: PayrollRecordStatus;
  notes?: string;
}

export interface PayRecordDTO {
  id?: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PayrollRecordQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  category?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Finance Requests ────────────────────────────────────────────────────────
export type FinanceRequestStatus = 'Pending' | 'Approved' | 'Rejected';

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
  notes?: string;
}

export interface FinanceRequestQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Benefit Advance ─────────────────────────────────────────────────────────
export type BenefitAdvanceStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IBenefitAdvance {
  _id?: string | Types.ObjectId;
  advanceId: string;
  employeeName: string;
  employeeId?: string;
  benefitType: string;
  category: 'employee-benefits' | 'performance-benefits' | 'other-benefits' | 'benefit-advance';
  amount: number;
  description?: string;
  status: BenefitAdvanceStatus;
  dateRequested: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IBenefitAdvanceDocument = Document & IBenefitAdvance;

export interface CreateBenefitAdvanceDTO {
  employeeName: string;
  employeeId?: string;
  benefitType: string;
  category: IBenefitAdvance['category'];
  amount: number;
  description?: string;
  notes?: string;
}

export interface BenefitAdvanceQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Salary Disbursement ─────────────────────────────────────────────────────
export type DisbursementStatus = 'Paid' | 'Pending' | 'Failed' | 'Processing';
export type DisbursementMethod = 'Bank Transfer' | 'Cash' | 'Cheque';

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
  method?: DisbursementMethod;
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
}

// ─── Payment Application ──────────────────────────────────────────────────────
export type PaymentApplicationStatus = 'Active' | 'Pending' | 'Inactive' | 'Error';

export interface IPaymentApplication {
  _id?: string | Types.ObjectId;
  applicationId: string;
  name: string;
  provider: string;
  apiKeyMasked?: string;
  webhookUrl?: string;
  status: PaymentApplicationStatus;
  autoDisburse: boolean;
  disbursementDay?: number;
  lastSync?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IPaymentApplicationDocument = Document & IPaymentApplication;

export interface CreatePaymentApplicationDTO {
  name: string;
  provider: string;
  apiKey?: string;
  webhookUrl?: string;
  autoDisburse?: boolean;
  disbursementDay?: number;
  notes?: string;
}

export interface PaymentApplicationQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
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
}

export interface PayrollReportsSummary {
  totalMonthlyOutflow: number;
  pendingRequestsCount: number;
  budgetVariancePercent: number;
  paidCount: number;
  pendingCount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}
