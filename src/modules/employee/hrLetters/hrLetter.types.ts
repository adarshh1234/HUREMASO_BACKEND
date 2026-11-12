import { Document } from 'mongoose';

export type CommunicationType = 'memo' | 'notice' | 'circular' | 'letter' | 'letters';
export type CommunicationStatus = 'Draft' | 'Published' | 'Active' | 'Archived' | 'Completed';

export interface IHrCommunication extends Document {
  id: string;
  type: CommunicationType;
  title: string;
  content: string;
  department?: string;
  dept?: string;
  targetAudience?: string;
  recipient?: string;
  employeeTarget?: string;
  employeeId?: string;
  author: string;
  createdBy: string;
  status: CommunicationStatus;
  issuedDate?: string;
  date: string;
  attachments: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILetterTemplate extends Document {
  id: string;
  name: string;
  category?: 'Offer' | 'Confirmation' | 'Relieving' | 'Experience' | 'Warning' | 'Promotion' | 'General';
  type: CommunicationType;
  subject: string;
  body: string;
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIssuedLetter extends Document {
  id: string;
  employeeId: string;
  templateId?: string;
  letterType: string;
  subject: string;
  content: string;
  issuedDate: string;
  issuedBy: string;
  createdBy: string;
  status: 'Draft' | 'Issued' | 'Signed' | 'Revoked' | 'Published';
  documentUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCommunicationDTO {
  type: CommunicationType;
  title: string;
  content?: string;
  department?: string;
  dept?: string;
  targetAudience?: string;
  recipient?: string;
  employeeTarget?: string;
  employeeId?: string;
  author?: string;
  createdBy?: string;
  status?: CommunicationStatus;
  issuedDate?: string;
  date?: string;
  attachments?: string[];
}

export interface UpdateCommunicationDTO extends Partial<CreateCommunicationDTO> {}

export interface CommunicationQueryParams {
  type?: string;
  status?: string;
  department?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTemplateDTO {
  name: string;
  category?: 'Offer' | 'Confirmation' | 'Relieving' | 'Experience' | 'Warning' | 'Promotion' | 'General';
  type?: CommunicationType;
  subject: string;
  body?: string;
  message?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateTemplateDTO extends Partial<CreateTemplateDTO> {}

export interface CreateIssuedLetterDTO {
  employeeId: string;
  templateId?: string;
  letterType?: string;
  subject?: string;
  content: string;
  issuedDate?: string;
  issuedBy?: string;
  createdBy?: string;
  status?: 'Draft' | 'Issued' | 'Signed' | 'Revoked' | 'Published';
  documentUrl?: string;
}

export interface UpdateIssuedLetterDTO extends Partial<CreateIssuedLetterDTO> {}

export interface GenerateLetterDTO {
  templateId?: string;
  templateName?: string;
  letterType?: string;
  employeeId?: string;
  employeeName?: string;
  companyName?: string;
  subject?: string;
  replacements?: Record<string, string>;
}
