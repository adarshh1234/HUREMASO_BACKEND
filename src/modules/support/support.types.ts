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

export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';

export interface ITicketComment {
  id: string;
  author: string;
  authorEmail?: string;
  role: string;
  text: string;
  timestamp: string;
  isStaff?: boolean;
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
  resolutionDetails?: string;
  resolvedAt?: string;
  closedAt?: string;
  comments: ITicketComment[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupportTicketDocument extends ISupportTicket, Document {}

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
export type MiscRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IMiscellaneousRequest {
  id?: string;
  requestId: string;
  employee: string;
  name?: string;
  department: string;
  dept?: string;
  requestType: string;
  type?: string;
  description: string;
  date: string;
  priority: MiscRequestPriority;
  status: MiscRequestStatus;
  createdBy: string;
  email?: string;
  comments?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMiscellaneousRequestDocument extends Omit<IMiscellaneousRequest, 'id'>, Document {}

export interface CreateMiscRequestDTO {
  requestId?: string;
  employee?: string;
  name?: string;
  department?: string;
  dept?: string;
  requestType?: string;
  type?: string;
  description: string;
  date?: string;
  priority?: MiscRequestPriority;
  status?: MiscRequestStatus;
  createdBy?: string;
  email?: string;
  comments?: string;
}

export interface UpdateMiscRequestDTO extends Partial<CreateMiscRequestDTO> {}

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
  approved: number;
  rejected: number;
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
    lastUpdated: string;
  }>;
}
