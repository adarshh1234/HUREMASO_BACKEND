import { Schema, model } from 'mongoose';
import { IAttendanceDocument } from './attendance.types';

const PunchRecordSchema = new Schema(
  {
    punchInTime: { type: Date, required: true },
    punchInNote: { type: String, trim: true },
    punchOutTime: { type: Date },
    punchOutNote: { type: String, trim: true },
    durationMinutes: { type: Number, default: 0 },
    durationHours: { type: String, default: '00.00' },
  },
  { _id: true }
);

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    punches: [PunchRecordSchema],
    totalWorkingMinutes: {
      type: Number,
      default: 0,
    },
    totalWorkingHours: {
      type: String,
      default: '00.00',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-Day', 'Absent', 'On Leave'],
      default: 'Present',
      index: true,
    },
    remarks: {
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

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, status: 1 });

export const AttendanceModel = model<IAttendanceDocument>('Attendance', AttendanceSchema);

const AttendanceConfigSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    recordWorkingTime: { type: Boolean, default: true },
    canEditRecords: { type: Boolean, default: true },
    supervisorCanEdit: { type: Boolean, default: true },
    standardHours: { type: Number, default: 8 },
    breakDuration: { type: Number, default: 60 },
    gracePeriodMinutes: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export const AttendanceConfigModel = model('AttendanceConfig', AttendanceConfigSchema);
