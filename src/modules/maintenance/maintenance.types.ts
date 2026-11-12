import { Document } from 'mongoose';

export type MaintenanceTicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';

export type MaintenanceTicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type MaintenanceTicketCategory =
  | 'System Error'
  | 'Access Issue'
  | 'Hardware'
  | 'Software'
  | 'Network'
  | 'Database'
  | 'Other';

export interface ITicketComment {
  id: string;
  author: string;
  authorEmail?: string;
  role: string;
  text: string;
  timestamp: string;
  isStaff?: boolean;
}

export interface ITicketHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface IMaintenanceTicket {
  ticketNumber: string;
  title: string;
  description: string;
  priority: MaintenanceTicketPriority;
  category: MaintenanceTicketCategory;
  status: MaintenanceTicketStatus;
  requesterName: string;
  requesterEmail?: string;
  department?: string;
  assignedAgent?: string;
  assignedAgentId?: string;
  createdDate: string;
  resolvedDate?: string;
  closedDate?: string;
  comments: ITicketComment[];
  history: ITicketHistoryEntry[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IMaintenanceTicketDocument extends IMaintenanceTicket, Document {}

// ================= HUREMASO SUBSECTION TYPES =================

export type HuremasoLogStatus = 'Scheduled' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface IHuremasoMaintenanceLog {
  title: string;
  description?: string;
  scheduledDate: string;
  duration: string;
  status: HuremasoLogStatus;
  affectedServices: string[];
  performedBy?: string;
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHuremasoMaintenanceLogDocument extends IHuremasoMaintenanceLog, Document {}

export interface IHuremasoSystemHealth {
  systemName: string;
  status: 'Operational' | 'Degraded' | 'Under Maintenance';
  uptimePercentage: number;
  activeNodesCount: number;
  totalNodesCount: number;
  databaseStatus: string;
  fragmentationCount: number;
  cacheLatencyMs: number;
  redisStatus: string;
  lastDiagnosticRun: string;
  diagnosticsSummary: string;
}

export interface IHuremasoSystemHealthDocument extends IHuremasoSystemHealth, Document {}

// ================= FILTER & PAGINATION PARAMS =================

export interface IMaintenanceFilterParams {
  status?: string;
  priority?: string;
  category?: string;
  department?: string;
  assignedAgent?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
