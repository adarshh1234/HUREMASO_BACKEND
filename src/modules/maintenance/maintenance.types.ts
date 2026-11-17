import { Document } from 'mongoose';

export type MaintenanceTicketStatus =
  | 'Open'
  | 'In Progress'
  | 'On Hold'
  | 'Pending'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export type MaintenanceTicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';

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
  resolutionDetails?: string;
  attachments?: string[];
  comments: ITicketComment[];
  history: ITicketHistoryEntry[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IMaintenanceTicketDocument extends IMaintenanceTicket, Document {}

// ================= HUREMASO SUBSECTION TYPES =================

export type HuremasoLogStatus = 'Scheduled' | 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Cancelled';

export interface IMaintenanceExecutionEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface IHuremasoMaintenanceLog {
  title: string;
  description?: string;
  category?: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration: string;
  status: HuremasoLogStatus;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedServices: string[];
  performedBy?: string;
  responsibleAdmin?: string;
  resolutionNotes?: string;
  notes?: string;
  executionHistory?: IMaintenanceExecutionEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IHuremasoMaintenanceLogDocument extends IHuremasoMaintenanceLog, Document {}

export interface IHuremasoSystemHealth {
  systemName: string;
  status: 'Operational' | 'Degraded' | 'Under Maintenance';
  uptimePercentage: number;
  uptimeSeconds?: number;
  uptimeFormatted?: string;
  activeNodesCount: number;
  totalNodesCount: number;
  databaseStatus: string;
  databaseLatencyMs?: number;
  fragmentationCount: number;
  cacheLatencyMs: number | null;
  redisStatus: string;
  redisConfigured?: boolean;
  lastDiagnosticRun: string;
  diagnosticsSummary: string;
}

export interface IHuremasoSystemHealthDocument extends IHuremasoSystemHealth, Document {}

// ================= SYSTEM DIAGNOSTIC TYPES =================

export interface IServerHealthDetail {
  status: 'Healthy' | 'Degraded' | 'Unavailable';
  uptimeSeconds: number;
  uptimeFormatted: string;
  memoryUsageMb: number;
  totalMemoryMb: number;
  nodeVersion: string;
  activeNodes: number;
  platform: string;
  responseTimeMs: number;
}

export interface IDatabaseHealthDetail {
  status: 'Connected' | 'Degraded' | 'Disconnected';
  connectionState: string;
  pingLatencyMs: number;
  databaseName: string;
  collectionsCount: number;
  detectedIssues: string[];
  integrityStatus: 'Optimal' | 'Warning' | 'Error';
}

export interface ICacheHealthDetail {
  status: 'Not Configured' | 'Connected' | 'Disconnected';
  latencyMs: number | null;
  redisConfigured: boolean;
  details: string;
}

export interface ISystemDiagnostic {
  diagnosticId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  overallStatus: 'Healthy' | 'Degraded' | 'Critical';
  serverHealth: IServerHealthDetail;
  databaseHealth: IDatabaseHealthDetail;
  cacheHealth: ICacheHealthDetail;
  recommendations: string[];
  executedBy: string;
  isReadonly: boolean;
  createdAt?: string;
}

export interface ISystemDiagnosticDocument extends ISystemDiagnostic, Document {}

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
