import { Document, Types } from 'mongoose';

export type AppraisalCycleStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Active'
  | 'Under Review'
  | 'Calibration'
  | 'Completed'
  | 'Archived';

export type AppraisalFrequency = 'Quarterly' | 'Bi-Annual' | 'Annual';

export interface IAppraisalCycle {
  _id?: string | Types.ObjectId;
  cycleId: string;
  name: string;
  financialYear: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  reviewDeadline: string;
  eligibleDepartments: string[];
  eligibleEmployeeIds: string[];
  frequency: AppraisalFrequency;
  status: AppraisalCycleStatus;
  description?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IAppraisalCycleDocument = Document & IAppraisalCycle;

export interface CreateAppraisalCycleDTO {
  cycleId?: string;
  name: string;
  financialYear?: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  reviewDeadline: string;
  eligibleDepartments?: string[];
  eligibleEmployeeIds?: string[];
  frequency?: AppraisalFrequency;
  status?: AppraisalCycleStatus;
  description?: string;
}
