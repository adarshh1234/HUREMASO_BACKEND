import mongoose, { Schema, Document } from 'mongoose';

export interface IBuzzPostDocument extends Document {
  author: string;
  authorId?: string;
  avatar?: string;
  title?: string;
  content: string;
  type?: 'post' | 'announcement' | 'event' | 'newsletter';
  likes?: number;
  commentsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const buzzPostSchema = new Schema<IBuzzPostDocument>(
  {
    author: { type: String, required: true, trim: true },
    authorId: { type: String },
    avatar: { type: String },
    title: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ['post', 'announcement', 'event', 'newsletter'], default: 'post' },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BuzzPostModel =
  (mongoose.models.BuzzPost as mongoose.Model<IBuzzPostDocument>) ||
  mongoose.model<IBuzzPostDocument>('BuzzPost', buzzPostSchema);
