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
  status: 'Uploaded' | 'Parsed' | 'Shortlisted' | 'Archived';
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
  status?: 'Uploaded' | 'Parsed' | 'Shortlisted' | 'Archived';
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
  status?: 'Uploaded' | 'Parsed' | 'Shortlisted' | 'Archived';
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
