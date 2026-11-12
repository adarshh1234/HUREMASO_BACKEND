import mongoose, { Schema, Document } from 'mongoose';
import { IJobPosting } from './jobPosting.types';

export interface IJobPostingDocument extends Document, Omit<IJobPosting, 'id' | '_id'> {}

const JobPostingSchema = new Schema<IJobPostingDocument>(
  {
    vacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy', index: true },
    title: { type: String, trim: true, index: true },
    jobTitle: { type: String, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    locationType: { type: String, default: 'Remote / Hybrid', trim: true },
    officeLocation: { type: String, trim: true },
    location: { type: String, trim: true },
    employmentType: { type: String, default: 'Full-time', trim: true },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    salaryRange: { type: String, trim: true },
    currency: { type: String, default: 'USD', trim: true },
    experienceLevel: { type: String, default: 'Mid Level', trim: true },
    skills: { type: [String], default: [] },
    qualifications: { type: String, trim: true },
    description: { type: String, default: '', trim: true },
    platform: { type: String, default: 'LetsGetIn', trim: true, index: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Live on Letgetin', 'Closed'],
      default: 'Live on Letgetin',
      index: true,
    },
    platformPostId: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    postedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    postedAt: { type: Date, default: Date.now },
    closingDate: { type: String, trim: true },
    applicantsCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (!ret.title && ret.jobTitle) ret.title = ret.jobTitle;
        if (!ret.jobTitle && ret.title) ret.jobTitle = ret.title;
        if (!ret.officeLocation && ret.location) ret.officeLocation = ret.location;
        if (!ret.location && ret.officeLocation) ret.location = ret.officeLocation;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

JobPostingSchema.pre('save', function (next) {
  if (!this.title && this.jobTitle) this.title = this.jobTitle;
  if (!this.jobTitle && this.title) this.jobTitle = this.title;
  if (!this.officeLocation && this.location) this.officeLocation = this.location;
  if (!this.location && this.officeLocation) this.location = this.officeLocation;
  next();
});

JobPostingSchema.index({ title: 'text', jobTitle: 'text', department: 'text', description: 'text' });

export const JobPostingModel = mongoose.model<IJobPostingDocument>('JobPosting', JobPostingSchema);
