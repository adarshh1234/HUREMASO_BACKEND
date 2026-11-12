import { Schema, model } from 'mongoose';
import { IOvertimeDocument } from './overtime.types';

const OvertimeSchema = new Schema<IOvertimeDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    hours: {
      type: Number,
      required: true,
      default: 0,
    },
    hoursText: {
      type: String,
    },
    multiplier: {
      type: String,
      default: '1.5x (Weekday OT)',
    },
    multiplierRate: {
      type: Number,
      default: 1.5,
    },
    hourlyRate: {
      type: Number,
      default: 30,
    },
    amount: {
      type: Number,
      default: 0,
    },
    amountText: {
      type: String,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Pending Approval', 'Approved', 'Rejected'],
      default: 'Approved',
      index: true,
    },
    approverName: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    comments: {
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
        ret.name = ret.employeeName;
        ret.dept = ret.department;
        return ret;
      },
    },
  }
);

OvertimeSchema.index({ employeeId: 1, date: -1 });

export const OvertimeModel = model<IOvertimeDocument>('Overtime', OvertimeSchema);
