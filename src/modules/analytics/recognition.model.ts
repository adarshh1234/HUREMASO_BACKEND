import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeRecognitionDocument extends Document {
  id: string;
  periodType: 'week' | 'month' | 'year';
  periodLabel: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  avatar?: string;
  score: number;
  ratingScore?: number;
  punctualityScore?: number;
  scoringBreakdown: {
    appraisalScore: number;
    goalScore: number;
    taskScore: number;
    attendanceScore: number;
    contributionScore: number;
  };
  achievementHighlights: string[];
  keyQuote?: string;
  badge: string;
  status: 'Proposed' | 'Approved';
  approvedBy?: string;
  approvedAt?: Date;
  awardedDate: string;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmployeeRecognitionSchema = new Schema<IEmployeeRecognitionDocument>(
  {
    periodType: {
      type: String,
      enum: ['week', 'month', 'year'],
      required: true,
      index: true,
    },
    periodLabel: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'Team Member',
      trim: true,
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    ratingScore: {
      type: Number,
      default: 4.8,
    },
    punctualityScore: {
      type: Number,
      default: 98.5,
    },
    scoringBreakdown: {
      appraisalScore: { type: Number, default: 0 },
      goalScore: { type: Number, default: 0 },
      taskScore: { type: Number, default: 0 },
      attendanceScore: { type: Number, default: 0 },
      contributionScore: { type: Number, default: 0 },
    },
    achievementHighlights: {
      type: [String],
      default: [],
    },
    keyQuote: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: 'Spotlight Performer',
    },
    status: {
      type: String,
      enum: ['Proposed', 'Approved'],
      default: 'Approved',
      index: true,
    },
    approvedBy: {
      type: String,
      default: 'HR Operations',
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    awardedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Compound index to ensure uniqueness per period type and label
EmployeeRecognitionSchema.index({ periodType: 1, periodLabel: 1 }, { unique: false });

export const EmployeeRecognitionModel = mongoose.model<IEmployeeRecognitionDocument>(
  'EmployeeRecognition',
  EmployeeRecognitionSchema
);
