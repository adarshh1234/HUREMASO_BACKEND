import { Schema, model } from 'mongoose';
import { INoteDocument } from './notes.types';

const NoteSchema = new Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
    },
    aiSummary: {
      type: String,
    },
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

NoteSchema.index({ pinned: -1, createdAt: -1 });

export const NoteModel = model<INoteDocument>('Note', NoteSchema);
