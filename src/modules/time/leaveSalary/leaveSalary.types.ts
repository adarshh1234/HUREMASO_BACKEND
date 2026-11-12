import { Types, Document } from 'mongoose';

export type LeaveSalaryStatus = 'Pending' | 'Approved for Payroll' | 'Disbursed' | 'Rejected';

export interface ILeaveSalary {
  _id?: string | Types.ObjectId;
  employeeId: Types.ObjectId | any;
  employeeName: string;
  department: string;
  leaveType: string;
  availableBalance: number;
  availableBalanceText?: string;
  daysEncashing: number;
  daysEncashingText?: string;
  dailyRate: number;
  dailyRateText?: string;
  totalValuation: number;
  totalValuationText?: string;
  status: LeaveSalaryStatus;
  disbursedDate?: Date;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ILeaveSalaryDocument = Document & ILeaveSalary;

export interface CreateLeaveSalaryDTO {
  employeeId?: string;
  employeeName?: string;
  department?: string;
  leaveType?: string;
  availableBalance?: number;
  daysEncashing: number;
  dailyRate?: number;
  reason?: string;
  status?: LeaveSalaryStatus;
}

export interface LeaveSalaryQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  employeeId?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ILeaveSalaryMetrics {
  totalEncashableDays: number;
  totalEncashableDaysText: string;
  totalEncashmentValuation: number;
  totalEncashmentValuationText: string;
  activeApplicationsCount: number;
}
