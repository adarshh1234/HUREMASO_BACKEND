import { Document } from 'mongoose';

export type CommunicationType = 'memo' | 'notice' | 'circular' | 'letter' | 'letters';

export type CommunicationStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Published'
  | 'Active'
  | 'Completed'
  | 'Archived'
  | 'Issued'
  | 'Signed'
  | 'Revoked';

export type DocumentPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface IHrCommunication extends Document {
  id: string;
  referenceNumber: string;
  type: CommunicationType;
  title: string;
  subject?: string;
  content: string;
  department?: string;
  dept?: string;
  targetAudience?: string;
  recipient?: string;
  employeeTarget?: string;
  employeeId?: string;
  author: string;
  createdBy: string;
  updatedBy?: string;
  status: CommunicationStatus;
  priority?: DocumentPriority;
  visibility?: string;
  effectiveDate?: string;
  expiryDate?: string;
  issuedDate?: string;
  date: string;
  approvedBy?: string;
  approvedAt?: Date;
  publishedBy?: string;
  publishedAt?: Date;
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
  referenceNumber: string;
  employeeId: string;
  employeeName?: string;
  designation?: string;
  department?: string;
  templateId?: string;
  letterType: string;
  subject: string;
  content: string;
  issuedDate: string;
  effectiveDate?: string;
  issuedBy: string;
  createdBy: string;
  updatedBy?: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Issued' | 'Signed' | 'Revoked' | 'Published';
  approvedBy?: string;
  approvedAt?: Date;
  documentUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCommunicationDTO {
  referenceNumber?: string;
  type: CommunicationType;
  title: string;
  subject?: string;
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
  priority?: DocumentPriority;
  visibility?: string;
  effectiveDate?: string;
  expiryDate?: string;
  issuedDate?: string;
  date?: string;
  attachments?: string[];
}

export interface UpdateCommunicationDTO extends Partial<CreateCommunicationDTO> {}

export interface CommunicationQueryParams {
  type?: string;
  status?: string;
  department?: string;
  priority?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
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
  referenceNumber?: string;
  employeeId: string;
  employeeName?: string;
  designation?: string;
  department?: string;
  templateId?: string;
  letterType?: string;
  subject?: string;
  content: string;
  issuedDate?: string;
  effectiveDate?: string;
  issuedBy?: string;
  createdBy?: string;
  status?: 'Draft' | 'Pending Approval' | 'Approved' | 'Issued' | 'Signed' | 'Revoked' | 'Published';
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

export interface AIDraftRequestDTO {
  category: 'memo' | 'notice' | 'circular' | 'letter';
  subject: string;
  instructions?: string;
  department?: string;
  targetAudience?: string;
  employeeId?: string;
  priority?: DocumentPriority;
}

export interface AIDraftResponseDTO {
  category: string;
  title: string;
  subject: string;
  content: string;
  department?: string;
  targetAudience?: string;
  priority?: DocumentPriority;
  suggestedReferenceNumber: string;
  model: string;
}

export interface HRLetterStatsSummary {
  total: number;
  memos: number;
  notices: number;
  circulars: number;
  letters: number;
  drafts: number;
  published: number;
  archived: number;
}
