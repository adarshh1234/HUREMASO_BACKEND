import { Schema, model } from 'mongoose';
import { IFeedbackDocument } from './interview.types';

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    interviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    interviewerEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    technicalRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    culturalFitRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    strengths: {
      type: String,
    },
    areasOfImprovement: {
      type: String,
    },
    recommendation: {
      type: String,
      enum: ['Strong Hire', 'Hire', 'Hold', 'Reject'],
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
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

FeedbackSchema.index({ interviewId: 1, interviewerName: 1 });

export const FeedbackModel = model<IFeedbackDocument>('Feedback', FeedbackSchema);
