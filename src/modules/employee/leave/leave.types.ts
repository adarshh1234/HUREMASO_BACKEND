import { Document, Types } from 'mongoose';

export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type EntitlementTargetType = 'individual' | 'multiple';
export type DayType = 'Full Day' | 'Half Day';

export interface ILeaveTypeConfig extends Document {
  name: string;
  daysPerYear?: number;
}

export interface ILeavePeriodConfig extends Document {
  startMonth: string;
  startDate: string;
  endDate: string;
  currentPeriod: string;
}

export interface IWorkWeekConfig extends Document {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface IHoliday extends Document {
  name: string;
  date: string;
  dayType: DayType;
  repeatsAnnually: boolean;
}

export interface ILeaveEntitlement extends Document {
  employeeId?: string;
  employeeRef?: Types.ObjectId;
  employeeName?: string;
  leaveType: string;
  entitlementType: string;
  validFrom: string;
  validTo: string;
  days: number;
}

export interface ILeaveRequest extends Document {
  id?: string;
  employeeId?: string;
  employeeRef?: Types.ObjectId;
  employeeName: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  status: LeaveRequestStatus;
  comments: string;
  dateRequested: string;
}

export interface ILeaveBalance {
  leaveType: string;
  entitled: number;
  pending: number;
  scheduled: number;
  taken: number;
  balance: number;
}
