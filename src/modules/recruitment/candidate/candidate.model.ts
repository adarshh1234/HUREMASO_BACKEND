import mongoose, { Schema, Document } from 'mongoose';
import { ICandidate } from './candidate.types';

export interface ICandidateDocument extends Document, Omit<ICandidate, 'id' | '_id'> {}

const CandidateSchema = new Schema<ICandidateDocument>(
  {
    name: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    location: { type: String, trim: true },
    vacancy: { type: String, trim: true, index: true },
    vacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy', index: true },
    hiringManager: { type: String, trim: true },
    dateApplied: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: {
      type: String,
      enum: [
        'Applied',
        'Application Initiated',
        'Screened',
        'Shortlisted',
        'Interview',
        'Interview Scheduled',
        'Interview Passed',
        'Interview Failed',
        'Selected',
        'Offered',
        'Job Offered',
        'Onboarding',
        'Hired',
        'Rejected',
      ],
      default: 'Applied',
      index: true,
    },
    experienceYears: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    skills: { type: [String], default: [], index: true },
    education: { type: String, trim: true },
    currentCompany: { type: String, trim: true },
    currentDesignation: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    noticePeriod: { type: String, trim: true },
    expectedSalary: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    source: { type: String, trim: true, default: 'Direct Application' },
    notes: { type: String, trim: true },
    tags: { type: [String], default: [] },
    employeeId: { type: String, trim: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        if (!ret.name && (ret.firstName || ret.lastName)) {
          ret.name = `${ret.firstName || ''} ${ret.lastName || ''}`.trim();
        }
        if (!ret.firstName && ret.name) {
          const parts = ret.name.split(' ');
          ret.firstName = parts[0];
          ret.lastName = parts.slice(1).join(' ');
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

CandidateSchema.pre('save', function (next) {
  if (!this.name && (this.firstName || this.lastName)) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  if (!this.firstName && this.name) {
    const parts = this.name.split(' ');
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(' ');
  }
  if (!this.phone && this.contactNumber) {
    this.phone = this.contactNumber;
  }
  if (!this.contactNumber && this.phone) {
    this.contactNumber = this.phone;
  }
  next();
});

CandidateSchema.index({ name: 'text', email: 'text', currentCompany: 'text', skills: 'text' });

export const CandidateModel = mongoose.model<ICandidateDocument>('Candidate', CandidateSchema);
