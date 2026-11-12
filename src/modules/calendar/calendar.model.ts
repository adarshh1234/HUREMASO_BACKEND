import { Schema, model } from 'mongoose';
import { ICalendarEventDocument } from './calendar.types';

const CalendarEventSchema = new Schema<ICalendarEventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: String,
      default: 'All Day',
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
    attendees: {
      type: Number,
      default: 1,
    },
    description: {
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
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
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

export const CalendarEventModel = model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema);
