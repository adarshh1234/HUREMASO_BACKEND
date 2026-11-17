import { Document } from 'mongoose';

export type TicketCategory =
  | 'IT Support'
  | 'Hardware'
  | 'Software'
  | 'Access / Permissions'
  | 'HR Support'
  | 'Facilities'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Reopened';

export interface ITicketComment {
  id: string;
  author: string;
  authorEmail?: string;
  role: string;
  text: string;
  timestamp: string;
  isStaff?: boolean;
}

export interface ITicketInternalNote {
  id: string;
  author: string;
  authorEmail?: string;
  text: string;
  timestamp: string;
}

export interface ITicketHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface ISupportTicket {
  ticketNumber: string;
  requesterName: string;
  requesterEmail: string;
  department: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  assignedAgent?: string;
  assignedAgentEmail?: string;
  resolutionDetails?: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenedAt?: string;
  firstResponseAt?: string;
  slaDueAt?: string;
  linkedMaintenanceId?: string;
  comments: ITicketComment[];
  internalNotes?: ITicketInternalNote[];
  history?: ITicketHistoryEntry[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupportTicketDocument extends ISupportTicket, Document {}

// ================= SUPPORT AGENT =================

export type SupportAgentStatus = 'Online' | 'Offline' | 'Busy' | 'On Leave';

export interface ISupportAgent {
  id?: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: SupportAgentStatus;
  specialties: string;
  avatar?: string;
  assignedTicketCount: number;
  resolvedTicketCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupportAgentDocument extends Omit<ISupportAgent, 'id'>, Document {}

// ================= MAINTENANCE REQUEST =================

export type MaintenanceStatus = 'Reported' | 'Scheduled' | 'In Progress' | 'Operational' | 'Resolved' | 'Cancelled';

export interface ISupportMaintenance {
  system: string;
  title: string;
  description: string;
  category: 'Infrastructure' | 'Database' | 'Network' | 'Software' | 'Hardware' | 'Facilities';
  priority: TicketPriority;
  status: MaintenanceStatus;
  requestedBy: string;
  requestedByEmail?: string;
  department?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  targetUptime?: string;
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupportMaintenanceDocument extends ISupportMaintenance, Document {}

// ================= HELP / KNOWLEDGE BASE =================

export interface ISupportHelpArticle {
  title: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  viewCount: number;
  helpfulVotes: number;
  unhelpfulVotes?: number;
  isPublished: boolean;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupportHelpArticleDocument extends ISupportHelpArticle, Document {}

// ================= CONTACT SUPPORT INQUIRY =================

export type ContactInquiryStatus = 'New' | 'In Progress' | 'Replied' | 'Closed';

export interface ISupportContactRequest {
  requesterName: string;
  requesterEmail: string;
  phone?: string;
  department?: string;
  targetAgent?: string;
  subject: string;
  message: string;
  status: ContactInquiryStatus;
  priority: TicketPriority;
  responseMessage?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupportContactRequestDocument extends ISupportContactRequest, Document {}

// ================= MISCELLANEOUS REQUEST =================

export type MiscRequestPriority = 'High' | 'Medium' | 'Low';
export type MiscRequestStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Processed';

export interface IMiscRequestAuditEntry {
  id?: string;
  action: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'UPDATED' | 'COMMENTED';
  previousStatus?: string;
  newStatus: string;
  changedBy: string;
  changedByRole?: string;
  timestamp: string;
  remarks?: string;
}

export interface IMiscellaneousRequest {
  id?: string;
  requestId: string;
  employeeId?: string;
  employee: string;
  name?: string;
  department: string;
  dept?: string;
  title?: string;
  requestType: string;
  type?: string;
  description: string;
  date: string;
  requiredDate?: string;
  attachments?: string[];
  priority: MiscRequestPriority;
  status: MiscRequestStatus;
  createdBy: string;
  email?: string;
  comments?: string;
  reviewerId?: string;
  reviewerName?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  processedAt?: string;
  processedBy?: string;
  auditHistory?: IMiscRequestAuditEntry[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMiscellaneousRequestDocument extends Omit<IMiscellaneousRequest, 'id'>, Document {}

export interface CreateMiscRequestDTO {
  requestId?: string;
  employeeId?: string;
  employee?: string;
  name?: string;
  department?: string;
  dept?: string;
  title?: string;
  requestType?: string;
  type?: string;
  description: string;
  date?: string;
  requiredDate?: string;
  attachments?: string[];
  priority?: MiscRequestPriority;
  status?: MiscRequestStatus;
  createdBy?: string;
  email?: string;
  comments?: string;
}

export interface UpdateMiscRequestDTO extends Partial<CreateMiscRequestDTO> {
  reviewerId?: string;
  reviewerName?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  processedAt?: string;
  processedBy?: string;
}

export interface MiscRequestQueryFilter {
  status?: string;
  requestType?: string;
  type?: string;
  department?: string;
  dept?: string;
  priority?: string;
  employee?: string;
  name?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MiscRequestSummaryCounts {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  processed: number;
}

// ================= QUERY & DASHBOARD PARAMS =================

export interface ISupportQueryFilter {
  status?: string;
  category?: string;
  priority?: string;
  department?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface ISupportDashboardMetrics {
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  reopenedTickets: number;
  unassignedTickets: number;
  totalTickets: number;
  averageResponseTimeHours: number;
  averageResolutionTimeHours: number;
  slaAdherenceRate: number;
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
  priorityBreakdown: Array<{ priority: string; count: number; percentage: number }>;
  recentTickets: Array<{
    id: string;
    ticketNumber: string;
    requesterName: string;
    department: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    assignedAgent?: string;
    lastUpdated: string;
  }>;
}
