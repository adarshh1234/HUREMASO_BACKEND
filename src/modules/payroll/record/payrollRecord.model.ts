import mongoose, { Schema, model } from 'mongoose';
import { IPayrollRecordDocument } from '../payroll.types';

const payrollRecordSchema = new Schema<IPayrollRecordDocument>(
  {
    employeeName: { type: String, required: true, trim: true, index: true },
    employeeId: { type: String, trim: true, index: true },
    department: { type: String, required: true, default: 'Marketing', trim: true },
    designation: { type: String, default: 'Software Engineer', trim: true },
    date: { type: String, required: true, default: 'July 20, 2025' },
    period: { type: String, default: 'July 2025', index: true },
    basicSalary: { type: Number, default: 2200 },
    allowances: { type: Number, default: 450 },
    bonuses: { type: Number, default: 200 },
    incentives: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 2850 },
    taxDeductions: { type: Number, default: 285 },
    epfDeduction: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    advanceDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 65 },
    totalDeductions: { type: Number, default: 350 },
    netSalary: { type: Number, default: 2500 },
    amount: { type: Number, required: true, default: 2500, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Processing', 'Failed'],
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
    slipsGenerated: { type: Boolean, default: false },
    slipUrl: { type: String },
    slipPublishedDate: { type: String },
    advanceDetails: {
      totalAdvanceAmount: { type: Number },
      installmentAmount: { type: Number },
      remainingBalance: { type: Number },
      repaymentSchedule: { type: String },
      installmentsRemaining: { type: Number },
    },
    payOnRequestDetails: {
      requestedAmount: { type: Number },
      reason: { type: String },
      description: { type: String },
      supportingDoc: { type: String },
      approvedBy: { type: String },
      approvalRemarks: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

payrollRecordSchema.index({ category: 1, status: 1 });
payrollRecordSchema.index({ period: 1, department: 1 });

export const PayrollRecordModel =
  (mongoose.models.PayrollRecord as mongoose.Model<IPayrollRecordDocument>) ||
  model<IPayrollRecordDocument>('PayrollRecord', payrollRecordSchema);
