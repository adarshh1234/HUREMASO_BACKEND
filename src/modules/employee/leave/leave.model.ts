import mongoose, { Schema } from 'mongoose';
import {
  ILeaveTypeConfig,
  ILeavePeriodConfig,
  IWorkWeekConfig,
  IHoliday,
  ILeaveEntitlement,
  ILeaveRequest,
} from './leave.types';

const LeaveTypeSchema = new Schema<ILeaveTypeConfig>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    daysPerYear: { type: Number, default: 20 },
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

const LeavePeriodSchema = new Schema<ILeavePeriodConfig>(
  {
    startMonth: { type: String, default: 'January' },
    startDate: { type: String, default: '01' },
    endDate: { type: String, default: '31' },
    currentPeriod: { type: String, default: '2026-01-01 - 2026-12-31' },
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

const WorkWeekSchema = new Schema<IWorkWeekConfig>(
  {
    monday: { type: String, default: 'Full Day' },
    tuesday: { type: String, default: 'Full Day' },
    wednesday: { type: String, default: 'Full Day' },
    thursday: { type: String, default: 'Full Day' },
    friday: { type: String, default: 'Full Day' },
    saturday: { type: String, default: 'Non-working Day' },
    sunday: { type: String, default: 'Non-working Day' },
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

const HolidaySchema = new Schema<IHoliday>(
  {
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    dayType: { type: String, enum: ['Full Day', 'Half Day'], default: 'Full Day' },
    repeatsAnnually: { type: Boolean, default: false },
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

const LeaveEntitlementSchema = new Schema<ILeaveEntitlement>(
  {
    employeeId: { type: String, trim: true, index: true },
    employeeRef: { type: Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: { type: String, trim: true, default: '' },
    leaveType: { type: String, required: true, trim: true, index: true },
    entitlementType: { type: String, default: 'Added' },
    validFrom: { type: String, required: true, index: true },
    validTo: { type: String, required: true },
    days: { type: Number, required: true, min: 0 },
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

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: String, trim: true, index: true },
    employeeRef: { type: Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: { type: String, required: true, trim: true, index: true },
    department: { type: String, default: '', trim: true },
    leaveType: { type: String, required: true, trim: true, index: true },
    fromDate: { type: String, required: true, index: true },
    toDate: { type: String, required: true, index: true },
    numberOfDays: { type: Number, required: true, min: 0.5 },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    comments: { type: String, default: '', trim: true },
    dateRequested: { type: String, default: () => new Date().toISOString().split('T')[0] },
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

export const LeaveTypeModel = mongoose.model<ILeaveTypeConfig>('LeaveType', LeaveTypeSchema);
export const LeavePeriodConfigModel = mongoose.model<ILeavePeriodConfig>('LeavePeriodConfig', LeavePeriodSchema);
export const WorkWeekConfigModel = mongoose.model<IWorkWeekConfig>('WorkWeekConfig', WorkWeekSchema);
export const HolidayModel = mongoose.model<IHoliday>('Holiday', HolidaySchema);
export const LeaveEntitlementModel = mongoose.model<ILeaveEntitlement>('LeaveEntitlement', LeaveEntitlementSchema);
export const LeaveRequestModel = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
