import { Schema, model } from 'mongoose';
import { IInterviewDocument } from './interview.types';

const InterviewerSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    name: { type: String, required: true },
    email: { type: String },
    role: { type: String },
  },
  { _id: false }
);

const InterviewSchema = new Schema<IInterviewDocument>(
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
      index: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    interviewDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    interviewers: [InterviewerSchema],
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'Managerial', 'Cultural', 'Final', 'Other'],
      default: 'Technical',
    },
    mode: {
      type: String,
      enum: ['Online', 'In-Person', 'Telephonic'],
      default: 'Online',
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
      default: 'Scheduled',
      index: true,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    result: {
      type: String,
      enum: ['Pending', 'Passed', 'Failed', 'On Hold'],
      default: 'Pending',
    },
    feedbackSubmitted: {
      type: Boolean,
      default: false,
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

InterviewSchema.index({ candidateId: 1, interviewDate: -1 });

export const InterviewModel = model<IInterviewDocument>('Interview', InterviewSchema);
