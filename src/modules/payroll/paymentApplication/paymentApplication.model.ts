import mongoose, { Schema, model } from 'mongoose';
import { IPaymentApplicationDocument } from '../payroll.types';

const paymentApplicationSchema = new Schema<IPaymentApplicationDocument>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    environment: { type: String, enum: ['Sandbox', 'Production'], default: 'Sandbox' },
    apiKeyMasked: { type: String },
    webhookUrl: { type: String },
    webhookSecretMasked: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive', 'Error'],
      default: 'Active',
      index: true,
    },
    autoDisburse: { type: Boolean, default: false },
    disbursementDay: { type: Number, min: 1, max: 31, default: 25 },
    lastSync: { type: String },
    lastSyncStatus: { type: String, enum: ['Success', 'Error', 'Pending'], default: 'Pending' },
    lastError: { type: String },
    testedAt: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PaymentApplicationModel =
  (mongoose.models.PaymentApplication as mongoose.Model<IPaymentApplicationDocument>) ||
  model<IPaymentApplicationDocument>('PaymentApplication', paymentApplicationSchema);
