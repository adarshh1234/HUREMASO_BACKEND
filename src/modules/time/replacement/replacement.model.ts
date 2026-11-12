import { Schema, model } from 'mongoose';
import { IReplacementDocument } from './replacement.types';

const ReplacementSchema = new Schema<IReplacementDocument>(
  {
    originalEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
    },
    originalEmployeeName: {
      type: String,
      default: 'Employee',
      trim: true,
    },
    substituteEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      index: true,
    },
    substituteEmployeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    shiftDate: {
      type: String,
      required: true,
      index: true,
    },
    shiftTime: {
      type: String,
      trim: true,
    },
    shift: {
      type: String,
      default: 'Morning Shift (08:00 - 16:00)',
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    daysEarned: {
      type: Number,
      default: 1,
    },
    hoursWorked: {
      type: Number,
      default: 8,
    },
    expiryDate: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Pending Manager Sign-off', 'Approved', 'Rejected'],
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
        ret.original = ret.originalEmployeeName;
        ret.substitute = ret.substituteEmployeeName;
        ret.dept = ret.department;
        ret.date = ret.shiftDate;
        return ret;
      },
    },
  }
);

ReplacementSchema.index({ originalEmployeeId: 1, shiftDate: 1 });

export const ReplacementModel = model<IReplacementDocument>('Replacement', ReplacementSchema);
