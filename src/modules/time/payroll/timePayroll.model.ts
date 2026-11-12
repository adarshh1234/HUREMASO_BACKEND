import { Schema, model } from 'mongoose';
import { ITimePayrollDocument } from './timePayroll.types';

const timePayrollSchema = new Schema<ITimePayrollDocument>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: false, index: true },
    name: { type: String, required: true, index: true },
    dept: { type: String, required: true, default: 'Operations' },
    month: { type: String, default: () => new Date().toISOString().slice(0, 7) }, // YYYY-MM
    year: { type: Number, default: () => new Date().getFullYear() },
    daysPresent: { type: Number, required: true, default: 0 },
    paidLeave: { type: Number, default: 0 },
    shiftAllowance: { type: String, default: '$0' },
    shiftAllowanceAmount: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    lopDeductions: { type: Number, default: 0 },
    netAdjustment: { type: String, default: '+$0' },
    netAdjustmentAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Processed', 'Pending Sync', 'Draft'],
      default: 'Processed',
      index: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

timePayrollSchema.index({ month: 1, employeeId: 1 });

export const TimePayrollModel = model<ITimePayrollDocument>('TimePayroll', timePayrollSchema);
