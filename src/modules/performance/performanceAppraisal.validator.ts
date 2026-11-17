import { z } from 'zod';

export const createAppraisalSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  cycle: z.string().default('Q3 2026'),
  cycleId: z.string().optional(),
  status: z
    .enum(['Draft', 'Self Review Pending', 'Manager Review Pending', 'In Calibration', 'Approved', 'Completed'])
    .default('Manager Review Pending'),
});

export const updateAppraisalSchema = createAppraisalSchema.partial().extend({
  status: z
    .enum(['Draft', 'Self Review Pending', 'Manager Review Pending', 'In Calibration', 'Approved', 'Completed'])
    .optional(),
  reportsAi: z.any().optional(),
  attendanceTime: z.any().optional(),
  smartWork: z.any().optional(),
  psychometric: z.any().optional(),
  eSops: z.any().optional(),
  review: z.any().optional(),
  references: z.any().optional(),
  strategy: z.any().optional(),
  analyticsAi: z.any().optional(),
});

export const updateReportsAiSchema = z.object({
  overallAiScore: z.number().optional(),
  peerSentimentRating: z.number().optional(),
  competenciesMetCount: z.number().optional(),
  totalCompetenciesCount: z.number().optional(),
  performanceTier: z.string().optional(),
  summary: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  skillGaps: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  leadershipOpportunities: z.array(z.string()).optional(),
  competencies: z
    .array(
      z.object({
        skill: z.string(),
        score: z.string(),
        status: z.string(),
        benchmarkScore: z.string().optional(),
      })
    )
    .optional(),
});

export const updateAttendanceTimeSchema = z.object({
  punctualityScore: z.number().optional(),
  streakStatus: z.string().optional(),
  overtimeHoursPerMonth: z.number().optional(),
  overtimeContribution: z.string().optional(),
  velocityMultiplier: z.string().optional(),
  velocityNotes: z.string().optional(),
  attendanceImpactScore: z.number().optional(),
  totalWorkingDays: z.number().optional(),
  presentDays: z.number().optional(),
  absentDays: z.number().optional(),
  lateArrivals: z.number().optional(),
  tasksCompleted: z.number().optional(),
  onTimeTaskPercentage: z.number().optional(),
  logs: z
    .array(
      z.object({
        month: z.string(),
        shiftAdherence: z.string(),
        punctualityPct: z.number(),
        notes: z.string(),
        presentDays: z.number().optional(),
        absentDays: z.number().optional(),
        lateDays: z.number().optional(),
      })
    )
    .optional(),
});

export const updateSmartWorkSchema = z.object({
  automatedWorkflowsCount: z.number().optional(),
  hoursSavedPerMonth: z.number().optional(),
  focusHoursRatio: z.number().optional(),
  deepWorkBalanceNote: z.string().optional(),
  initiatives: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        hoursSaved: z.number(),
        estimatedHoursSaved: z.number().optional(),
        actualHoursSaved: z.number().optional(),
        date: z.string().optional(),
        status: z.string(),
        supportingDocUrl: z.string().optional(),
      })
    )
    .optional(),
});

export const updatePsychometricSchema = z.object({
  assessmentId: z.string().optional(),
  assessmentDate: z.string().optional(),
  discProfileArchetype: z.string().optional(),
  archetypeDescription: z.string().optional(),
  dScore: z.number().optional(),
  iScore: z.number().optional(),
  sScore: z.number().optional(),
  cScore: z.number().optional(),
  resultProfile: z.string().optional(),
  cognitivePercentile: z.number().optional(),
  cognitiveNotes: z.string().optional(),
  eqScore: z.number().optional(),
  eqMax: z.number().optional(),
  eqNotes: z.string().optional(),
  consentGiven: z.boolean().optional(),
  behavioralTraits: z
    .array(
      z.object({
        trait: z.string(),
        score: z.number(),
        level: z.string(),
        benchmark: z.string().optional(),
        interpretation: z.string().optional(),
      })
    )
    .optional(),
});

export const updateEsopsSchema = z.object({
  sops: z.array(
    z.object({
      sopId: z.string(),
      title: z.string(),
      version: z.string(),
      status: z.string(),
      updatedDate: z.string(),
      acknowledged: z.boolean(),
      acknowledgedAt: z.string().optional(),
      docUrl: z.string().optional(),
      complianceNotes: z.string().optional(),
    })
  ),
});

export const updateReviewSectionSchema = z.object({
  cycle: z.string().optional(),
  selfAppraisal: z
    .object({
      status: z.enum(['Not Started', 'In Progress', 'Submitted', 'Completed']).optional(),
      score: z.number().optional(),
      comments: z.string().optional(),
      strengths: z.string().optional(),
      improvementAreas: z.string().optional(),
      keyDeliverables: z.string().optional(),
      challengesFaced: z.string().optional(),
      supportingEvidence: z.string().optional(),
      submittedAt: z.string().optional(),
    })
    .optional(),
  managerReview: z
    .object({
      status: z.enum(['Pending', 'In Progress', 'Signed Off']).optional(),
      score: z.number().optional(),
      reviewerName: z.string().optional(),
      comments: z.string().optional(),
      promotionRecommended: z.boolean().optional(),
      developmentPlan: z.string().optional(),
      signedAt: z.string().optional(),
    })
    .optional(),
  hrCalibration: z
    .object({
      status: z.enum(['Scheduled', 'In Progress', 'Completed']).optional(),
      scheduledDate: z.string().optional(),
      finalRating: z.number().optional(),
      statusNotes: z.string().optional(),
      calibratedBy: z.string().optional(),
      calibrationNotes: z.string().optional(),
      calibratedAt: z.string().optional(),
    })
    .optional(),
});

export const add360FeedbackSchema = z.object({
  reviewerId: z.string().optional(),
  reviewerName: z.string().min(1, 'Reviewer name is required'),
  reviewerRole: z.string().default('Peer'),
  relationship: z.string().default('Peer'),
  isAnonymous: z.boolean().default(false),
  score: z.number().min(1).max(5),
  comments: z.string().min(1, 'Feedback comments are required'),
});

export const addEndorsementSchema = z.object({
  from: z.string().min(1, 'Author is required'),
  role: z.string().default('Peer / Colleague'),
  text: z.string().min(1, 'Recommendation text is required'),
  date: z.string().optional(),
  recommendationType: z.string().default('Promotion'),
  verified: z.boolean().default(true),
  evidenceUrl: z.string().optional(),
});

export const updateStrategySchema = z.object({
  hipoTrack: z
    .object({
      nominated: z.boolean().optional(),
      nominatorName: z.string().optional(),
      nominationDate: z.string().optional(),
      nominationReason: z.string().optional(),
      trackName: z.string().optional(),
      description: z.string().optional(),
      roadmapStatus: z.string().optional(),
      status: z.string().optional(),
      milestones: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            targetDate: z.string(),
            assignedMentor: z.string(),
            progress: z.number(),
            status: z.enum(['Pending', 'In Progress', 'Completed']),
          })
        )
        .optional(),
    })
    .optional(),
  retentionGrant: z
    .object({
      eligible: z.boolean().optional(),
      grantName: z.string().optional(),
      description: z.string().optional(),
      grantAmount: z.number().optional(),
      grantUnits: z.number().optional(),
      approvalStatus: z.string().optional(),
      grantDate: z.string().optional(),
      vestingSchedule: z.string().optional(),
      vestingStatus: z.string().optional(),
      agreementExpiry: z.string().optional(),
    })
    .optional(),
});

export const updateAnalyticsAiSchema = z.object({
  predictedTrajectoryGrowth: z.string().optional(),
  trajectoryGrowthTier: z.string().optional(),
  attritionRiskPct: z.number().optional(),
  attritionRiskLevel: z.string().optional(),
  retentionLikelihood: z.string().optional(),
  leadershipReadinessScore: z.number().optional(),
  promotionReadiness: z.string().optional(),
  aiSummary: z.string().optional(),
  confidenceLevel: z.string().optional(),
  influencingFactors: z.array(z.string()).optional(),
});

export const createAppraisalCycleSchema = z.object({
  cycleId: z.string().optional(),
  name: z.string().min(1, 'Cycle name is required'),
  financialYear: z.string().default('2026-2027'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  submissionDeadline: z.string().min(1, 'Submission deadline is required'),
  reviewDeadline: z.string().min(1, 'Review deadline is required'),
  eligibleDepartments: z.array(z.string()).default([]),
  eligibleEmployeeIds: z.array(z.string()).default([]),
  frequency: z.enum(['Quarterly', 'Bi-Annual', 'Annual']).default('Quarterly'),
  status: z
    .enum(['Draft', 'Scheduled', 'Active', 'Under Review', 'Calibration', 'Completed', 'Archived'])
    .default('Active'),
  description: z.string().optional(),
});

export const updateAppraisalCycleSchema = createAppraisalCycleSchema.partial();

export const queryAppraisalSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  cycle: z.string().optional(),
  employeeId: z.string().optional(),
});

export const mongoIdSchema = z.string().min(1, 'Valid ID is required');
