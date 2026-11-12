import { Schema, model } from 'mongoose';
import { IBenefitAdvanceDocument } from '../payroll.types';

const benefitAdvanceSchema = new Schema<IBenefitAdvanceDocument>(
  {
    advanceId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true, index: true },
    employeeId: { type: String, index: true },
    benefitType: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['employee-benefits', 'performance-benefits', 'other-benefits', 'benefit-advance'],
      default: 'benefit-advance',
      index: true,
    },
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

benefitAdvanceSchema.index({ category: 1, status: 1 });

export const BenefitAdvanceModel = model<IBenefitAdvanceDocument>('BenefitAdvance', benefitAdvanceSchema);
