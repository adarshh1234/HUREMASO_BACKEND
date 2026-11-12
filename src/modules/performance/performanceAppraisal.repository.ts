import { PerformanceAppraisalModel } from './performanceAppraisal.model';
import {
  IPerformanceAppraisalRecord,
  IPerformanceAppraisalDocument,
  AppraisalQueryParams,
  AppraisalReportsSummary,
} from './performanceAppraisal.types';

const INITIAL_APPRAISAL_SEED: Partial<IPerformanceAppraisalRecord>[] = [
  {
    recordId: 'APP-2026-Q3-001',
    employeeName: 'Sarah Jenkins',
    employeeId: 'EMP-ENG-101',
    role: 'Principal Software Engineer',
    department: 'Engineering',
    cycle: 'Q3 2026',
    status: 'Manager Review Pending',
    reportsAi: {
      overallAiScore: 4.8,
      peerSentimentRating: 96,
      competenciesMetCount: 12,
      totalCompetenciesCount: 12,
      performanceTier: 'Top 5% Performance Tier',
      competencies: [
        { skill: 'Technical Architecture & Code Efficiency', score: '98%', status: 'Exceeds Expectation', benchmarkScore: '98%' },
        { skill: 'Cross-functional Collaboration', score: '94%', status: 'Exceeds Expectation', benchmarkScore: '94%' },
        { skill: 'Strategic Project Delivery & Planning', score: '91%', status: 'Meets Expectation', benchmarkScore: '91%' },
        { skill: 'Mentorship & Engineering Excellence', score: '96%', status: 'Exceeds Expectation', benchmarkScore: '95%' },
      ],
      lastGeneratedDate: '2026-09-18',
    },
    attendanceTime: {
      punctualityScore: 99.2,
      streakStatus: 'Perfect attendance streak',
      overtimeHoursPerMonth: 14.5,
      overtimeContribution: 'Approved OT Contribution',
      velocityMultiplier: '1.15x Velocity',
      velocityNotes: 'Delivers ahead of schedule',
      attendanceImpactScore: 98,
      logs: [
        { month: 'August 2026', shiftAdherence: '100%', punctualityPct: 100, notes: 'Zero delays, exceptional shift coverage' },
        { month: 'July 2026', shiftAdherence: '98.5%', punctualityPct: 98.5, notes: 'Approved late login compensated with OT' },
        { month: 'June 2026', shiftAdherence: '100%', punctualityPct: 100, notes: 'On-time delivery on critical releases' },
      ],
    },
    smartWork: {
      automatedWorkflowsCount: 8,
      hoursSavedPerMonth: 120,
      focusHoursRatio: 68,
      deepWorkBalanceNote: 'Optimal balance of meeting vs coding',
      initiatives: [
        { id: 'SW-1', title: 'Automated CI/CD Test Pipeline Reducer', category: 'Automation', hoursSaved: 45, status: 'Production Deployed' },
        { id: 'SW-2', title: 'AI Code Review Suggestion Bot', category: 'DevOps & AI', hoursSaved: 50, status: 'Active' },
        { id: 'SW-3', title: 'Self-Service Environment Provisioner', category: 'Infra', hoursSaved: 25, status: 'Completed' },
      ],
    },
    psychometric: {
      discProfileArchetype: 'Dominant-Influencer (Di)',
      archetypeDescription: 'Natural Problem Solver & Leader',
      cognitivePercentile: 95,
      cognitiveNotes: 'High analytical reasoning & pattern recognition',
      eqScore: 138,
      eqMax: 150,
      eqNotes: 'Excellent empathy & conflict resolution',
      behavioralTraits: [
        { trait: 'Strategic Problem Solving', score: 96, level: 'Exceptional' },
        { trait: 'Emotional Resilience & EQ', score: 92, level: 'High' },
        { trait: 'Team Synergy & Influence', score: 94, level: 'Exceptional' },
        { trait: 'Adaptability in Ambiguity', score: 90, level: 'High' },
      ],
    },
    eSops: {
      sops: [
        { sopId: 'SOP-1.0', title: 'SOP 1.0: Annual Appraisal Cycle Execution & Timeline', version: '2.1', status: 'Mandatory Read', updatedDate: 'August 2026', acknowledged: true },
        { sopId: 'SOP-2.0', title: 'SOP 2.0: 360-Degree Peer Feedback Guidelines & Ethics', version: '1.4', status: 'Active', updatedDate: 'July 2026', acknowledged: true },
        { sopId: 'SOP-3.0', title: 'SOP 3.0: Manager Rating Calibration & Bell-Curve Adjustments', version: '2.0', status: 'Active', updatedDate: 'June 2026', acknowledged: true },
        { sopId: 'SOP-4.0', title: 'SOP 4.0: Appraisal Appeal & Grievance Escalation Process', version: '1.2', status: 'Active', updatedDate: 'May 2026', acknowledged: true },
      ],
    },
    review: {
      cycle: 'Q3 2026',
      selfAppraisal: {
        status: 'Submitted',
        score: 4.8,
        comments: 'Delivered the complete micro-frontend redesign and mentored two senior engineers into lead roles.',
        strengths: 'System architecture, async team execution, proactive risk elimination.',
        improvementAreas: 'Expanding automated test coverage on edge legacy modules.',
        submittedAt: '2026-09-01',
      },
      managerReview: {
        status: 'In Progress',
        score: 4.9,
        reviewerName: 'Marcus Vance (Head of Engineering)',
        comments: 'Sarah has consistently been our top technical driver. Her architectural clarity is second to none.',
        signedAt: '2026-09-10',
      },
      hrCalibration: {
        status: 'Scheduled',
        scheduledDate: 'Sep 15, 2026',
        finalRating: 4.85,
        statusNotes: 'Aligned in Top 5% performance bracket with high recommendation for Staff/Director track.',
      },
    },
    references: {
      endorsements: [
        {
          id: 'REF-01',
          from: 'David Miller (Engineering Lead)',
          role: 'Peer / Lead',
          text: 'Sarah consistently displays exceptional leadership in architecture design and mentors junior engineers with remarkable dedication.',
          date: 'August 18, 2026',
          recommendationType: 'Promotion',
          verified: true,
        },
        {
          id: 'REF-02',
          from: 'Emily Davis (Product Director)',
          role: 'Cross-functional Lead',
          text: 'Highly recommend Sarah for Senior Staff Engineer role. Her impact on Q2 product velocity was outstanding.',
          date: 'July 29, 2026',
          recommendationType: 'Excellence Award',
          verified: true,
        },
      ],
    },
    strategy: {
      hipoTrack: {
        nominated: true,
        trackName: 'Executive Fast-Track Promotion Program',
        description: 'Nominated for Director of Engineering succession plan. Includes executive coaching & offshore leadership rotations.',
        roadmapStatus: 'Milestone 2 of 4 Completed',
        status: 'Active & In Progress',
      },
      retentionGrant: {
        eligible: true,
        grantName: 'Key Talent Strategic Retention Bonus',
        description: 'Tier-1 Retention Agreement active through December 2027 with quarterly equity acceleration.',
        vestingStatus: 'Active & Vesting',
        agreementExpiry: 'December 2027',
      },
    },
    analyticsAi: {
      predictedTrajectoryGrowth: '+18% Growth',
      trajectoryGrowthTier: 'High Growth Potential',
      attritionRiskPct: 2.1,
      attritionRiskLevel: 'Low (2.1%)',
      retentionLikelihood: 'High Retention Likelihood',
      leadershipReadinessScore: 92,
      promotionReadiness: 'Ready for Promotion',
      aiSummary: 'Top-tier performer with clear high-velocity output, exemplary peer sentiment, and zero flight risk.',
    },
  },
  {
    recordId: 'APP-2026-Q3-002',
    employeeName: 'David Vance',
    employeeId: 'EMP-OPS-204',
    role: 'Senior Operations Manager',
    department: 'Operations',
    cycle: 'Q3 2026',
    status: 'In Calibration',
    reportsAi: {
      overallAiScore: 4.6,
      peerSentimentRating: 92,
      competenciesMetCount: 11,
      totalCompetenciesCount: 12,
      performanceTier: 'Top 10% Performance Tier',
      competencies: [
        { skill: 'Operational SLA Delivery', score: '95%', status: 'Exceeds Expectation', benchmarkScore: '92%' },
        { skill: 'Resource Allocation & Budgeting', score: '91%', status: 'Meets Expectation', benchmarkScore: '90%' },
        { skill: 'Incident Response Time', score: '97%', status: 'Exceeds Expectation', benchmarkScore: '95%' },
      ],
      lastGeneratedDate: '2026-09-15',
    },
    attendanceTime: {
      punctualityScore: 98.5,
      streakStatus: 'Consistent on-time record',
      overtimeHoursPerMonth: 10.0,
      overtimeContribution: 'Emergency Escalation Support',
      velocityMultiplier: '1.08x Velocity',
      velocityNotes: 'Reliable execution',
      attendanceImpactScore: 95,
      logs: [
        { month: 'August 2026', shiftAdherence: '100%', punctualityPct: 99.0, notes: 'Smooth on-call shifts' },
      ],
    },
    smartWork: {
      automatedWorkflowsCount: 5,
      hoursSavedPerMonth: 85,
      focusHoursRatio: 62,
      deepWorkBalanceNote: 'Balanced operations triage',
      initiatives: [
        { id: 'SW-OPS-1', title: 'Automated Shift Handover Dashboard', category: 'Operations', hoursSaved: 35, status: 'Active' },
      ],
    },
    psychometric: {
      discProfileArchetype: 'Conscientious-Stabilizer (CS)',
      archetypeDescription: 'Methodical, Process-Driven & Reliable',
      cognitivePercentile: 91,
      cognitiveNotes: 'Strong logistical reasoning',
      eqScore: 130,
      eqMax: 150,
      eqNotes: 'Calm under incident crisis',
      behavioralTraits: [
        { trait: 'Operational Rigor', score: 94, level: 'Exceptional' },
        { trait: 'Crisis Management', score: 92, level: 'High' },
      ],
    },
    eSops: {
      sops: [
        { sopId: 'SOP-1.0', title: 'SOP 1.0: Annual Appraisal Cycle Execution & Timeline', version: '2.1', status: 'Mandatory Read', updatedDate: 'August 2026', acknowledged: true },
      ],
    },
    review: {
      cycle: 'Q3 2026',
      selfAppraisal: {
        status: 'Submitted',
        score: 4.6,
        comments: 'Streamlined regional logistics and maintained 99.9% SLA across all client dispatches.',
        strengths: 'Operational discipline, vendor negotiation.',
        improvementAreas: 'Cross-functional automation tooling.',
        submittedAt: '2026-09-02',
      },
      managerReview: {
        status: 'Signed Off',
        score: 4.7,
        reviewerName: 'Victoria Sterling (COO)',
        comments: 'David keeps the operational gears running smoothly and handled recent vendor transitions flawlessly.',
        signedAt: '2026-09-12',
      },
      hrCalibration: {
        status: 'In Progress',
        scheduledDate: 'Sep 16, 2026',
        finalRating: 4.65,
        statusNotes: 'Finalizing merit increase band.',
      },
    },
    references: {
      endorsements: [
        {
          id: 'REF-03',
          from: 'Liam Gallagher (Logistics Director)',
          role: 'Peer',
          text: 'David brings stability and structured rigor to every high-stakes project.',
          date: 'August 22, 2026',
          recommendationType: 'Merit Recognition',
          verified: true,
        },
      ],
    },
    strategy: {
      hipoTrack: {
        nominated: false,
        trackName: 'Regional Operations Leadership Track',
        description: 'Candidate for Regional Operations Lead position.',
        roadmapStatus: 'Planning Phase',
        status: 'Under Review',
      },
      retentionGrant: {
        eligible: true,
        grantName: 'Operations Retention Incentive',
        description: 'Annual performance retention bonus.',
        vestingStatus: 'Active',
        agreementExpiry: 'June 2027',
      },
    },
    analyticsAi: {
      predictedTrajectoryGrowth: '+12% Growth',
      trajectoryGrowthTier: 'Steady High Performance',
      attritionRiskPct: 3.4,
      attritionRiskLevel: 'Low (3.4%)',
      retentionLikelihood: 'High Retention Likelihood',
      leadershipReadinessScore: 86,
      promotionReadiness: 'Targeted for Q1 Next Year',
      aiSummary: 'Consistent operational contributor with solid execution discipline.',
    },
  },
];

export class PerformanceAppraisalRepository {
  private async ensureSeedData(): Promise<void> {
    const count = await PerformanceAppraisalModel.countDocuments();
    if (count === 0) {
      await PerformanceAppraisalModel.insertMany(INITIAL_APPRAISAL_SEED);
    }
  }

  async findAll(params: AppraisalQueryParams): Promise<{ items: IPerformanceAppraisalDocument[]; total: number }> {
    await this.ensureSeedData();

    const query: Record<string, any> = {};

    if (params.search) {
      const regex = new RegExp(params.search, 'i');
      query.$or = [
        { employeeName: regex },
        { role: regex },
        { department: regex },
        { recordId: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.department && params.department !== 'All') {
      query.department = params.department;
    }

    if (params.cycle && params.cycle !== 'All') {
      query.cycle = params.cycle;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      PerformanceAppraisalModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      PerformanceAppraisalModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<IPerformanceAppraisalDocument | null> {
    await this.ensureSeedData();
    return PerformanceAppraisalModel.findById(id);
  }

  async findByRecordId(recordId: string): Promise<IPerformanceAppraisalDocument | null> {
    await this.ensureSeedData();
    return PerformanceAppraisalModel.findOne({ recordId });
  }

  async create(data: Partial<IPerformanceAppraisalRecord>): Promise<IPerformanceAppraisalDocument> {
    const record = new PerformanceAppraisalModel(data);
    return record.save();
  }

  async updateById(id: string, data: Partial<IPerformanceAppraisalRecord>): Promise<IPerformanceAppraisalDocument | null> {
    return PerformanceAppraisalModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await PerformanceAppraisalModel.findByIdAndDelete(id);
    return !!result;
  }

  async getReportsSummary(): Promise<AppraisalReportsSummary> {
    await this.ensureSeedData();
    const records = await PerformanceAppraisalModel.find();

    const total = records.length;
    const completed = records.filter((r) => r.status === 'Completed' || r.status === 'Approved').length;
    const avgAi = total > 0 ? records.reduce((acc, r) => acc + (r.reportsAi?.overallAiScore || 0), 0) / total : 4.8;
    const avgPunctuality = total > 0 ? records.reduce((acc, r) => acc + (r.attendanceTime?.punctualityScore || 0), 0) / total : 99.2;
    const topPerformers = records.filter((r) => (r.reportsAi?.overallAiScore || 0) >= 4.5).length;
    const hipoNominated = records.filter((r) => r.strategy?.hipoTrack?.nominated).length;
    const avgRetentionRisk = total > 0 ? records.reduce((acc, r) => acc + (r.analyticsAi?.attritionRiskPct || 0), 0) / total : 2.5;

    return {
      totalAppraisals: total,
      completedAppraisals: completed,
      averageAiScore: Number(avgAi.toFixed(2)),
      averagePunctuality: Number(avgPunctuality.toFixed(1)),
      topPerformersCount: topPerformers,
      hiPoNominatedCount: hipoNominated,
      averageRetentionRiskPct: Number(avgRetentionRisk.toFixed(1)),
    };
  }
}

export const performanceAppraisalRepository = new PerformanceAppraisalRepository();
