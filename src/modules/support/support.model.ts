import mongoose, { Schema, model } from 'mongoose';
import {
  ISupportTicketDocument,
  ISupportMaintenanceDocument,
  ISupportHelpArticleDocument,
  ISupportContactRequestDocument,
  IMiscellaneousRequestDocument,
} from './support.types';

// ================= 1. TICKET COMMENT SCHEMA =================
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

// ================= 2. SUPPORT TICKET SCHEMA =================
const SupportTicketSchema = new Schema<ISupportTicketDocument>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requesterEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      default: 'General',
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['IT Support', 'Hardware', 'Software', 'Access / Permissions', 'HR Support', 'Facilities', 'Other'],
      default: 'IT Support',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    assignedAgent: {
      type: String,
      default: 'Unassigned',
      trim: true,
      index: true,
    },
    resolutionDetails: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: String,
    },
    closedAt: {
      type: String,
    },
    comments: {
      type: [TicketCommentSchema],
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

SupportTicketSchema.index({ status: 1, priority: 1 });
SupportTicketSchema.index({ category: 1, department: 1 });

export const SupportTicketModel = model<ISupportTicketDocument>('SupportTicket', SupportTicketSchema);

// ================= 3. SUPPORT MAINTENANCE SCHEMA =================
const SupportMaintenanceSchema = new Schema<ISupportMaintenanceDocument>(
  {
    system: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Infrastructure', 'Database', 'Network', 'Software', 'Hardware', 'Facilities'],
      default: 'Infrastructure',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Reported', 'Scheduled', 'In Progress', 'Operational', 'Resolved', 'Cancelled'],
      default: 'Operational',
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    requestedByEmail: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      default: 'IT Operations',
    },
    scheduledStart: {
      type: String,
    },
    scheduledEnd: {
      type: String,
    },
    targetUptime: {
      type: String,
      default: '99.9%',
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

export const SupportMaintenanceModel = model<ISupportMaintenanceDocument>('SupportMaintenance', SupportMaintenanceSchema);

// ================= 4. HELP / KNOWLEDGE BASE SCHEMA =================
const SupportHelpArticleSchema = new Schema<ISupportHelpArticleDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: 'General',
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    author: {
      type: String,
      default: 'Support Team',
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

export const SupportHelpArticleModel = model<ISupportHelpArticleDocument>('SupportHelpArticle', SupportHelpArticleSchema);

// ================= 5. CONTACT INQUIRY SCHEMA =================
const SupportContactRequestSchema = new Schema<ISupportContactRequestDocument>(
  {
    requesterName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requesterEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    targetAgent: {
      type: String,
      default: 'General IT Desk',
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Replied', 'Closed'],
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    responseMessage: {
      type: String,
      default: '',
    },
    respondedBy: {
      type: String,
    },
    respondedAt: {
      type: String,
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

export const SupportContactRequestModel = model<ISupportContactRequestDocument>(
  'SupportContactRequest',
  SupportContactRequestSchema
);

// ================= 6. MISCELLANEOUS REQUEST SCHEMA =================
const MiscellaneousRequestSchema = new Schema<IMiscellaneousRequestDocument>(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    employee: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      default: 'Engineering',
      trim: true,
      index: true,
    },
    dept: {
      type: String,
      trim: true,
    },
    requestType: {
      type: String,
      required: true,
      default: 'Office Equipment',
      trim: true,
      index: true,
    },
    type: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    createdBy: {
      type: String,
      default: 'Employee',
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    comments: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString() || ret.requestId;
        if (!ret.name && ret.employee) ret.name = ret.employee;
        if (!ret.employee && ret.name) ret.employee = ret.name;
        if (!ret.dept && ret.department) ret.dept = ret.department;
        if (!ret.department && ret.dept) ret.department = ret.dept;
        if (!ret.type && ret.requestType) ret.type = ret.requestType;
        if (!ret.requestType && ret.type) ret.requestType = ret.type;
        return ret;
      },
    },
  }
);

MiscellaneousRequestSchema.pre('save', function (next) {
  if (!this.name && this.employee) this.name = this.employee;
  if (!this.employee && this.name) this.employee = this.name;
  if (!this.dept && this.department) this.dept = this.department;
  if (!this.department && this.dept) this.department = this.dept;
  if (!this.type && this.requestType) this.type = this.requestType;
  if (!this.requestType && this.type) this.requestType = this.type;
  if (!this.date) this.date = new Date().toISOString().split('T')[0];
  next();
});

MiscellaneousRequestSchema.index({ status: 1, priority: 1, department: 1, requestType: 1 });

export const MiscellaneousRequestModel = model<IMiscellaneousRequestDocument>(
  'MiscellaneousRequest',
  MiscellaneousRequestSchema
);
