import mongoose, { Schema, model } from 'mongoose';
import {
  IMaintenanceTicketDocument,
  IHuremasoMaintenanceLogDocument,
  IHuremasoSystemHealthDocument,
  ISystemDiagnosticDocument,
} from './maintenance.types';

// ================= 1. SUB-SCHEMAS =================
const TicketCommentSchema = new Schema(
  {
    id: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    authorEmail: { type: String, trim: true },
    role: { type: String, default: 'Requester' },
    text: { type: String, required: true, trim: true },
    timestamp: { type: String, default: () => new Date().toLocaleString() },
    isStaff: { type: Boolean, default: false },
  },
  { _id: false }
);

const TicketHistoryEntrySchema = new Schema(
  {
    id: { type: String, required: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const MaintenanceExecutionEntrySchema = new Schema(
  {
    id: { type: String, required: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

// ================= 2. ACTIVE SUPPORT TICKET SCHEMA =================
const MaintenanceTicketSchema = new Schema<IMaintenanceTicketDocument>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent', 'Critical'],
      default: 'High',
      index: true,
    },
    category: {
      type: String,
      enum: ['System Error', 'Access Issue', 'Hardware', 'Software', 'Network', 'Database', 'Other'],
      default: 'System Error',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'On Hold', 'Pending', 'Resolved', 'Closed', 'Reopened'],
      default: 'Open',
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
      default: 'Employee',
      trim: true,
      index: true,
    },
    requesterEmail: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    assignedAgent: {
      type: String,
      default: 'Unassigned',
      trim: true,
      index: true,
    },
    assignedAgentId: {
      type: String,
    },
    createdDate: {
      type: String,
      default: () => new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' - 6.30 Pm',
    },
    resolvedDate: {
      type: String,
    },
    closedDate: {
      type: String,
    },
    resolutionDetails: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    comments: {
      type: [TicketCommentSchema],
      default: [],
    },
    history: {
      type: [TicketHistoryEntrySchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

MaintenanceTicketSchema.index({ status: 1, priority: 1 });
MaintenanceTicketSchema.index({ category: 1, createdAt: -1 });

export const MaintenanceTicketModel = model<IMaintenanceTicketDocument>(
  'MaintenanceTicket',
  MaintenanceTicketSchema
);

// ================= 3. HUREMASO MAINTENANCE LOG SCHEMA =================
const HuremasoMaintenanceLogSchema = new Schema<IHuremasoMaintenanceLogDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Infrastructure',
      trim: true,
    },
    scheduledDate: {
      type: String,
      required: true,
      index: true,
    },
    scheduledTime: {
      type: String,
      default: '02:00 AM',
    },
    duration: {
      type: String,
      required: true,
      default: '15 mins',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    affectedServices: {
      type: [String],
      default: ['Huremaso Core API', 'Database Cluster'],
    },
    performedBy: {
      type: String,
      default: 'Huremaso Infrastructure Team',
    },
    responsibleAdmin: {
      type: String,
      default: 'Infrastructure Lead',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    executionHistory: {
      type: [MaintenanceExecutionEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

export const HuremasoMaintenanceLogModel = model<IHuremasoMaintenanceLogDocument>(
  'HuremasoMaintenanceLog',
  HuremasoMaintenanceLogSchema
);

// ================= 4. HUREMASO SYSTEM HEALTH SCHEMA =================
const HuremasoSystemHealthSchema = new Schema<IHuremasoSystemHealthDocument>(
  {
    systemName: {
      type: String,
      required: true,
      default: 'Huremaso Cloud Infrastructure',
      unique: true,
    },
    status: {
      type: String,
      enum: ['Operational', 'Degraded', 'Under Maintenance'],
      default: 'Operational',
    },
    uptimePercentage: {
      type: Number,
      default: 99.98,
    },
    uptimeSeconds: {
      type: Number,
      default: 0,
    },
    uptimeFormatted: {
      type: String,
      default: '0h 0m',
    },
    activeNodesCount: {
      type: Number,
      default: 1,
    },
    totalNodesCount: {
      type: Number,
      default: 1,
    },
    databaseStatus: {
      type: String,
      default: 'Connected',
    },
    databaseLatencyMs: {
      type: Number,
      default: 1,
    },
    fragmentationCount: {
      type: Number,
      default: 0,
    },
    cacheLatencyMs: {
      type: Number,
      default: null,
    },
    redisStatus: {
      type: String,
      default: 'Not Configured',
    },
    redisConfigured: {
      type: Boolean,
      default: false,
    },
    lastDiagnosticRun: {
      type: String,
      default: () => new Date().toISOString(),
    },
    diagnosticsSummary: {
      type: String,
      default: 'Diagnostics completed. All Huremaso services optimal.',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

export const HuremasoSystemHealthModel = model<IHuremasoSystemHealthDocument>(
  'HuremasoSystemHealth',
  HuremasoSystemHealthSchema
);

// ================= 5. SYSTEM DIAGNOSTIC SCHEMA =================
const SystemDiagnosticSchema = new Schema<ISystemDiagnosticDocument>(
  {
    diagnosticId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startedAt: {
      type: String,
      required: true,
    },
    completedAt: {
      type: String,
      required: true,
    },
    durationMs: {
      type: Number,
      required: true,
    },
    overallStatus: {
      type: String,
      enum: ['Healthy', 'Degraded', 'Critical'],
      default: 'Healthy',
      index: true,
    },
    serverHealth: {
      status: { type: String, default: 'Healthy' },
      uptimeSeconds: { type: Number, default: 0 },
      uptimeFormatted: { type: String, default: '0s' },
      memoryUsageMb: { type: Number, default: 0 },
      totalMemoryMb: { type: Number, default: 0 },
      nodeVersion: { type: String, default: '' },
      activeNodes: { type: Number, default: 1 },
      platform: { type: String, default: '' },
      responseTimeMs: { type: Number, default: 0 },
    },
    databaseHealth: {
      status: { type: String, default: 'Connected' },
      connectionState: { type: String, default: 'Connected' },
      pingLatencyMs: { type: Number, default: 0 },
      databaseName: { type: String, default: '' },
      collectionsCount: { type: Number, default: 0 },
      detectedIssues: { type: [String], default: [] },
      integrityStatus: { type: String, default: 'Optimal' },
    },
    cacheHealth: {
      status: { type: String, default: 'Not Configured' },
      latencyMs: { type: Number, default: null },
      redisConfigured: { type: Boolean, default: false },
      details: { type: String, default: 'No Redis cache cluster configured for this deployment.' },
    },
    recommendations: {
      type: [String],
      default: [],
    },
    executedBy: {
      type: String,
      default: 'System Administrator',
    },
    isReadonly: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

export const SystemDiagnosticModel = model<ISystemDiagnosticDocument>(
  'SystemDiagnostic',
  SystemDiagnosticSchema
);
