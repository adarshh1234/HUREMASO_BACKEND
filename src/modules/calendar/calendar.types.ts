import { Types, Document } from 'mongoose';

export type CalendarEventType = 'Meeting' | 'Interview' | 'Deadline' | 'Holiday' | 'General' | 'HR Admin';
export type CalendarEventStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type EventPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ICalendarAttendee {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  status?: 'Accepted' | 'Declined' | 'Pending';
}

export interface ICalendarEvent {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  description?: string;
  date: string; // ISO "YYYY-MM-DD" or standard date string
  endDate?: string;
  time?: string; // e.g. "10:00 AM - 11:30 AM" or "All Day"
  startTime?: string; // e.g. "10:00 AM" or "10:00"
  endTime?: string; // e.g. "11:30 AM" or "11:30"
  type: CalendarEventType;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
  agenda?: string;
  attendees?: number;
  attendeeList?: ICalendarAttendee[];
  organizer?: string;
  organizerId?: string;
  employeeId?: Types.ObjectId | any;
  status?: CalendarEventStatus;
  priority?: EventPriority;
  department?: string;
  assigneeName?: string;
  assigneeId?: string;
  // Category-specific: Interview
  candidateName?: string;
  candidateId?: string;
  interviewerName?: string;
  jobPosition?: string;
  roundName?: string;
  interviewMode?: 'Online' | 'In-Person' | 'Telephonic';
  // Category-specific: Holiday
  holidayType?: 'Public' | 'Company' | 'Regional' | 'Optional';
  applicableScope?: string;
  repeatsAnnually?: boolean;
  // Category-specific: Deadline
  dueTime?: string;
  completedAt?: Date;
  isOverdue?: boolean;
  notes?: string;
  reminder?: boolean;
  source?: 'calendar' | 'recruitment' | 'leave' | 'tasks';
  externalId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICalendarEventDocument = Document & ICalendarEvent;

export interface CreateCalendarEventDTO {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  type?: CalendarEventType;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
  agenda?: string;
  attendees?: number;
  attendeeList?: ICalendarAttendee[];
  organizer?: string;
  organizerId?: string;
  employeeId?: string;
  status?: CalendarEventStatus;
  priority?: EventPriority;
  department?: string;
  assigneeName?: string;
  assigneeId?: string;
  candidateName?: string;
  candidateId?: string;
  interviewerName?: string;
  jobPosition?: string;
  roundName?: string;
  interviewMode?: 'Online' | 'In-Person' | 'Telephonic';
  holidayType?: 'Public' | 'Company' | 'Regional' | 'Optional';
  applicableScope?: string;
  repeatsAnnually?: boolean;
  dueTime?: string;
  notes?: string;
  reminder?: boolean;
}

export interface UpdateCalendarEventDTO extends Partial<CreateCalendarEventDTO> {
  completedAt?: Date;
}

export interface RescheduleEventDTO {
  date: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  notes?: string;
}

export interface CalendarEventQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  type?: string;
  date?: string;
  month?: string;
  year?: string | number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  department?: string;
  priority?: string;
  employeeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
