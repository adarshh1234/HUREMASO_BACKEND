import mongoose, { Schema } from 'mongoose';
import {
  ICompanyEventDocument,
  ISupportEventDocument,
  IEventsNewsletterDocument,
  IEventsBudgetItemDocument,
} from './events.types';

const EventTaskSchema = new Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    due: { type: String, required: true },
    dueDate: { type: String },
    assignee: { type: String, default: 'Sarah Jo' },
    status: {
      type: String,
      enum: ['In Progress', 'Pending', 'Not Started', 'Completed'],
      default: 'In Progress',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    progress: { type: Number, default: 0 },
  },
  { _id: false }
);

const EventBudgetInfoSchema = new Schema(
  {
    allocated: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Approved', 'Pending Review', 'Over Budget', 'Rejected'],
      default: 'Approved',
    },
  },
  { _id: false }
);

const CompanyEventSchema = new Schema<ICompanyEventDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    eventType: { type: String, required: true, default: 'Training Session', index: true },
    category: { type: String, default: 'General' },
    description: { type: String, default: '', trim: true },
    startDate: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endDate: { type: String },
    endTime: { type: String },
    timezone: { type: String, default: 'UTC+4 (Dubai)' },
    venue: { type: String, default: 'Main Conference Room' },
    locationType: {
      type: String,
      enum: ['in-person', 'online'],
      default: 'in-person',
    },
    onlineUrl: { type: String },
    department: { type: String, default: 'All Department', index: true },
    organizer: { type: String, default: 'Sarah Jo' },
    organizerId: { type: String },
    attendees: { type: [String], default: ['Sarah Jo', 'Alex Morgan', 'David Vance'] },
    attendeeCount: { type: Number, default: 15 },
    status: {
      type: String,
      enum: ['Draft', 'Planing', 'Planning', 'In Progress', 'Up coming', 'Upcoming', 'Completed', 'Cancelled'],
      default: 'Upcoming',
      index: true,
    },
    progress: { type: String, default: '0/0 Task' },
    tasks: [EventTaskSchema],
    budget: { type: EventBudgetInfoSchema, default: () => ({ allocated: 5000, spent: 0, status: 'Approved' }) },
    sendReminder: { type: Boolean, default: true },
    syncCalendar: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

const SupportEventSchema = new Schema<ISupportEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: String, default: 'Sarah Jo' },
    requesterEmail: { type: String, trim: true },
    department: { type: String, default: 'General', trim: true },
    category: { type: String, default: 'General', index: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    assignedAgent: { type: String, default: 'HR Support Specialist' },
    timeAgo: { type: String, default: 'Just now' },
    replaysCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    replies: [
      {
        id: { type: String },
        author: { type: String, required: true },
        text: { type: String, required: true },
        date: { type: String, default: () => new Date().toISOString() },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

const EventsNewsletterSchema = new Schema<IEventsNewsletterDocument>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'Company Events', index: true },
    publishDate: { type: String, default: 'Today' },
    scheduleDate: { type: String },
    author: { type: String, default: 'HR Communications Team' },
    reads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Scheduled'],
      default: 'Published',
      index: true,
    },
    summary: { type: String, required: true },
    content: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

const EventExpenseSchema = new Schema(
  {
    id: { type: String },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    amount: { type: Number, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    vendor: { type: String, default: '' },
    recordedBy: { type: String, default: 'HR Specialist' },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Pending Review', 'Rejected'],
      default: 'Approved',
    },
  },
  { _id: false }
);

const EventsBudgetSchema = new Schema<IEventsBudgetItemDocument>(
  {
    eventName: { type: String, required: true, trim: true, index: true },
    eventId: { type: String },
    category: { type: String, default: 'Venue & Catering', index: true },
    allocated: { type: Number, required: true, default: 0 },
    spent: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Approved', 'Pending Review', 'Over Budget', 'Rejected'],
      default: 'Pending Review',
      index: true,
    },
    owner: { type: String, default: 'Sarah Joseph' },
    expenses: [EventExpenseSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const CompanyEventModel = mongoose.model<ICompanyEventDocument>('CompanyEvent', CompanyEventSchema);
export const SupportEventModel = mongoose.model<ISupportEventDocument>('SupportEvent', SupportEventSchema);
export const EventsNewsletterModel = mongoose.model<IEventsNewsletterDocument>('EventsNewsletter', EventsNewsletterSchema);
export const EventsBudgetModel = mongoose.model<IEventsBudgetItemDocument>('EventsBudget', EventsBudgetSchema);
