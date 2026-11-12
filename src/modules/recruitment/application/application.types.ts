import { Types, Document } from 'mongoose';

export type ApplicationStatus =
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interviewed'
  | 'Offered'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn';

export interface IStatusHistoryItem {
  status: ApplicationStatus;
  stage?: string;
  changedAt: Date;
  changedBy?: string;
  comment?: string;
}

export interface IApplication {
  _id?: string | Types.ObjectId;
  candidateId: Types.ObjectId | any;
  vacancyId: Types.ObjectId | any;
  jobPostingId?: Types.ObjectId | any;
  appliedDate: Date;
  status: ApplicationStatus;
  currentStage: string;
  resumeUrl?: string;
  matchScore?: number;
  statusHistory: IStatusHistoryItem[];
  notes?: string;
  rejectionReason?: string;
  offerDetails?: {
    offeredSalary?: number;
    offeredDate?: Date;
    joiningDate?: Date;
    status?: 'Pending' | 'Accepted' | 'Declined';
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type IApplicationDocument = Document & IApplication;

export interface CreateApplicationDTO {
  candidateId: string;
  vacancyId: string;
  jobPostingId?: string;
  appliedDate?: string | Date;
  status?: ApplicationStatus;
  currentStage?: string;
  resumeUrl?: string;
  matchScore?: number;
  notes?: string;
}

export interface UpdateApplicationDTO {
  candidateId?: string;
  vacancyId?: string;
  jobPostingId?: string;
  status?: ApplicationStatus;
  currentStage?: string;
  resumeUrl?: string;
  matchScore?: number;
  notes?: string;
  rejectionReason?: string;
  offerDetails?: {
    offeredSalary?: number;
    offeredDate?: Date;
    joiningDate?: Date;
    status?: 'Pending' | 'Accepted' | 'Declined';
  };
}

export interface UpdateApplicationStatusDTO {
  status: ApplicationStatus;
  stage?: string;
  comment?: string;
  changedBy?: string;
}

export interface ApplicationQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: ApplicationStatus | string;
  vacancyId?: string;
  candidateId?: string;
  jobPostingId?: string;
  currentStage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
