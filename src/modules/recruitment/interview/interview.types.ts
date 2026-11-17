import { Types, Document } from 'mongoose';

export type InterviewType = 'Technical' | 'HR' | 'Managerial' | 'Cultural' | 'Final' | 'Other';
export type InterviewMode = 'Online' | 'In-Person' | 'Telephonic';
export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'No Show';
export type InterviewResult = 'Pending' | 'Passed' | 'Failed' | 'On Hold';

export interface IInterviewer {
  employeeId?: Types.ObjectId | any;
  name: string;
  email?: string;
  role?: string;
}

export interface IInterview {
  _id?: string | Types.ObjectId;
  candidateId: Types.ObjectId | any;
  vacancyId?: Types.ObjectId | any;
  applicationId?: Types.ObjectId | any;
  roundName: string;
  interviewDate: Date;
  startTime?: string;
  endTime?: string;
  interviewers: IInterviewer[];
  interviewType: InterviewType;
  mode: InterviewMode;
  meetingLink?: string;
  location?: string;
  status: InterviewStatus;
  notes?: string;
  rating?: number;
  result: InterviewResult;
  feedbackSubmitted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IInterviewDocument = Document & IInterview;

export interface CreateInterviewDTO {
  candidateId: string;
  vacancyId?: string;
  applicationId?: string;
  roundName: string;
  interviewDate: string | Date;
  startTime?: string;
  endTime?: string;
  interviewers: IInterviewer[];
  interviewType?: InterviewType;
  mode?: InterviewMode;
  meetingLink?: string;
  location?: string;
  status?: InterviewStatus;
  result?: InterviewResult;
  notes?: string;
}

export interface UpdateInterviewDTO {
  candidateId?: string;
  vacancyId?: string;
  applicationId?: string;
  roundName?: string;
  interviewDate?: string | Date;
  startTime?: string;
  endTime?: string;
  interviewers?: IInterviewer[];
  interviewType?: InterviewType;
  mode?: InterviewMode;
  meetingLink?: string;
  location?: string;
  status?: InterviewStatus;
  notes?: string;
  rating?: number;
  result?: InterviewResult;
  feedbackSubmitted?: boolean;
}

export interface InterviewQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  candidateId?: string;
  vacancyId?: string;
  status?: InterviewStatus | string;
  interviewType?: InterviewType | string;
  result?: InterviewResult | string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type RecommendationType = 'Strong Hire' | 'Hire' | 'Hold' | 'Reject';

export interface IFeedback {
  _id?: string | Types.ObjectId;
  interviewId?: Types.ObjectId | any;
  candidateId?: Types.ObjectId | any;
  candidateName?: string;
  position?: string;
  interviewDate?: string;
  interviewerName: string;
  interviewerEmployeeId?: Types.ObjectId | any;
  technicalRating?: number;
  communicationRating?: number;
  culturalFitRating?: number;
  overallRating: number;
  strengths?: string;
  areasOfImprovement?: string;
  recommendation: RecommendationType;
  comments: string;
  submittedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IFeedbackDocument = Document & IFeedback;

export interface CreateFeedbackDTO {
  interviewId?: string;
  candidateId?: string;
  candidateName?: string;
  position?: string;
  interviewDate?: string;
  interviewerName: string;
  interviewerEmployeeId?: string;
  technicalRating?: number;
  communicationRating?: number;
  culturalFitRating?: number;
  overallRating: number;
  strengths?: string;
  areasOfImprovement?: string;
  recommendation: RecommendationType;
  comments: string;
}

export interface UpdateFeedbackDTO {
  interviewerName?: string;
  interviewerEmployeeId?: string;
  technicalRating?: number;
  communicationRating?: number;
  culturalFitRating?: number;
  overallRating?: number;
  strengths?: string;
  areasOfImprovement?: string;
  recommendation?: RecommendationType;
  comments?: string;
}
