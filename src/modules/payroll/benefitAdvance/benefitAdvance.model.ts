import mongoose, { Schema, model } from 'mongoose';
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
    tab: { type: String, index: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String },
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
    supportingDoc: { type: String },
    vestingSchedule: { type: String },
    grantedUnits: { type: Number },
    currentSalary: { type: Number },
    proposedSalary: { type: Number },
    incrementPercent: { type: Number },
    statutoryContributionEmployee: { type: Number },
    statutoryContributionEmployer: { type: Number },
    leaveBalanceEncashing: { type: Number },
    policyNumber: { type: String },
    insuranceProvider: { type: String },
    coverageDetails: { type: String },
    dependentsCount: { type: Number },
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

benefitAdvanceSchema.index({ category: 1, tab: 1, status: 1 });

export const BenefitAdvanceModel =
  (mongoose.models.BenefitAdvance as mongoose.Model<IBenefitAdvanceDocument>) ||
  model<IBenefitAdvanceDocument>('BenefitAdvance', benefitAdvanceSchema);
