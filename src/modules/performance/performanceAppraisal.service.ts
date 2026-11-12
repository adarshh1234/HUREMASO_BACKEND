import {
  performanceAppraisalRepository,
  PerformanceAppraisalRepository,
} from './performanceAppraisal.repository';
import {
  CreateAppraisalDTO,
  AppraisalQueryParams,
  IPerformanceAppraisalRecord,
  IPerformanceAppraisalDocument,
  AppraisalReportsSummary,
  IEndorsementItem,
} from './performanceAppraisal.types';
import { AppError } from '../../common/errors/AppError';

export class PerformanceAppraisalService {
  constructor(private repo: PerformanceAppraisalRepository = performanceAppraisalRepository) {}

  async getAll(params: AppraisalQueryParams): Promise<{ items: IPerformanceAppraisalDocument[]; total: number }> {
    return this.repo.findAll(params);
  }

  async getById(id: string): Promise<IPerformanceAppraisalDocument> {
    const record = await this.repo.findById(id);
    if (!record) {
      throw AppError.notFound(`Performance appraisal record with id ${id} not found`);
    }
    return record;
  }

  async create(data: CreateAppraisalDTO): Promise<IPerformanceAppraisalDocument> {
    const count = (await this.repo.findAll({})).total + 1;
    const recordId = `APP-2026-Q3-${String(count).padStart(3, '0')}`;

    const newRecord: Partial<IPerformanceAppraisalRecord> = {
      recordId,
      employeeName: data.employeeName,
      employeeId: data.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      role: data.role,
      department: data.department,
      cycle: data.cycle || 'Q3 2026',
      status: data.status || 'Manager Review Pending',
      reportsAi: {
        overallAiScore: 4.7,
        peerSentimentRating: 94,
        competenciesMetCount: 10,
        totalCompetenciesCount: 12,
        performanceTier: 'Top 10% Performance Tier',
        competencies: [
          { skill: 'Core Technical Delivery', score: '95%', status: 'Exceeds Expectation', benchmarkScore: '92%' },
          { skill: 'Team Collaboration', score: '93%', status: 'Exceeds Expectation', benchmarkScore: '90%' },
        ],
        lastGeneratedDate: new Date().toISOString().split('T')[0],
      },
      attendanceTime: {
        punctualityScore: 98.0,
        streakStatus: 'Consistent on-time attendance',
        overtimeHoursPerMonth: 8.0,
        overtimeContribution: 'Sprint milestone support',
        velocityMultiplier: '1.10x Velocity',
        velocityNotes: 'On schedule delivery',
        attendanceImpactScore: 95,
        logs: [
          { month: 'Current Month', shiftAdherence: '100%', punctualityPct: 98.0, notes: 'Standard shift completion' },
        ],
      },
      smartWork: {
        automatedWorkflowsCount: 4,
        hoursSavedPerMonth: 60,
        focusHoursRatio: 65,
        deepWorkBalanceNote: 'Good balance of deep focus work',
        initiatives: [
          { id: 'SW-NEW-1', title: 'Process Optimization', category: 'Efficiency', hoursSaved: 20, status: 'Active' },
        ],
      },
      psychometric: {
        discProfileArchetype: 'Conscientious-Achiever (CA)',
        archetypeDescription: 'Structured, analytical problem solver',
        cognitivePercentile: 90,
        cognitiveNotes: 'High analytical capabilities',
        eqScore: 132,
        eqMax: 150,
        eqNotes: 'Good team synergy and emotional resilience',
        behavioralTraits: [
          { trait: 'Execution Speed', score: 92, level: 'High' },
          { trait: 'Collaboration', score: 90, level: 'High' },
        ],
      },
      eSops: {
        sops: [
          { sopId: 'SOP-1.0', title: 'SOP 1.0: Annual Appraisal Cycle Execution & Timeline', version: '2.1', status: 'Active', updatedDate: 'August 2026', acknowledged: true },
        ],
      },
      review: {
        cycle: data.cycle || 'Q3 2026',
        selfAppraisal: {
          status: 'Submitted',
          score: 4.7,
          comments: 'Met all quarterly key objectives.',
          strengths: 'Reliability and technical competence.',
          improvementAreas: 'Strategic leadership.',
          submittedAt: new Date().toISOString().split('T')[0],
        },
        managerReview: {
          status: 'In Progress',
          score: 4.8,
          reviewerName: 'Marcus Vance',
          comments: 'Strong contributor with reliable delivery.',
        },
        hrCalibration: {
          status: 'Scheduled',
          scheduledDate: 'Oct 01, 2026',
          finalRating: 4.75,
          statusNotes: 'Eligible for annual merit increment.',
        },
      },
      references: {
        endorsements: [],
      },
      strategy: {
        hipoTrack: {
          nominated: false,
          trackName: 'Leadership Acceleration Track',
          description: 'Candidate for upcoming leadership pool.',
          roadmapStatus: 'Evaluation',
          status: 'Pending Review',
        },
        retentionGrant: {
          eligible: true,
          grantName: 'Performance Retention Grant',
          description: 'Standard retention pool grant.',
          vestingStatus: 'Active',
          agreementExpiry: '2027-12-31',
        },
      },
      analyticsAi: {
        predictedTrajectoryGrowth: '+15% Growth',
        trajectoryGrowthTier: 'High Growth Potential',
        attritionRiskPct: 2.8,
        attritionRiskLevel: 'Low (2.8%)',
        retentionLikelihood: 'High Retention Likelihood',
        leadershipReadinessScore: 88,
        promotionReadiness: 'Targeted for next promotion cycle',
        aiSummary: 'Strong performer with consistent output and positive peer sentiment.',
      },
    };

    return this.repo.create(newRecord);
  }

  async update(id: string, data: Partial<IPerformanceAppraisalRecord>): Promise<IPerformanceAppraisalDocument> {
    const updated = await this.repo.updateById(id, data);
    if (!updated) {
      throw AppError.notFound(`Performance appraisal record with id ${id} not found`);
    }
    return updated;
  }

  async updateReportsAi(id: string, reportsAiData: Partial<IPerformanceAppraisalRecord['reportsAi']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updatedReportsAi = {
      ...record.reportsAi,
      ...reportsAiData,
      lastGeneratedDate: new Date().toISOString().split('T')[0],
    };
    return this.update(id, { reportsAi: updatedReportsAi });
  }

  async updateAttendanceTime(id: string, data: Partial<IPerformanceAppraisalRecord['attendanceTime']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updated = {
      ...record.attendanceTime,
      ...data,
    };
    return this.update(id, { attendanceTime: updated });
  }

  async updateSmartWork(id: string, data: Partial<IPerformanceAppraisalRecord['smartWork']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updated = {
      ...record.smartWork,
      ...data,
    };
    return this.update(id, { smartWork: updated });
  }

  async updatePsychometric(id: string, data: Partial<IPerformanceAppraisalRecord['psychometric']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updated = {
      ...record.psychometric,
      ...data,
    };
    return this.update(id, { psychometric: updated });
  }

  async updateEsops(id: string, sops: IPerformanceAppraisalRecord['eSops']['sops']): Promise<IPerformanceAppraisalDocument> {
    return this.update(id, { eSops: { sops } });
  }

  async updateReview(id: string, reviewData: Partial<IPerformanceAppraisalRecord['review']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updatedReview = {
      ...record.review,
      ...reviewData,
      selfAppraisal: {
        ...record.review?.selfAppraisal,
        ...(reviewData.selfAppraisal || {}),
      },
      managerReview: {
        ...record.review?.managerReview,
        ...(reviewData.managerReview || {}),
      },
      hrCalibration: {
        ...record.review?.hrCalibration,
        ...(reviewData.hrCalibration || {}),
      },
    };
    return this.update(id, { review: updatedReview as any });
  }

  async addEndorsement(id: string, endorsement: Omit<IEndorsementItem, 'id' | 'date'> & { date?: string }): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const newEndorsement: IEndorsementItem = {
      id: `REF-${Date.now()}`,
      from: endorsement.from,
      role: endorsement.role || 'Colleague',
      text: endorsement.text,
      date: endorsement.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      recommendationType: endorsement.recommendationType || 'Promotion',
      verified: endorsement.verified ?? true,
    };

    const currentEndorsements = record.references?.endorsements || [];
    return this.update(id, {
      references: {
        endorsements: [newEndorsement, ...currentEndorsements],
      },
    });
  }

  async updateStrategy(id: string, strategyData: Partial<IPerformanceAppraisalRecord['strategy']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updatedStrategy = {
      ...record.strategy,
      ...strategyData,
    };
    return this.update(id, { strategy: updatedStrategy as any });
  }

  async updateAnalyticsAi(id: string, analyticsData: Partial<IPerformanceAppraisalRecord['analyticsAi']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const updatedAnalytics = {
      ...record.analyticsAi,
      ...analyticsData,
    };
    return this.update(id, { analyticsAi: updatedAnalytics });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) {
      throw AppError.notFound(`Performance appraisal record with id ${id} not found`);
    }
  }

  async getReportsSummary(): Promise<AppraisalReportsSummary> {
    return this.repo.getReportsSummary();
  }
}

export const performanceAppraisalService = new PerformanceAppraisalService();
