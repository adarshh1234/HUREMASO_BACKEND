import { Schema, model } from 'mongoose';
import { INoteDocument } from './notes.types';

const ChecklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const NoteSchema = new Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      default: 'HR Policy',
      index: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      default: () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        return `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;
      },
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    aiSummary: {
      type: String,
    },
    checklistItems: {
      type: [ChecklistItemSchema],
      default: [],
    },

    // Interview Notes metadata
    candidateName: { type: String, trim: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview' },
    vacancyName: { type: String, trim: true },
    interviewerName: { type: String, trim: true },
    interviewRound: { type: String, trim: true },
    interviewDate: { type: String, trim: true },
    technicalRating: { type: Number, min: 1, max: 10 },
    communicationRating: { type: Number, min: 1, max: 10 },
    strengths: { type: String, trim: true },
    improvements: { type: String, trim: true },

    // HR Policy / Memo metadata
    applicableScope: { type: String, trim: true },
    policyStatus: { type: String, enum: ['Draft', 'Active', 'Archived'], default: 'Active' },
    memoSubject: { type: String, trim: true },
    visibility: { type: String, enum: ['public', 'internal', 'restricted'], default: 'internal' },
    authorName: { type: String, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'Employee' },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
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

NoteSchema.index({ category: 1, pinned: -1, createdAt: -1 });

export const NoteModel = model<INoteDocument>('Note', NoteSchema);
