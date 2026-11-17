import { Schema, model } from 'mongoose';
import { ICalendarEventDocument } from './calendar.types';

const AttendeeSchema = new Schema(
  {
    id: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    role: { type: String, trim: true },
    status: { type: String, enum: ['Accepted', 'Declined', 'Pending'], default: 'Pending' },
  },
  { _id: false }
);

const CalendarEventSchema = new Schema<ICalendarEventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    endDate: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      default: 'All Day',
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      default: 'Meeting',
      index: true,
      trim: true,
    },
    location: {
      type: String,
      default: 'Main Office',
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    agenda: {
      type: String,
      trim: true,
    },
    attendees: {
      type: Number,
      default: 1,
    },
    attendeeList: [AttendeeSchema],
    organizer: {
      type: String,
      default: 'HR Department',
      trim: true,
    },
    organizerId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    assigneeName: {
      type: String,
      trim: true,
    },
    assigneeId: {
      type: String,
      trim: true,
    },
    // Category-specific: Interview
    candidateName: {
      type: String,
      trim: true,
    },
    candidateId: {
      type: String,
      trim: true,
    },
    interviewerName: {
      type: String,
      trim: true,
    },
    jobPosition: {
      type: String,
      trim: true,
    },
    roundName: {
      type: String,
      trim: true,
    },
    interviewMode: {
      type: String,
      enum: ['Online', 'In-Person', 'Telephonic'],
      default: 'Online',
    },
    // Category-specific: Holiday
    holidayType: {
      type: String,
      enum: ['Public', 'Company', 'Regional', 'Optional'],
      default: 'Public',
    },
    applicableScope: {
      type: String,
      default: 'Company Wide',
      trim: true,
    },
    repeatsAnnually: {
      type: Boolean,
      default: false,
    },
    // Category-specific: Deadline
    dueTime: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['calendar', 'recruitment', 'leave', 'tasks'],
      default: 'calendar',
    },
    externalId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

CalendarEventSchema.index({ date: 1, type: 1 });
CalendarEventSchema.index({ createdAt: -1 });

export const CalendarEventModel = model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema);
