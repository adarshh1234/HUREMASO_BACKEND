import mongoose, { Schema, model } from 'mongoose';
import { IBenefitSchemeDocument } from '../payroll.types';

const benefitSchemeSchema = new Schema<IBenefitSchemeDocument>(
  {
    schemeId: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['employee-benefits', 'performance-benefits', 'other-benefits', 'benefit-advance'],
      required: true,
      index: true,
    },
    tab: { type: String, required: true, index: true },
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    annualLimit: { type: Number, default: 5000 },
    maxAmount: { type: Number, default: 2500 },
    eligibilityCriteria: { type: String, default: 'All full-time employees post probation' },
    applicationDeadline: { type: String, default: 'Rolling quarterly submissions' },
    formula: { type: String },
    statutoryType: {
      type: String,
      enum: ['EPF', 'Gratuity', 'ESI', 'Insurance', 'None'],
      default: 'None',
    },
    isEnabled: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const BenefitSchemeModel =
  (mongoose.models.BenefitScheme as mongoose.Model<IBenefitSchemeDocument>) ||
  model<IBenefitSchemeDocument>('BenefitScheme', benefitSchemeSchema);
