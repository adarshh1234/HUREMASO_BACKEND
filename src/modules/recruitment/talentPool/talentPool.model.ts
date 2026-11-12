import { Schema, model } from 'mongoose';
import { ITalentPoolDocument } from './talentPool.types';

const PoolCandidateSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);

const TalentPoolSchema = new Schema<ITalentPoolDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    candidates: [PoolCandidateSchema],
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
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

TalentPoolSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const TalentPoolModel = model<ITalentPoolDocument>('TalentPool', TalentPoolSchema);
