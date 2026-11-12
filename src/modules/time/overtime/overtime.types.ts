import { Types, Document } from 'mongoose';

export type OvertimeStatus = 'Pending' | 'Pending Approval' | 'Approved' | 'Rejected';

export interface IOvertime {
  _id?: string | Types.ObjectId;
  employeeId: Types.ObjectId | any;
  employeeName: string;
  department: string;
  date: string;
  startTime?: string;
  endTime?: string;
  hours: number;
  hoursText?: string;
  multiplier: string;
  multiplierRate: number;
  hourlyRate: number;
  amount: number;
  amountText?: string;
  reason?: string;
  status: OvertimeStatus;
  approverName?: string;
  approvedAt?: Date;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IOvertimeDocument = Document & IOvertime;

export interface CreateOvertimeDTO {
  employeeId?: string;
  employeeName?: string;
  department?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  hours?: number;
  multiplier?: string;
  hourlyRate?: number;
  reason?: string;
  status?: OvertimeStatus;
}

export interface OvertimeQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  employeeId?: string;
  department?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IOvertimeMetrics {
  totalOtHours: number;
  totalOtHoursText: string;
  pendingApprovalsCount: number;
  totalPayoutValuation: number;
  totalPayoutValuationText: string;
}
