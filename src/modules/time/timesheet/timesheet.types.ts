import { Types, Document } from 'mongoose';

export type TimesheetStatus = 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected';
export type WorkType = 'office' | 'access_control' | 'site_work' | 'field_work';

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
  employeeCode?: string;
  employeeName?: string;
  companyName?: string;
  jobDescription?: string;
  workType?: WorkType;
  officeLocation?: string;
  loginSource?: string;
  loginTime?: string;
  logoutTime?: string;
  signInMethod?: string;
  gpsLocation?: string;
  projectName?: string;
  projectLocation?: string;
  siteLocation?: string;
  siteName?: string;
  supervisorName?: string;
  supervisorId?: string;
  timeIn?: string;
  timeOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  assignedField?: string;
  date?: string;
  location?: string;
  workDetails?: string;
  checkInTime?: string;
  checkOutTime?: string;
  deviceSource?: string;
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
  id?: string;
  _id?: string;
  employeeId?: string;
  employeeCode?: string;
  employeeName?: string;
  companyName?: string;
  jobDescription?: string;
  workType?: WorkType;
  officeLocation?: string;
  loginSource?: string;
  loginTime?: string;
  logoutTime?: string;
  signInMethod?: string;
  gpsLocation?: string;
  projectName?: string;
  projectLocation?: string;
  siteLocation?: string;
  siteName?: string;
  supervisorName?: string;
  supervisorId?: string;
  timeIn?: string;
  timeOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  assignedField?: string;
  date?: string;
  location?: string;
  workDetails?: string;
  checkInTime?: string;
  checkOutTime?: string;
  deviceSource?: string;
  hours?: number;
  periodStartDate?: string;
  periodEndDate?: string;
  period?: string;
  rows?: ITimesheetRow[];
  status?: TimesheetStatus;
  comment?: string;
}

export interface TimesheetQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  employeeId?: string;
  employeeCode?: string;
  companyName?: string;
  workType?: WorkType | string;
  officeLocation?: string;
  loginSource?: string;
  signInMethod?: string;
  projectName?: string;
  projectLocation?: string;
  siteLocation?: string;
  siteName?: string;
  supervisorName?: string;
  assignedField?: string;
  location?: string;
  date?: string;
  status?: string;
  period?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
