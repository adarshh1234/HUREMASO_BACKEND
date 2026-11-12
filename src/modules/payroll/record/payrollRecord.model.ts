import { Schema, model } from 'mongoose';
import { IPayrollRecordDocument } from '../payroll.types';

const payrollRecordSchema = new Schema<IPayrollRecordDocument>(
  {
    employeeName: { type: String, required: true, trim: true, index: true },
    employeeId: { type: String, trim: true, index: true },
    department: { type: String, required: true, default: 'Marketing', trim: true },
    date: { type: String, required: true, default: 'July 20, 2025' },
    period: { type: String, default: 'July 2025' },
    amount: { type: Number, required: true, default: 2500, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
      index: true,
    },
    category: {
      type: String,
      enum: ['statement', 'upcoming', 'slips', 'pay-on-request', 'advance-payments'],
      default: 'statement',
      index: true,
    },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    paidAt: { type: String },
    transactionRef: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

payrollRecordSchema.index({ category: 1, status: 1 });

export const PayrollRecordModel = model<IPayrollRecordDocument>('PayrollRecord', payrollRecordSchema);
