import { Schema, model } from 'mongoose';
import { IApplicationDocument } from './application.types';

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        'Applied',
        'Screening',
        'Shortlisted',
        'Interview Scheduled',
        'Interviewed',
        'Offered',
        'Hired',
        'Rejected',
        'Withdrawn',
      ],
      required: true,
    },
    stage: { type: String },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: 'System' },
    comment: { type: String },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    vacancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Vacancy',
      required: true,
      index: true,
    },
    jobPostingId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPosting',
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Screening',
        'Shortlisted',
        'Interview Scheduled',
        'Interviewed',
        'Offered',
        'Hired',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Applied',
      index: true,
    },
    currentStage: {
      type: String,
      default: 'Initial Screening',
    },
    resumeUrl: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    statusHistory: [StatusHistorySchema],
    notes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    offerDetails: {
      offeredSalary: { type: Number },
      offeredDate: { type: Date },
      joiningDate: { type: Date },
      status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

ApplicationSchema.index({ candidateId: 1, vacancyId: 1 });
ApplicationSchema.index({ status: 1, appliedDate: -1 });

export const ApplicationModel = model<IApplicationDocument>('Application', ApplicationSchema);
