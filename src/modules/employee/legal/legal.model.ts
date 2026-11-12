import mongoose, { Schema } from 'mongoose';
import { ILegalCompliance } from './legal.types';

const LegalComplianceSchema = new Schema<ILegalCompliance>(
  {
    complianceScore: { type: Number, default: 98.4 },
    activeViolations: { type: Number, default: 0 },
    pendingPolicies: { type: Number, default: 2 },
    auditNotes: { type: String, default: 'Zero active violations detected across employment agreements.' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const LegalComplianceModel = mongoose.model<ILegalCompliance>('LegalCompliance', LegalComplianceSchema);
