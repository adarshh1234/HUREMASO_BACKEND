import mongoose, { Schema } from 'mongoose';
import { IPerformanceReview, IPerformanceTracker } from './performance.types';

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
  {
    employeeName: { type: String, required: true, trim: true, index: true },
    employeeId: { type: String, trim: true, index: true },
    employeeRef: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
    jobTitle: { type: String, required: true, trim: true, index: true },
    reviewPeriod: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    reviewer: { type: String, required: true, trim: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    reviewStatus: {
      type: String,
      enum: ['Approved', 'Pending', 'Reviewing'],
      default: 'Pending',
      index: true,
    },
    score: { type: Number, default: 4.5 },
    ratings: [
      {
        competency: { type: String, required: true },
        score: { type: Number, required: true },
        status: { type: String, default: 'Meets Expectation' },
        _id: false,
      },
    ],
    feedback: { type: String, default: '', trim: true },
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

const PerformanceTrackerSchema = new Schema<IPerformanceTracker>(
  {
    trackerName: { type: String, required: true, trim: true },
    employeeName: { type: String, required: true, trim: true, index: true },
    employeeId: { type: String, trim: true, index: true },
    addedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    modifiedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    logs: { type: [String], default: [] },
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

export const PerformanceReviewModel = mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);
export const PerformanceTrackerModel = mongoose.model<IPerformanceTracker>('PerformanceTracker', PerformanceTrackerSchema);
