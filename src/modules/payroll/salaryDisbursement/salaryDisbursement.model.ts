import mongoose, { Schema, model } from 'mongoose';
import { ISalaryDisbursementDocument } from '../payroll.types';

const salaryDisbursementSchema = new Schema<ISalaryDisbursementDocument>(
  {
    disbursementId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true, index: true },
    employeeId: { type: String, index: true },
    department: { type: String, required: true, default: 'Operations' },
    period: { type: String, required: true, index: true },
    grossAmount: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['Bank Transfer', 'Cash', 'Cheque', 'Stripe', 'PayPal'],
      default: 'Bank Transfer',
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Approved', 'Processing', 'Paid', 'Failed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    disbursedAt: { type: String },
    transactionRef: { type: String },
    remarks: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: String },
  },
  { timestamps: true }
);

salaryDisbursementSchema.index({ period: 1, department: 1, status: 1 });

export const SalaryDisbursementModel =
  (mongoose.models.SalaryDisbursement as mongoose.Model<ISalaryDisbursementDocument>) ||
  model<ISalaryDisbursementDocument>('SalaryDisbursement', salaryDisbursementSchema);
