import { Types, Document } from 'mongoose';

export type TimePayrollStatus = 'Processed' | 'Pending Sync' | 'Draft';

export interface ITimePayroll {
  _id?: string | Types.ObjectId;
  recordId: string;
  employeeId?: Types.ObjectId | any;
  name: string;
  dept: string;
  month?: string; // YYYY-MM
  year?: number;
  daysPresent: number;
  paidLeave: number;
  shiftAllowance: string;
  shiftAllowanceAmount?: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  lopDeductions?: number;
  netAdjustment: string;
  netAdjustmentAmount?: number;
  status: TimePayrollStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITimePayrollDocument = Document & ITimePayroll;

export interface CreateTimePayrollDTO {
  recordId?: string;
  employeeId?: string;
  name: string;
  dept?: string;
  month?: string;
  year?: number;
  daysPresent: number;
  paidLeave?: number;
  shiftAllowance?: string;
  shiftAllowanceAmount?: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  lopDeductions?: number;
  netAdjustment?: string;
  netAdjustmentAmount?: number;
  status?: TimePayrollStatus;
  notes?: string;
}

export interface TimePayrollQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  employeeId?: string;
  dept?: string;
  status?: string;
  month?: string;
  year?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ITimePayrollSummary {
  totalPayableHoursLogged: number;
  totalPayableHoursLoggedText: string;
  complianceRate: string;
  shiftDifferentialAllowance: number;
  shiftDifferentialAllowanceText: string;
  unpaidLopDeductions: number;
  unpaidLopDeductionsText: string;
  totalProcessedCount: number;
}
