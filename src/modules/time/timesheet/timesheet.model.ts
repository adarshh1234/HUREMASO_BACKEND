import { Schema, model } from 'mongoose';
import { ITimesheetDocument } from './timesheet.types';

const TimesheetRowSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'ProjectRecord' },
    projectName: { type: String, required: true, trim: true },
    activity: { type: String, required: true, trim: true },
    monHours: { type: Number, default: 0 },
    tueHours: { type: Number, default: 0 },
    wedHours: { type: Number, default: 0 },
    thuHours: { type: Number, default: 0 },
    friHours: { type: Number, default: 0 },
    satHours: { type: Number, default: 0 },
    sunHours: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
  },
  { _id: false }
);

const TimesheetActionSchema = new Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    comment: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TimesheetSchema = new Schema<ITimesheetDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
    },
    employeeName: {
      type: String,
      trim: true,
    },
    periodStartDate: {
      type: String,
      required: true,
      index: true,
    },
    periodEndDate: {
      type: String,
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      index: true,
    },
    rows: [TimesheetRowSchema],
    totalPeriodHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    actions: [TimesheetActionSchema],
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

TimesheetSchema.index({ employeeId: 1, period: 1 });

export const TimesheetModel = model<ITimesheetDocument>('Timesheet', TimesheetSchema);
