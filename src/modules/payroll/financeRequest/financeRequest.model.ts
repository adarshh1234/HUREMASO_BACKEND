import mongoose, { Schema, model } from 'mongoose';
import { IFinanceRequestDocument } from '../payroll.types';

const financeRequestSchema = new Schema<IFinanceRequestDocument>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true, index: true },
    employeeId: { type: String, index: true },
    requestType: { type: String, required: true, index: true },
    department: { type: String, required: true, default: 'Operations' },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String },
    supportingDoc: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Processing', 'Completed'],
      default: 'Pending',
      index: true,
    },
    dateRequested: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    approvalRemarks: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: String },
    history: [
      {
        status: { type: String, required: true },
        changedBy: { type: String, required: true },
        timestamp: { type: String, required: true },
        remarks: { type: String },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

financeRequestSchema.index({ status: 1, department: 1, requestType: 1 });

export const FinanceRequestModel =
  (mongoose.models.FinanceRequest as mongoose.Model<IFinanceRequestDocument>) ||
  model<IFinanceRequestDocument>('FinanceRequest', financeRequestSchema);
