import { Types, Document } from 'mongoose';

export type CalendarEventType = 'Meeting' | 'Interview' | 'Deadline' | 'Holiday' | 'HR Admin' | string;

export interface ICalendarEvent {
  _id?: string | Types.ObjectId;
  title: string;
  date: string; // e.g. "2026-09-15" or "Sept 04, 2026"
  time?: string; // e.g. "10:00 AM - 11:30 AM" or "All Day"
  type: CalendarEventType;
  location?: string;
  attendees?: number;
  description?: string;
  employeeId?: Types.ObjectId | any;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICalendarEventDocument = Document & ICalendarEvent;

export interface CreateCalendarEventDTO {
  title: string;
  date: string;
  time?: string;
  type?: CalendarEventType;
  location?: string;
  attendees?: number;
  description?: string;
  employeeId?: string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface CalendarEventQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  type?: string;
  date?: string;
  month?: string;
  employeeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
