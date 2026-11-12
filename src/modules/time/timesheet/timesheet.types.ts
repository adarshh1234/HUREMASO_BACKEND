import { Types, Document } from 'mongoose';

export type TimesheetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface ITimesheetRow {
  projectId?: Types.ObjectId | any;
  projectName: string;
  activity: string;
  monHours: number;
  tueHours: number;
  wedHours: number;
  thuHours: number;
  friHours: number;
  satHours: number;
  sunHours: number;
  totalHours: number;
}

export interface ITimesheetAction {
  action: string;
  performedBy: string;
  comment?: string;
  date: Date;
}

export interface ITimesheet {
  _id?: string | Types.ObjectId;
  employeeId: Types.ObjectId | any;
  employeeName?: string;
  periodStartDate: string;
  periodEndDate: string;
  period: string;
  rows: ITimesheetRow[];
  totalPeriodHours: number;
  status: TimesheetStatus;
  actions: ITimesheetAction[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITimesheetDocument = Document & ITimesheet;

export interface CreateTimesheetDTO {
  employeeId?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  period?: string;
  rows: ITimesheetRow[];
  status?: TimesheetStatus;
  comment?: string;
}

export interface TimesheetQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  employeeId?: string;
  status?: string;
  period?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
