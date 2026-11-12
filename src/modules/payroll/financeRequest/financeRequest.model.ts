import { Schema, model } from 'mongoose';
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
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    dateRequested: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    notes: { type: String },
  },
  { timestamps: true }
);

financeRequestSchema.index({ status: 1, department: 1 });

export const FinanceRequestModel = model<IFinanceRequestDocument>('FinanceRequest', financeRequestSchema);
