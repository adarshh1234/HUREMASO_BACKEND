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
    employeeCode: {
      type: String,
      trim: true,
      index: true,
    },
    employeeName: {
      type: String,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: 'HUREMASO Global Technologies',
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    workType: {
      type: String,
      enum: ['office', 'access_control', 'site_work', 'field_work'],
      default: 'office',
      index: true,
    },
    officeLocation: {
      type: String,
      trim: true,
    },
    loginSource: {
      type: String,
      trim: true,
    },
    loginTime: {
      type: String,
      trim: true,
    },
    logoutTime: {
      type: String,
      trim: true,
    },
    signInMethod: {
      type: String,
      trim: true,
    },
    gpsLocation: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      trim: true,
    },
    projectLocation: {
      type: String,
      trim: true,
    },
    siteLocation: {
      type: String,
      trim: true,
    },
    siteName: { type: String, trim: true },
    supervisorName: {
      type: String,
      trim: true,
    },
    supervisorId: {
      type: String,
      trim: true,
    },
    timeIn: {
      type: String,
      trim: true,
    },
    timeOut: {
      type: String,
      trim: true,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    assignedField: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
      index: true,
    },
    location: { type: String, trim: true },
    workDetails: { type: String, trim: true },
    checkInTime: { type: String, trim: true },
    checkOutTime: { type: String, trim: true },
    deviceSource: { type: String, trim: true },
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
      enum: ['Draft', 'Submitted', 'Pending Approval', 'Approved', 'Rejected'],
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
TimesheetSchema.index({ workType: 1, date: 1 });

export const TimesheetModel = model<ITimesheetDocument>('Timesheet', TimesheetSchema);
