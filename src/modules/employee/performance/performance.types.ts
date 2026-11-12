import { Document, Types } from 'mongoose';

export type ReviewStatus = 'Approved' | 'Pending' | 'Reviewing';

export interface IPerformanceReview extends Document {
  id?: string;
  employeeName: string;
  employeeId?: string;
  employeeRef?: Types.ObjectId;
  jobTitle: string;
  reviewPeriod: string;
  dueDate: string;
  reviewer: string;
  reviewerId?: Types.ObjectId;
  reviewStatus: ReviewStatus;
  score?: number;
  ratings?: Array<{ competency: string; score: number; status: string }>;
  feedback?: string;
}

export interface IPerformanceTracker extends Document {
  id?: string;
  trackerName: string;
  employeeName: string;
  employeeId?: string;
  addedDate: string;
  modifiedDate: string;
  logs?: string[];
}
