import { Types, Document } from 'mongoose';

export type ReplacementStatus = 'Pending' | 'Pending Manager Sign-off' | 'Approved' | 'Rejected';

export interface IReplacement {
  _id?: string | Types.ObjectId;
  originalEmployeeId?: Types.ObjectId | any;
  originalEmployeeName?: string;
  substituteEmployeeId?: Types.ObjectId | any;
  substituteEmployeeName: string;
  department: string;
  shiftDate: string;
  shiftTime?: string;
  shift: string;
  reason: string;
  daysEarned?: number;
  hoursWorked?: number;
  expiryDate?: string;
  status: ReplacementStatus;
  approverName?: string;
  approvedAt?: Date;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IReplacementDocument = Document & IReplacement;

export interface CreateReplacementDTO {
  originalEmployeeId?: string;
  originalEmployeeName?: string;
  substituteEmployeeId?: string;
  substituteEmployeeName?: string;
  employeeName?: string;
  department?: string;
  shiftDate?: string;
  workDate?: string;
  claimDate?: string;
  shiftTime?: string;
  shift?: string;
  reason?: string;
  daysEarned?: number;
  hoursWorked?: number;
  expiryDate?: string;
  status?: ReplacementStatus;
}

export interface ReplacementQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  originalEmployeeId?: string;
  substituteEmployeeId?: string;
  department?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IReplacementMetrics {
  activeReplacementShifts: number;
  pendingShiftSwaps: number;
  rosterCoverageRate: string;
}
