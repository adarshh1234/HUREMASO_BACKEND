import { Types, Document } from 'mongoose';

export type AttendanceStatus = 'Present' | 'Late' | 'Half-Day' | 'Absent' | 'On Leave';

export interface IPunchRecord {
  _id?: string | Types.ObjectId;
  punchInTime: Date;
  punchInNote?: string;
  punchOutTime?: Date;
  punchOutNote?: string;
  durationMinutes?: number;
  durationHours?: string;
}

export interface IAttendance {
  _id?: string | Types.ObjectId;
  employeeId: Types.ObjectId | any;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  punches: IPunchRecord[];
  totalWorkingMinutes: number;
  totalWorkingHours: string; // e.g. "08.50"
  status: AttendanceStatus;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IAttendanceDocument = Document & IAttendance;

export interface PunchInDTO {
  employeeId?: string;
  date?: string;
  time?: string;
  note?: string;
}

export interface PunchOutDTO {
  employeeId?: string;
  date?: string;
  time?: string;
  note?: string;
}

export interface AttendanceQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  employeeId?: string;
  employeeName?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IAttendanceConfig {
  recordWorkingTime: boolean;
  canEditRecords: boolean;
  supervisorCanEdit: boolean;
  standardHours?: number;
  breakDuration?: number;
  gracePeriodMinutes?: number;
}

