import { Schema, model } from 'mongoose';
import { ILeaveSalaryDocument } from './leaveSalary.types';

const LeaveSalarySchema = new Schema<ILeaveSalaryDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
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
    leaveType: {
      type: String,
      default: 'Earned Leave (EL)',
      trim: true,
    },
    availableBalance: {
      type: Number,
      default: 24,
    },
    availableBalanceText: {
      type: String,
    },
    daysEncashing: {
      type: Number,
      required: true,
      default: 0,
    },
    daysEncashingText: {
      type: String,
    },
    dailyRate: {
      type: Number,
      default: 180,
    },
    dailyRateText: {
      type: String,
    },
    totalValuation: {
      type: Number,
      default: 0,
    },
    totalValuationText: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved for Payroll', 'Disbursed', 'Rejected'],
      default: 'Approved for Payroll',
      index: true,
    },
    disbursedDate: {
      type: Date,
    },
    reason: {
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

LeaveSalarySchema.index({ employeeId: 1, createdAt: -1 });

export const LeaveSalaryModel = model<ILeaveSalaryDocument>('LeaveSalary', LeaveSalarySchema);
