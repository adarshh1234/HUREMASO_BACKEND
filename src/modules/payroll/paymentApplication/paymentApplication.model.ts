import { Schema, model } from 'mongoose';
import { IPaymentApplicationDocument } from '../payroll.types';

const paymentApplicationSchema = new Schema<IPaymentApplicationDocument>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    apiKeyMasked: { type: String },
    webhookUrl: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive', 'Error'],
      default: 'Active',
      index: true,
    },
    autoDisburse: { type: Boolean, default: false },
    disbursementDay: { type: Number, min: 1, max: 31, default: 25 },
    lastSync: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PaymentApplicationModel = model<IPaymentApplicationDocument>('PaymentApplication', paymentApplicationSchema);
