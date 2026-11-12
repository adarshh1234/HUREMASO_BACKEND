import mongoose, { Schema } from 'mongoose';
import {
  IFlightRiskDocument,
  ISkillGapDocument,
  IDevelopmentRecommendationDocument,
  IAIConversationDocument,
  IComplianceRecordDocument,
} from './ai.types';

// ================= 1. FLIGHT RISK SCHEMA =================

const flightRiskIndicatorSchema = new Schema(
  {
    factor: { type: String, required: true, trim: true },
    weight: { type: Number, required: true, default: 20 },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const flightRiskSchema = new Schema<IFlightRiskDocument>(
  {
    employeeId: { type: String, required: true, trim: true, index: true },
    employeeName: { type: String, required: true, trim: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    jobTitle: { type: String, default: '', trim: true },
    riskLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
    indicators: { type: [flightRiskIndicatorSchema], default: [] },
    recommendedActions: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Open', 'Mitigating', 'Resolved', 'Dismissed'],
      default: 'Open',
      index: true,
    },
    notes: { type: String, default: '' },
    resolvedAt: { type: String, default: '' },
    resolvedBy: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

flightRiskSchema.index({ department: 1, riskLevel: 1, status: 1 });

export const FlightRiskModel = mongoose.model<IFlightRiskDocument>(
  'AIFlightRisk',
  flightRiskSchema
);

// ================= 2. SKILL GAP SCHEMA =================

const skillGapSchema = new Schema<ISkillGapDocument>(
  {
    department: { type: String, required: true, trim: true, index: true },
    skillName: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['Technical', 'Soft Skills', 'Leadership', 'Domain', 'Tools'],
      default: 'Technical',
      index: true,
    },
    targetCompetencyScore: { type: Number, default: 85, min: 0, max: 100 },
    currentTeamScore: { type: Number, default: 60, min: 0, max: 100 },
    gapPercentage: { type: Number, default: 25, min: 0, max: 100 },
    readinessLevel: { type: Number, default: 75, min: 0, max: 100 },
    requiredStaffCount: { type: Number, default: 5 },
    qualifiedStaffCount: { type: Number, default: 3 },
    upskillingRecommended: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

skillGapSchema.index({ department: 1, skillName: 1 }, { unique: true });

export const SkillGapModel = mongoose.model<ISkillGapDocument>(
  'AISkillGap',
  skillGapSchema
);

// ================= 3. DEVELOPMENT RECOMMENDATION SCHEMA =================

const developmentRecommendationSchema = new Schema<IDevelopmentRecommendationDocument>(
  {
    employeeId: { type: String, required: true, trim: true, index: true },
    employeeName: { type: String, required: true, trim: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    skillName: { type: String, required: true, trim: true },
    recommendationTitle: { type: String, required: true, trim: true },
    recommendationType: {
      type: String,
      enum: ['Course', 'Certification', 'Mentorship', 'Project Assignment'],
      default: 'Course',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Suggested', 'In Progress', 'Completed', 'Deferred'],
      default: 'Suggested',
      index: true,
    },
    targetCompletionDate: { type: String, default: '' },
    completionProgress: { type: Number, default: 0, min: 0, max: 100 },
    assignedBy: { type: String, default: 'HUREMASO AI' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

export const DevelopmentRecommendationModel = mongoose.model<IDevelopmentRecommendationDocument>(
  'AIDevelopmentRecommendation',
  developmentRecommendationSchema
);

// ================= 4. AI CONVERSATION SCHEMA =================

const chatMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ['user', 'ai', 'system'], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    category: {
      type: String,
      enum: ['Policy', 'Leave', 'Payroll', 'Performance', 'Onboarding', 'General'],
      default: 'General',
    },
    suggestedActions: { type: [String], default: [] },
    isDraftTemplate: { type: Boolean, default: false },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversationDocument>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },
    userName: { type: String, default: 'Sarah Joseph' },
    title: { type: String, default: 'HR Conversation' },
    messages: { type: [chatMessageSchema], default: [] },
    lastActivity: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

export const AIConversationModel = mongoose.model<IAIConversationDocument>(
  'AIConversation',
  aiConversationSchema
);

// ================= 5. COMPLIANCE RECORD SCHEMA =================

const complianceRecordSchema = new Schema<IComplianceRecordDocument>(
  {
    complianceCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['Statutory', 'Labor Law', 'Tax', 'Safety', 'Privacy & Data', 'Internal Policy'],
      default: 'Labor Law',
      index: true,
    },
    jurisdiction: { type: String, default: 'India & Global Entities', trim: true },
    status: {
      type: String,
      enum: ['Compliant', 'At Risk', 'Non-Compliant', 'Audit Ready'],
      default: 'Audit Ready',
      index: true,
    },
    auditScore: { type: Number, default: 100, min: 0, max: 100 },
    discrepanciesCount: { type: Number, default: 0 },
    lastAuditedAt: { type: String, default: () => new Date().toISOString() },
    nextDeadline: { type: String, default: 'Annual Recurring' },
    description: { type: String, required: true },
    autoScanEnabled: { type: Boolean, default: true },
    affectedEmployeesCount: { type: Number, default: 0 },
    remediationSteps: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

export const ComplianceRecordModel = mongoose.model<IComplianceRecordDocument>(
  'AIComplianceRecord',
  complianceRecordSchema
);
