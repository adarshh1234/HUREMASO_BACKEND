import mongoose, { Schema, Document } from 'mongoose';
import { IVacancy } from './vacancy.types';

export interface IVacancyDocument extends Document, Omit<IVacancy, 'id' | '_id'> {}

const VacancySchema = new Schema<IVacancyDocument>(
  {
    jobTitle: { type: String, trim: true, index: true },
    title: { type: String, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    location: { type: String, trim: true },
    locationType: { type: String, default: 'Remote / Hybrid', trim: true },
    employmentType: { type: String, default: 'Full-time', trim: true },
    hiringManager: { type: String, default: 'HR Manager', trim: true },
    noOfOpenings: { type: Number, default: 1, min: 1 },
    numberOfPositions: { type: Number, default: 1, min: 1 },
    description: { type: String, default: '', trim: true },
    jobDescription: { type: String, default: '', trim: true },
    requirements: { type: Schema.Types.Mixed, default: '' },
    status: {
      type: String,
      enum: ['Available', 'Active', 'Open', 'Closed', 'Draft', 'Paused'],
      default: 'Available',
      index: true,
    },
    datePosted: { type: String, default: () => new Date().toISOString().split('T')[0] },
    closingDate: { type: String, trim: true },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    salaryRange: { type: String, trim: true },
    currency: { type: String, default: 'USD', trim: true },
    experienceLevel: { type: String, trim: true },
    experienceRequired: { type: String, trim: true },
    requiredQualifications: { type: String, trim: true },
    skills: { type: [String], default: [] },
    skillsRequired: { type: [String], default: [] },
    isArchived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (!ret.jobTitle && ret.title) ret.jobTitle = ret.title;
        if (!ret.title && ret.jobTitle) ret.title = ret.jobTitle;
        if (!ret.numberOfPositions && ret.noOfOpenings) ret.numberOfPositions = ret.noOfOpenings;
        if (!ret.noOfOpenings && ret.numberOfPositions) ret.noOfOpenings = ret.numberOfPositions;
        if (!ret.jobDescription && ret.description) ret.jobDescription = ret.description;
        if (!ret.description && ret.jobDescription) ret.description = ret.jobDescription;
        if (!ret.skillsRequired && ret.skills) ret.skillsRequired = ret.skills;
        if (!ret.skills && ret.skillsRequired) ret.skills = ret.skillsRequired;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

VacancySchema.pre('save', function (next) {
  if (!this.jobTitle && this.title) this.jobTitle = this.title;
  if (!this.title && this.jobTitle) this.title = this.jobTitle;
  if (!this.numberOfPositions && this.noOfOpenings) this.numberOfPositions = this.noOfOpenings;
  if (!this.noOfOpenings && this.numberOfPositions) this.noOfOpenings = this.numberOfPositions;
  if (!this.jobDescription && this.description) this.jobDescription = this.description;
  if (!this.description && this.jobDescription) this.description = this.jobDescription;
  if ((!this.skills || this.skills.length === 0) && this.skillsRequired && this.skillsRequired.length > 0) {
    this.skills = this.skillsRequired;
  }
  if ((!this.skillsRequired || this.skillsRequired.length === 0) && this.skills && this.skills.length > 0) {
    this.skillsRequired = this.skills;
  }
  next();
});

VacancySchema.index({ jobTitle: 'text', title: 'text', department: 'text', description: 'text' });

export const VacancyModel = mongoose.model<IVacancyDocument>('Vacancy', VacancySchema);
