import { Document } from 'mongoose';

export type AssociationStatus =
  | 'Pending'
  | 'Approved'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Active'
  | 'Inactive';

export type AssociationType =
  | 'Internal Department'
  | 'Project Collaboration'
  | 'Resource Sharing'
  | 'Cross-Team'
  | 'External Entity'
  | 'Professional Guild'
  | 'Other';

export interface IAssociationApproval {
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface IAssociationAuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface IAssociation {
  associationCode: string;
  employeeName: string;
  employeeId?: string;
  requesterEmail?: string;
  requesterAvatar?: string;
  department: string;
  targetDepartment?: string;
  associatedEntity?: string;
  associationType: AssociationType | string;
  requestDetails: string;
  status: AssociationStatus;
  dateRequested: string;
  effectiveDate?: string;
  expiryDate?: string;
  durationMonths?: number;
  attachments?: string[];
  notes?: string;
  isExisting: boolean;
  approvalDetails?: IAssociationApproval;
  history: IAssociationAuditLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IRenewAssociationInput {
  durationMonths?: number;
  expiryDate?: string;
  notes?: string;
  performedBy?: string;
}

export interface IAssociationDocument extends IAssociation, Document {}

// ================= FILTER & QUERY TYPES =================

export interface IAssociationFilterParams {
  type?: 'new' | 'existing' | 'all';
  status?: string;
  department?: string;
  targetDepartment?: string;
  associationType?: string;
  employeeName?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'dateRequested' | 'employeeName' | 'status' | 'department';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IAssociationOverviewStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  activeExisting: number;
}
