import { Types, Document } from 'mongoose';

export interface IEducationItem {
  degree: string;
  institution?: string;
  year?: string | number;
  field?: string;
}

export interface IExperienceItem {
  company: string;
  role: string;
  duration?: string;
  description?: string;
}

export interface IParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  skills: string[];
  experienceYears?: number;
  education: IEducationItem[];
  workExperience: IExperienceItem[];
  summary?: string;
}

export interface IResume {
  _id?: string | Types.ObjectId;
  candidateId?: Types.ObjectId | any;
  candidateName: string;
  email?: string;
  phone?: string;
  title?: string;
  skills: string[];
  experienceYears: number;
  education: IEducationItem[];
  workExperience: IExperienceItem[];
  rawText?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  parsedData?: IParsedResumeData;
  matchedVacancyId?: Types.ObjectId | any;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  source?: 'LetsGetIn' | 'Direct Upload' | 'Referral' | string;
  isVerifiedLetsGetIn?: boolean;
  verifiedDate?: string;
  assessmentScore?: number;
  location?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  avatar?: string;
  previousCompany?: string;
  summary?: string;
  status: 'Uploaded' | 'Parsed' | 'Shortlisted' | 'Archived' | 'New' | 'Screened' | 'Interview' | 'Offered';
  createdAt?: Date;
  updatedAt?: Date;
}

export type IResumeDocument = Document & IResume;

export interface CreateResumeDTO {
  candidateId?: string;
  candidateName: string;
  email?: string;
  phone?: string;
  title?: string;
  skills?: string[];
  experienceYears?: number;
  education?: IEducationItem[];
  workExperience?: IExperienceItem[];
  rawText?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  matchedVacancyId?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  source?: 'LetsGetIn' | 'Direct Upload' | 'Referral' | string;
  isVerifiedLetsGetIn?: boolean;
  verifiedDate?: string;
  assessmentScore?: number;
  location?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  avatar?: string;
  previousCompany?: string;
  summary?: string;
  status?: 'Uploaded' | 'Parsed' | 'Shortlisted' | 'Archived' | 'New' | 'Screened' | 'Interview' | 'Offered';
}

export interface UpdateResumeDTO {
  candidateId?: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  title?: string;
  skills?: string[];
  experienceYears?: number;
  education?: IEducationItem[];
  workExperience?: IExperienceItem[];
  rawText?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  matchedVacancyId?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  source?: 'LetsGetIn' | 'Direct Upload' | 'Referral' | string;
  isVerifiedLetsGetIn?: boolean;
  verifiedDate?: string;
  assessmentScore?: number;
  location?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  avatar?: string;
  previousCompany?: string;
  summary?: string;
  status?: 'Uploaded' | 'Parsed' | 'Shortlisted' | 'Archived' | 'New' | 'Screened' | 'Interview' | 'Offered';
}

export interface ParseCvRequestDTO {
  rawText?: string;
  fileUrl?: string;
  fileName?: string;
  vacancyId?: string;
  targetSkills?: string[];
}

export interface ResumeQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  skill?: string;
  status?: string;
  matchedVacancyId?: string;
  minExperience?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
