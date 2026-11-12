import mongoose, { Schema, model } from 'mongoose';
import {
  IMaintenanceTicketDocument,
  IHuremasoMaintenanceLogDocument,
  IHuremasoSystemHealthDocument,
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
      enum: ['Low', 'Medium', 'High', 'Urgent'],
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
      enum: ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'],
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
    scheduledDate: {
      type: String,
      required: true,
      index: true,
    },
    duration: {
      type: String,
      required: true,
      default: '15 mins',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Completed',
      index: true,
    },
    affectedServices: {
      type: [String],
      default: ['Huremaso Core API', 'Database Cluster'],
    },
    performedBy: {
      type: String,
      default: 'Huremaso Infrastructure Team',
    },
    resolutionNotes: {
      type: String,
      default: '',
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
    activeNodesCount: {
      type: Number,
      default: 8,
    },
    totalNodesCount: {
      type: Number,
      default: 8,
    },
    databaseStatus: {
      type: String,
      default: 'Optimized',
    },
    fragmentationCount: {
      type: Number,
      default: 0,
    },
    cacheLatencyMs: {
      type: Number,
      default: 12,
    },
    redisStatus: {
      type: String,
      default: 'Redis cluster fully synchronized',
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
