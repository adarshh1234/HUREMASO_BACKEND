export type CandidateStatus =
  | 'Applied'
  | 'Application Initiated'
  | 'Screened'
  | 'Shortlisted'
  | 'Interview'
  | 'Interview Scheduled'
  | 'Interview Passed'
  | 'Interview Failed'
  | 'Selected'
  | 'Offered'
  | 'Job Offered'
  | 'Onboarding'
  | 'Hired'
  | 'Rejected';

export interface ICandidate {
  id?: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  location?: string;
  vacancy?: string;
  vacancyId?: any;
  hiringManager?: string;
  dateApplied?: string;
  status: CandidateStatus;
  experienceYears?: number;
  experience?: number;
  skills?: string[];
  education?: string;
  currentCompany?: string;
  currentDesignation?: string;
  jobTitle?: string;
  noticePeriod?: string;
  expectedSalary?: string;
  resumeUrl?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  isArchived?: boolean;
  employeeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCandidateDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  location?: string;
  vacancy?: string;
  vacancyId?: string;
  hiringManager?: string;
  status?: CandidateStatus;
  experienceYears?: number;
  experience?: number;
  skills?: string[];
  education?: string;
  currentCompany?: string;
  currentDesignation?: string;
  jobTitle?: string;
  noticePeriod?: string;
  expectedSalary?: string;
  resumeUrl?: string;
  source?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCandidateDTO extends Partial<CreateCandidateDTO> {
  isArchived?: boolean;
  employeeId?: string;
}

export interface CandidateQueryParams {
  search?: string;
  vacancy?: string;
  vacancyId?: string;
  hiringManager?: string;
  status?: string;
  skills?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
