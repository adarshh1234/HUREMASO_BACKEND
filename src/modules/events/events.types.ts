import { Document, Types } from 'mongoose';

export type EventStatus = 'Draft' | 'Planing' | 'In Progress' | 'Up coming' | 'Completed' | 'Cancelled';
export type LocationType = 'in-person' | 'online';

export interface IEventTask {
  id?: string;
  name: string;
  due: string;
  assignee: string;
  status: 'In Progress' | 'Pending' | 'Not Started' | 'Completed';
  progress?: number;
}

export interface IEventBudgetInfo {
  allocated: number;
  spent: number;
  status: 'Approved' | 'Pending Review' | 'Over Budget';
}

export interface ICompanyEvent {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  eventType: string;
  category?: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  timezone?: string;
  venue?: string;
  locationType: LocationType;
  onlineUrl?: string;
  department: string;
  organizer?: string;
  organizerId?: string;
  attendees?: string[];
  attendeeCount?: number;
  status: EventStatus;
  progress?: string;
  tasks?: IEventTask[];
  budget?: IEventBudgetInfo;
  sendReminder?: boolean;
  syncCalendar?: boolean;
  emailNotifications?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICompanyEventDocument = Document & ICompanyEvent;

export interface ISupportEvent {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  description: string;
  author: string;
  timeAgo?: string;
  replaysCount: number;
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  replies?: Array<{ author: string; text: string; date: string }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ISupportEventDocument = Document & ISupportEvent;

export interface IEventsNewsletter {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  category: string;
  publishDate: string;
  author: string;
  reads: number;
  likes: number;
  status: 'Published' | 'Draft' | 'Scheduled';
  summary: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IEventsNewsletterDocument = Document & IEventsNewsletter;

export interface IEventsBudgetItem {
  _id?: string | Types.ObjectId;
  id?: string;
  eventName: string;
  eventId?: string;
  category: string;
  allocated: number;
  spent: number;
  status: 'Approved' | 'Pending Review' | 'Over Budget';
  owner: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IEventsBudgetItemDocument = Document & IEventsBudgetItem;

export interface EventQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  eventType?: string;
  department?: string;
  month?: string;
  year?: string;
}

export interface EventsSummaryStats {
  totalEvents: number;
  inProgressCount: number;
  upcomingCount: number;
  completedCount: number;
  totalBudgetPool: number;
  totalBudgetSpent: number;
  budgetVariance: number;
  totalNewsletters: number;
  totalSupportTickets: number;
}
