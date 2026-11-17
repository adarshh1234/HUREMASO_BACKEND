import { Schema, model } from 'mongoose';
import { IResumeDocument } from './resume.types';

const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String },
    year: { type: Schema.Types.Mixed },
    field: { type: String },
  },
  { _id: false }
);

const WorkExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const ResumeSchema = new Schema<IResumeDocument>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      index: true,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    education: [EducationSchema],
    workExperience: [WorkExperienceSchema],
    rawText: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    parsedData: {
      type: Schema.Types.Mixed,
    },
    matchedVacancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Vacancy',
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      default: 'Direct Upload',
      trim: true,
      index: true,
    },
    isVerifiedLetsGetIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedDate: {
      type: String,
      trim: true,
    },
    assessmentScore: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    expectedSalary: {
      type: String,
      trim: true,
    },
    noticePeriod: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    previousCompany: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Uploaded', 'Parsed', 'Shortlisted', 'Archived', 'New', 'Screened', 'Interview', 'Offered'],
      default: 'Parsed',
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

ResumeSchema.index({ candidateName: 'text', skills: 'text', title: 'text' });

export const ResumeModel = model<IResumeDocument>('Resume', ResumeSchema);
