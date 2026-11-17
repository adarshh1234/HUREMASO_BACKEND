import mongoose, { Schema } from 'mongoose';
import { IAppraisalCycleDocument } from './appraisalCycle.types';

const AppraisalCycleSchema = new Schema<IAppraisalCycleDocument>(
  {
    cycleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    financialYear: { type: String, default: '2026-2027', trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    submissionDeadline: { type: String, required: true },
    reviewDeadline: { type: String, required: true },
    eligibleDepartments: { type: [String], default: [] },
    eligibleEmployeeIds: { type: [String], default: [] },
    frequency: {
      type: String,
      enum: ['Quarterly', 'Bi-Annual', 'Annual'],
      default: 'Quarterly',
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Active', 'Under Review', 'Calibration', 'Completed', 'Archived'],
      default: 'Active',
      index: true,
    },
    description: { type: String, default: '' },
    createdBy: { type: String, default: 'System Admin' },
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

export const AppraisalCycleModel = mongoose.model<IAppraisalCycleDocument>(
  'AppraisalCycle',
  AppraisalCycleSchema
);
