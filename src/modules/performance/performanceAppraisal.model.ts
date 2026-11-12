import mongoose, { Schema } from 'mongoose';
import { IPerformanceAppraisalDocument } from './performanceAppraisal.types';

const CompetencySchema = new Schema(
  {
    skill: { type: String, required: true },
    score: { type: String, required: true },
    status: { type: String, default: 'Meets Expectation' },
    benchmarkScore: { type: String, default: '90%' },
  },
  { _id: false }
);

const ReportsAiSchema = new Schema(
  {
    overallAiScore: { type: Number, default: 4.8 },
    peerSentimentRating: { type: Number, default: 96 },
    competenciesMetCount: { type: Number, default: 12 },
    totalCompetenciesCount: { type: Number, default: 12 },
    performanceTier: { type: String, default: 'Top 5% Performance Tier' },
    competencies: [CompetencySchema],
    lastGeneratedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { _id: false }
);

const AttendanceLogSchema = new Schema(
  {
    month: { type: String, required: true },
    shiftAdherence: { type: String, default: '100%' },
    punctualityPct: { type: Number, default: 99.2 },
    notes: { type: String, default: 'On-time arrival consistently' },
  },
  { _id: false }
);

const AttendanceTimeSchema = new Schema(
  {
    punctualityScore: { type: Number, default: 99.2 },
    streakStatus: { type: String, default: 'Perfect attendance streak' },
    overtimeHoursPerMonth: { type: Number, default: 14.5 },
    overtimeContribution: { type: String, default: 'Approved OT Contribution' },
    velocityMultiplier: { type: String, default: '1.15x Velocity' },
    velocityNotes: { type: String, default: 'Delivers ahead of schedule' },
    attendanceImpactScore: { type: Number, default: 98 },
    logs: [AttendanceLogSchema],
  },
  { _id: false }
);

const SmartWorkInitiativeSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Automation' },
    hoursSaved: { type: Number, default: 15 },
    status: { type: String, default: 'Active' },
  },
  { _id: false }
);

const SmartWorkSchema = new Schema(
  {
    automatedWorkflowsCount: { type: Number, default: 8 },
    hoursSavedPerMonth: { type: Number, default: 120 },
    focusHoursRatio: { type: Number, default: 68 },
    deepWorkBalanceNote: { type: String, default: 'Optimal balance of meeting vs coding' },
    initiatives: [SmartWorkInitiativeSchema],
  },
  { _id: false }
);

const BehavioralTraitSchema = new Schema(
  {
    trait: { type: String, required: true },
    score: { type: Number, required: true },
    level: { type: String, default: 'High' },
  },
  { _id: false }
);

const PsychometricSchema = new Schema(
  {
    discProfileArchetype: { type: String, default: 'Dominant-Influencer (Di)' },
    archetypeDescription: { type: String, default: 'Natural Problem Solver & Leader' },
    cognitivePercentile: { type: Number, default: 95 },
    cognitiveNotes: { type: String, default: 'High analytical reasoning' },
    eqScore: { type: Number, default: 138 },
    eqMax: { type: Number, default: 150 },
    eqNotes: { type: String, default: 'Excellent empathy & conflict resolution' },
    behavioralTraits: [BehavioralTraitSchema],
  },
  { _id: false }
);

const EsopItemSchema = new Schema(
  {
    sopId: { type: String, required: true },
    title: { type: String, required: true },
    version: { type: String, default: '1.0' },
    status: { type: String, default: 'Active' },
    updatedDate: { type: String, default: 'August 2026' },
    acknowledged: { type: Boolean, default: true },
    docUrl: { type: String },
  },
  { _id: false }
);

const EsopsSchema = new Schema(
  {
    sops: [EsopItemSchema],
  },
  { _id: false }
);

const ReviewSectionSchema = new Schema(
  {
    cycle: { type: String, default: 'Q3 2026' },
    selfAppraisal: {
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Submitted', 'Completed'],
        default: 'Submitted',
      },
      score: { type: Number, default: 4.8 },
      comments: { type: String, default: 'Successfully delivered UI Micro-frontend redesign ahead of timeline.' },
      strengths: { type: String, default: 'Architecture design, mentoring, cross-team alignment.' },
      improvementAreas: { type: String, default: 'Exploring more generative AI tooling integrations.' },
      submittedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    },
    managerReview: {
      status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Signed Off'],
        default: 'In Progress',
      },
      score: { type: Number, default: 4.9 },
      reviewerName: { type: String, default: 'Marcus Vance' },
      comments: { type: String, default: 'Outstanding execution and technical leadership throughout the quarter.' },
      signedAt: { type: String },
    },
    hrCalibration: {
      status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed'],
        default: 'Scheduled',
      },
      scheduledDate: { type: String, default: 'Sep 15, 2026' },
      finalRating: { type: Number, default: 4.85 },
      statusNotes: { type: String, default: 'Aligned in Top 5% performance bracket.' },
    },
  },
  { _id: false }
);

const EndorsementItemSchema = new Schema(
  {
    id: { type: String, required: true },
    from: { type: String, required: true },
    role: { type: String, default: 'Colleague' },
    text: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    recommendationType: { type: String, default: 'Promotion' },
    verified: { type: Boolean, default: true },
  },
  { _id: false }
);

const ReferencesSchema = new Schema(
  {
    endorsements: [EndorsementItemSchema],
  },
  { _id: false }
);

const SpecialStrategySchema = new Schema(
  {
    hipoTrack: {
      nominated: { type: Boolean, default: true },
      trackName: { type: String, default: 'Executive Fast-Track Promotion Program' },
      description: {
        type: String,
        default: 'Nominated for Director of Engineering succession plan. Includes executive coaching & offshore leadership rotations.',
      },
      roadmapStatus: { type: String, default: 'Milestone 2 of 4 Completed' },
      status: { type: String, default: 'Active & In Progress' },
    },
    retentionGrant: {
      eligible: { type: Boolean, default: true },
      grantName: { type: String, default: 'Key Talent Strategic Retention Bonus' },
      description: {
        type: String,
        default: 'Tier-1 Retention Agreement active through December 2027 with quarterly equity acceleration.',
      },
      vestingStatus: { type: String, default: 'Active & Vesting' },
      agreementExpiry: { type: String, default: 'December 2027' },
    },
  },
  { _id: false }
);

const AnalyticsAiSchema = new Schema(
  {
    predictedTrajectoryGrowth: { type: String, default: '+18% Growth' },
    trajectoryGrowthTier: { type: String, default: 'High Growth Potential' },
    attritionRiskPct: { type: Number, default: 2.1 },
    attritionRiskLevel: { type: String, default: 'Low (2.1%)' },
    retentionLikelihood: { type: String, default: 'High Retention Likelihood' },
    leadershipReadinessScore: { type: Number, default: 92 },
    promotionReadiness: { type: String, default: 'Ready for Promotion' },
    aiSummary: {
      type: String,
      default: 'Demonstrates exceptional leadership and technical velocity. High succession probability.',
    },
  },
  { _id: false }
);

const PerformanceAppraisalSchema = new Schema<IPerformanceAppraisalDocument>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true, trim: true, index: true },
    employeeId: { type: String, trim: true, index: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    cycle: { type: String, default: 'Q3 2026', index: true },
    status: {
      type: String,
      enum: ['Draft', 'Self Review Pending', 'Manager Review Pending', 'In Calibration', 'Approved', 'Completed'],
      default: 'Manager Review Pending',
      index: true,
    },
    reportsAi: { type: ReportsAiSchema, default: () => ({}) },
    attendanceTime: { type: AttendanceTimeSchema, default: () => ({}) },
    smartWork: { type: SmartWorkSchema, default: () => ({}) },
    psychometric: { type: PsychometricSchema, default: () => ({}) },
    eSops: { type: EsopsSchema, default: () => ({}) },
    review: { type: ReviewSectionSchema, default: () => ({}) },
    references: { type: ReferencesSchema, default: () => ({}) },
    strategy: { type: SpecialStrategySchema, default: () => ({}) },
    analyticsAi: { type: AnalyticsAiSchema, default: () => ({}) },
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

export const PerformanceAppraisalModel = mongoose.model<IPerformanceAppraisalDocument>(
  'PerformanceAppraisal',
  PerformanceAppraisalSchema
);
