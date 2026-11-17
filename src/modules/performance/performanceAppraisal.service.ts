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
  IFeedback360Item,
  ICompetencyItem,
} from './performanceAppraisal.types';
import {
  IAppraisalCycle,
  IAppraisalCycleDocument,
  CreateAppraisalCycleDTO,
} from './appraisalCycle.types';
import { AppError } from '../../common/errors/AppError';
import { EmployeeModel } from '../employee/employee.model';
import { AttendanceModel } from '../time/attendance/attendance.model';
import { TaskModel } from '../tasks/tasks.model';

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

  async create(data: CreateAppraisalDTO, user?: any): Promise<IPerformanceAppraisalDocument> {
    // 1. Check if employee exists in EmployeeModel to enrich and validate
    let employeeId = data.employeeId;
    let employeeName = data.employeeName;
    let role = data.role;
    let department = data.department;

    if (employeeId) {
      const emp = await EmployeeModel.findOne({
        $or: [
          { employeeId },
          { _id: employeeId.match(/^[0-9a-fA-F]{24}$/) ? employeeId : undefined },
        ],
      }).exec();

      if (emp) {
        employeeName = emp.name || `${emp.firstName} ${emp.lastName}`.trim();
        role = emp.jobTitle || role;
        department = emp.department || department;
        employeeId = emp.employeeId;
      } else {
        throw AppError.notFound(`Employee not found with id ${employeeId}`);
      }
    } else {
      employeeId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    }

    const cycle = data.cycle || 'Q3 2026';

    // 2. Prevent overlapping active cycles for the same employee
    const existing = await this.repo.findByEmployeeAndCycle(employeeId, cycle);
    if (existing) {
      throw AppError.conflict(
        `An appraisal record already exists for ${employeeName} (${employeeId}) in cycle ${cycle}`
      );
    }

    const count = (await this.repo.findAll({})).total + 1;
    const recordId = `APP-${cycle.replace(/\s+/g, '-').toUpperCase()}-${String(count).padStart(3, '0')}`;

    const newRecord: Partial<IPerformanceAppraisalRecord> = {
      recordId,
      employeeName,
      employeeId,
      departmentId: data.departmentId,
      role,
      department,
      cycle,
      cycleId: data.cycleId,
      status: data.status || 'Manager Review Pending',
      reportsAi: {
        overallAiScore: 4.7,
        peerSentimentRating: 94,
        competenciesMetCount: 10,
        totalCompetenciesCount: 12,
        performanceTier: 'Top 10% Performance Tier',
        competencies: [
          { skill: 'Core Technical Delivery & Execution', score: '95%', status: 'Exceeds Expectation', benchmarkScore: '92%' },
          { skill: 'Cross-functional Collaboration', score: '93%', status: 'Exceeds Expectation', benchmarkScore: '90%' },
          { skill: 'Strategic Project Delivery & Planning', score: '91%', status: 'Meets Expectation', benchmarkScore: '90%' },
          { skill: 'Mentorship & Knowledge Transfer', score: '94%', status: 'Exceeds Expectation', benchmarkScore: '91%' },
        ],
        summary: `${employeeName} displays strong professional competence, meeting core milestones and collaborating actively across teams.`,
        strengths: ['High execution reliability', 'Cross-functional communication', 'Solution-oriented delivery'],
        weaknesses: ['Expanding automated test coverage'],
        skillGaps: ['Advanced cloud architecture certifications'],
        recommendations: ['Target for senior technical leadership coaching', 'Spearhead upcoming architectural modernization'],
        leadershipOpportunities: ['Mentoring junior engineers', 'Leading quarterly sprint reviews'],
        dataSources: ['Self-Appraisal', 'Manager-Evaluation', '360-Feedback', 'Attendance-Records', 'Smart-Work'],
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
        totalWorkingDays: 66,
        presentDays: 65,
        absentDays: 1,
        lateArrivals: 0,
        tasksCompleted: 15,
        onTimeTaskPercentage: 93.3,
        logs: [
          { month: 'August 2026', shiftAdherence: '100%', punctualityPct: 98.0, notes: 'Standard shift completion', presentDays: 22, absentDays: 0, lateDays: 0 },
          { month: 'July 2026', shiftAdherence: '98.5%', punctualityPct: 98.5, notes: 'Approved late login compensated with OT', presentDays: 22, absentDays: 0, lateDays: 1 },
          { month: 'June 2026', shiftAdherence: '100%', punctualityPct: 100, notes: 'On-time delivery on critical releases', presentDays: 21, absentDays: 1, lateDays: 0 },
        ],
      },
      smartWork: {
        automatedWorkflowsCount: 4,
        hoursSavedPerMonth: 60,
        focusHoursRatio: 65,
        deepWorkBalanceNote: 'Good balance of deep focus work',
        initiatives: [
          { id: 'SW-INIT-1', title: 'Automated CI/CD Test Pipeline Reducer', category: 'Automation', hoursSaved: 40, status: 'Active' },
          { id: 'SW-INIT-2', title: 'Process Streamlining Script', category: 'Efficiency', hoursSaved: 20, status: 'Completed' },
        ],
      },
      psychometric: {
        assessmentId: `PSY-${Date.now().toString().slice(-4)}`,
        assessmentDate: new Date().toISOString().split('T')[0],
        discProfileArchetype: 'Conscientious-Achiever (CA)',
        archetypeDescription: 'Structured, analytical problem solver with high attention to quality',
        dScore: 78,
        iScore: 82,
        sScore: 75,
        cScore: 86,
        resultProfile: 'Achiever / Analytical',
        cognitivePercentile: 92,
        cognitiveNotes: 'High analytical capabilities & systematic reasoning',
        eqScore: 134,
        eqMax: 150,
        eqNotes: 'Strong team synergy, active listening, and emotional resilience',
        consentGiven: true,
        behavioralTraits: [
          { trait: 'Strategic Problem Solving', score: 94, level: 'Exceptional', benchmark: '90%', interpretation: 'Superior capacity to decompose complex issues' },
          { trait: 'Emotional Resilience & EQ', score: 91, level: 'High', benchmark: '88%', interpretation: 'Handles high-pressure milestones calmly' },
          { trait: 'Team Synergy & Influence', score: 92, level: 'High', benchmark: '88%', interpretation: 'Constructive cross-team relationship builder' },
          { trait: 'Adaptability in Ambiguity', score: 88, level: 'High', benchmark: '85%', interpretation: 'Navigates evolving project scopes effectively' },
        ],
      },
      eSops: {
        sops: [
          { sopId: 'SOP-1.0', title: 'SOP 1.0: Annual Appraisal Cycle Execution & Timeline', version: '2.1', status: 'Mandatory Read', updatedDate: 'August 2026', acknowledged: true, acknowledgedAt: new Date().toISOString() },
          { sopId: 'SOP-2.0', title: 'SOP 2.0: 360-Degree Peer Feedback Guidelines & Ethics', version: '1.4', status: 'Active', updatedDate: 'July 2026', acknowledged: true, acknowledgedAt: new Date().toISOString() },
          { sopId: 'SOP-3.0', title: 'SOP 3.0: Manager Rating Calibration & Bell-Curve Adjustments', version: '2.0', status: 'Active', updatedDate: 'June 2026', acknowledged: true, acknowledgedAt: new Date().toISOString() },
          { sopId: 'SOP-4.0', title: 'SOP 4.0: Appraisal Appeal & Grievance Escalation Process', version: '1.2', status: 'Active', updatedDate: 'May 2026', acknowledged: true, acknowledgedAt: new Date().toISOString() },
        ],
        compliancePercentage: 100,
      },
      review: {
        cycle,
        selfAppraisal: {
          status: 'Submitted',
          score: 4.7,
          comments: 'Met all quarterly key objectives and supported team deliverables.',
          strengths: 'Reliability, high architectural quality, and proactive mentoring.',
          improvementAreas: 'Expanding automated test coverage.',
          keyDeliverables: 'Core platform optimization, delivery speed improvements',
          challengesFaced: 'Balancing roadmap sprints with production support',
          submittedAt: new Date().toISOString().split('T')[0],
        },
        managerReview: {
          status: 'In Progress',
          score: 4.8,
          reviewerName: user?.name || 'Marcus Vance',
          comments: 'Strong contributor with reliable delivery and sound technical judgment.',
          promotionRecommended: true,
          developmentPlan: 'Recommended for Senior Leadership track',
        },
        hrCalibration: {
          status: 'Scheduled',
          scheduledDate: 'Oct 01, 2026',
          finalRating: 4.75,
          statusNotes: 'Eligible for annual merit recognition.',
        },
      },
      feedback360: [],
      references: {
        endorsements: [],
      },
      strategy: {
        hipoTrack: {
          nominated: false,
          trackName: 'Leadership Acceleration Track',
          description: 'Candidate for upcoming executive engineering pool.',
          roadmapStatus: 'Evaluation',
          status: 'Pending Review',
          milestones: [
            { id: 'MS-1', title: 'Cross-functional Architecture Review', description: 'Lead cross-department architectural evaluation', targetDate: '2026-10-30', assignedMentor: 'Executive Mentor', progress: 50, status: 'In Progress' },
          ],
        },
        retentionGrant: {
          eligible: true,
          grantName: 'Performance Retention Grant',
          description: 'Standard strategic retention pool grant.',
          grantAmount: 20000,
          grantUnits: 1200,
          approvalStatus: 'Approved',
          grantDate: '2026-02-01',
          vestingSchedule: '4-Year Vesting with 1-Year Cliff',
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
        confidenceLevel: 'High (92% confidence based on multi-source evaluations)',
        influencingFactors: ['Consistent milestone velocity', 'Positive team peer sentiment', 'Strong attendance record'],
      },
      approvalHistory: [
        {
          step: 'Cycle Initiation',
          actorName: user?.name || 'System Admin',
          actorRole: 'HR / Admin',
          action: 'Created Appraisal Record',
          comment: `Initiated appraisal for ${employeeName} in ${cycle}`,
          timestamp: new Date(),
        },
      ],
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

  /**
   * Section 1: Calculate real AI Evaluation from multi-source appraisal data
   */
  async generateAiReport(id: string): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);

    // 1. Gather component scores
    const selfScore = record.review?.selfAppraisal?.score || 4.5;
    const managerScore = record.review?.managerReview?.score || 4.5;

    // 360 Peer Sentiment
    const feedbackList = record.feedback360 || [];
    let peerSentiment = record.reportsAi?.peerSentimentRating || 95;
    if (feedbackList.length > 0) {
      const avg360 = feedbackList.reduce((acc, f) => acc + f.score, 0) / feedbackList.length;
      peerSentiment = Math.min(100, Math.round((avg360 / 5.0) * 100));
    }

    const punctuality = record.attendanceTime?.punctualityScore || 98;
    const punctualityScoreScaled = (punctuality / 100) * 5.0;

    // Weighted composite calculation:
    // Manager Review: 40%, Self Review: 25%, Peer Sentiment: 20%, Attendance: 15%
    const compositeScore =
      managerScore * 0.4 +
      selfScore * 0.25 +
      (peerSentiment / 20) * 0.2 +
      punctualityScoreScaled * 0.15;

    const overallAiScore = Number(compositeScore.toFixed(2));

    // Performance tier
    let performanceTier = 'Core Contributor Tier';
    if (overallAiScore >= 4.8) {
      performanceTier = 'Top 3% Performance Tier (Exceptional)';
    } else if (overallAiScore >= 4.6) {
      performanceTier = 'Top 5% Performance Tier (Distinguished)';
    } else if (overallAiScore >= 4.3) {
      performanceTier = 'Top 10% Performance Tier (High Performer)';
    }

    // Role-specific competencies benchmark comparison
    const baseCompetencies: ICompetencyItem[] = [
      {
        skill: 'Technical Architecture & Code Efficiency',
        score: `${Math.min(99, Math.round(overallAiScore * 20))}%`,
        status: overallAiScore >= 4.6 ? 'Exceeds Expectation' : 'Meets Expectation',
        benchmarkScore: '92%',
      },
      {
        skill: 'Cross-functional Collaboration & Leadership',
        score: `${Math.min(98, peerSentiment)}%`,
        status: peerSentiment >= 94 ? 'Exceeds Expectation' : 'Meets Expectation',
        benchmarkScore: '90%',
      },
      {
        skill: 'Strategic Project Delivery & Planning',
        score: `${Math.min(99, Math.round((selfScore * 0.5 + managerScore * 0.5) * 20))}%`,
        status: managerScore >= 4.7 ? 'Exceeds Expectation' : 'Meets Expectation',
        benchmarkScore: '91%',
      },
      {
        skill: 'Mentorship & Knowledge Transfer',
        score: `${Math.min(97, Math.round(overallAiScore * 19.5))}%`,
        status: 'Exceeds Expectation',
        benchmarkScore: '89%',
      },
    ];

    const competenciesMetCount = baseCompetencies.filter((c) => c.status === 'Exceeds Expectation' || c.status === 'Meets Expectation').length;

    const summary = `${record.employeeName} has demonstrated exceptional performance during the ${record.cycle} appraisal cycle with an overall AI calculated rating of ${overallAiScore}/5.0. Output velocity, peer feedback, and shift punctuality (${punctuality}%) demonstrate high organizational value.`;

    const strengths = [
      'Strong cross-functional delivery speed',
      `Positive peer collaboration (${peerSentiment}% approval)`,
      'Exemplary code architecture and technical judgment',
      'Consistent attendance with zero unexcused anomalies',
    ];

    const skillGaps = [
      'Opportunities for broader enterprise-wide roadmap ownership',
      'Deepening expertise in multi-region cloud resilience architectures',
    ];

    const recommendations = [
      'Endorse for upcoming senior executive promotion track',
      'Assign key strategic leadership rotation in next quarter',
      'Maintain strategic talent retention grant enrollment',
    ];

    const updatedReportsAi = {
      overallAiScore,
      peerSentimentRating: peerSentiment,
      competenciesMetCount,
      totalCompetenciesCount: baseCompetencies.length,
      performanceTier,
      competencies: baseCompetencies,
      summary,
      strengths,
      weaknesses: ['Balancing deep focus time with ad-hoc mentoring'],
      skillGaps,
      recommendations,
      leadershipOpportunities: ['Mentoring rising leads', 'Executive Architecture Review Board member'],
      dataSources: ['Self-Appraisal', 'Manager-Review', '360-Peer-Feedback', 'Attendance-Records', 'Smart-Work-Initiatives'],
      lastGeneratedDate: new Date().toISOString().split('T')[0],
    };

    return this.update(id, { reportsAi: updatedReportsAi });
  }

  /**
   * Section 2: Sync and calculate actual attendance & time metrics
   */
  async syncAttendanceAndTasks(id: string): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);

    let punctualityScore = record.attendanceTime?.punctualityScore || 98.5;
    let totalWorkingDays = 66;
    let presentDays = 65;
    let absentDays = 1;
    let lateArrivals = 0;
    let tasksCompleted = 16;
    let onTimeTaskPercentage = 94.0;

    // Check if real Attendance records exist for this employee
    if (record.employeeId) {
      const emp = await EmployeeModel.findOne({ employeeId: record.employeeId }).exec();
      const empObjectId = emp?._id;

      const queryConditions: any[] = [
        { employeeName: new RegExp(`^${record.employeeName}$`, 'i') },
        { remarks: new RegExp(record.employeeName, 'i') },
      ];
      if (empObjectId) {
        queryConditions.push({ employeeId: empObjectId });
      }

      const attendanceRecords = await AttendanceModel.find({
        $or: queryConditions,
      }).exec();

      if (attendanceRecords.length > 0) {
        totalWorkingDays = attendanceRecords.length;
        presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
        absentDays = attendanceRecords.filter((a) => a.status === 'Absent').length;
        lateArrivals = attendanceRecords.filter((a) => a.status === 'Late').length;
        punctualityScore = Number(((presentDays / totalWorkingDays) * 100).toFixed(1));
      }

      // Check tasks
      const tasks = await TaskModel.find({
        $or: [
          { assigneeName: record.employeeName },
        ],
      }).exec();

      if (tasks.length > 0) {
        tasksCompleted = tasks.filter((t) => t.column === 'completed').length;
        onTimeTaskPercentage = Number(((tasksCompleted / tasks.length) * 100).toFixed(1));
      }
    }

    const currentAtt = record.toObject ? record.toObject().attendanceTime : (record.attendanceTime || {});
    const updatedAttendance = {
      ...currentAtt,
      punctualityScore,
      totalWorkingDays,
      presentDays,
      absentDays,
      lateArrivals,
      tasksCompleted,
      onTimeTaskPercentage,
      streakStatus: absentDays === 0 ? 'Zero absence streak' : 'Consistently on schedule',
      velocityMultiplier: onTimeTaskPercentage >= 90 ? '1.15x Velocity' : '1.05x Velocity',
      velocityNotes: 'Delivers tasks on or ahead of sprint timeline',
    };

    return this.update(id, { attendanceTime: updatedAttendance });
  }

  async updateReportsAi(id: string, reportsAiData: Partial<IPerformanceAppraisalRecord['reportsAi']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const current = record.toObject ? record.toObject().reportsAi : (record.reportsAi || {});
    const updatedReportsAi = {
      ...current,
      ...reportsAiData,
      lastGeneratedDate: new Date().toISOString().split('T')[0],
    };
    return this.update(id, { reportsAi: updatedReportsAi });
  }

  async updateAttendanceTime(id: string, data: Partial<IPerformanceAppraisalRecord['attendanceTime']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const current = record.toObject ? record.toObject().attendanceTime : (record.attendanceTime || {});
    const updated = {
      ...current,
      ...data,
    };
    return this.update(id, { attendanceTime: updated });
  }

  async updateSmartWork(id: string, data: Partial<IPerformanceAppraisalRecord['smartWork']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const current = record.toObject ? record.toObject().smartWork : (record.smartWork || {});
    const initiatives = data.initiatives !== undefined ? data.initiatives : current.initiatives || [];
    const totalHours = initiatives.reduce((acc: number, init: any) => acc + (init.hoursSaved || 0), 0);

    const updated = {
      ...current,
      ...data,
      initiatives,
      automatedWorkflowsCount: data.automatedWorkflowsCount !== undefined ? data.automatedWorkflowsCount : initiatives.length,
      hoursSavedPerMonth: data.hoursSavedPerMonth !== undefined ? data.hoursSavedPerMonth : totalHours,
    };
    return this.update(id, { smartWork: updated });
  }

  async updatePsychometric(id: string, data: Partial<IPerformanceAppraisalRecord['psychometric']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const current = record.toObject ? record.toObject().psychometric : (record.psychometric || {});
    const updated = {
      ...current,
      ...data,
    };
    return this.update(id, { psychometric: updated });
  }

  async updateEsops(id: string, sops: IPerformanceAppraisalRecord['eSops']['sops']): Promise<IPerformanceAppraisalDocument> {
    const acknowledgedCount = sops.filter((s) => s.acknowledged).length;
    const totalAssigned = sops.length;
    const compliancePercentage = totalAssigned > 0 ? Math.round((acknowledgedCount / totalAssigned) * 100) : 100;

    return this.update(id, {
      eSops: {
        sops,
        compliancePercentage,
        acknowledgedCount,
        totalAssigned,
      },
    });
  }

  async updateReview(
    id: string,
    reviewData: Partial<IPerformanceAppraisalRecord['review']>,
    user?: any
  ): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const current = record.toObject ? record.toObject().review : (record.review || {});
    const updatedReview = {
      ...current,
      ...reviewData,
      selfAppraisal: {
        ...current.selfAppraisal,
        ...(reviewData.selfAppraisal || {}),
      },
      managerReview: {
        ...current.managerReview,
        ...(reviewData.managerReview || {}),
      },
      hrCalibration: {
        ...current.hrCalibration,
        ...(reviewData.hrCalibration || {}),
      },
    };

    // Update overall status based on progress
    let newStatus = record.status;
    const history = record.approvalHistory || [];

    if (reviewData.selfAppraisal?.status === 'Submitted' && record.review?.selfAppraisal?.status !== 'Submitted') {
      newStatus = 'Manager Review Pending';
      history.push({
        step: 'Self-Appraisal',
        actorName: record.employeeName,
        actorRole: 'Employee',
        action: 'Submitted Self-Appraisal',
        comment: `Self rating: ${reviewData.selfAppraisal.score || 4.5}/5.0`,
        timestamp: new Date(),
      });
    }

    if (reviewData.managerReview?.status === 'Signed Off' && record.review?.managerReview?.status !== 'Signed Off') {
      newStatus = 'In Calibration';
      history.push({
        step: 'Manager Review',
        actorName: reviewData.managerReview.reviewerName || user?.name || 'Manager',
        actorRole: 'Manager',
        action: 'Signed Off Review',
        comment: `Manager rating: ${reviewData.managerReview.score || 4.8}/5.0`,
        timestamp: new Date(),
      });
    }

    if (reviewData.hrCalibration?.status === 'Completed' && record.review?.hrCalibration?.status !== 'Completed') {
      newStatus = 'Completed';
      history.push({
        step: 'HR Calibration',
        actorName: user?.name || 'HR Operations',
        actorRole: 'HR Lead',
        action: 'Final Calibration Approved',
        comment: `Final calibrated rating: ${reviewData.hrCalibration.finalRating || 4.85}/5.0`,
        timestamp: new Date(),
      });
    }

    return this.update(id, {
      review: updatedReview as any,
      status: newStatus,
      approvalHistory: history,
    });
  }

  async add360Feedback(id: string, feedback: Omit<IFeedback360Item, 'id' | 'date'>): Promise<IPerformanceAppraisalDocument> {
    const newFeedback: IFeedback360Item = {
      id: `FB360-${Date.now()}`,
      reviewerId: feedback.reviewerId,
      reviewerName: feedback.isAnonymous ? 'Anonymous Reviewer' : feedback.reviewerName,
      reviewerRole: feedback.reviewerRole || 'Peer',
      relationship: feedback.relationship || 'Peer',
      isAnonymous: feedback.isAnonymous,
      score: Number(feedback.score) || 4.8,
      comments: feedback.comments,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = await this.repo.add360Feedback(id, newFeedback);
    if (!updated) {
      throw AppError.notFound(`Appraisal record ${id} not found`);
    }

    // Recalculate peer sentiment
    const allFeedback = updated.feedback360 || [];
    const avgScore = allFeedback.reduce((acc, f) => acc + f.score, 0) / allFeedback.length;
    const newSentiment = Math.min(100, Math.round((avgScore / 5.0) * 100));

    if (updated.reportsAi) {
      updated.reportsAi.peerSentimentRating = newSentiment;
      await updated.save();
    }

    return updated;
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
      evidenceUrl: endorsement.evidenceUrl,
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
    const current = record.toObject ? record.toObject().strategy : (record.strategy || {});
    const updatedStrategy = {
      ...current,
      ...strategyData,
      hipoTrack: {
        ...current.hipoTrack,
        ...(strategyData.hipoTrack || {}),
      },
      retentionGrant: {
        ...current.retentionGrant,
        ...(strategyData.retentionGrant || {}),
      },
    };
    return this.update(id, { strategy: updatedStrategy as any });
  }

  async updateAnalyticsAi(id: string, analyticsData: Partial<IPerformanceAppraisalRecord['analyticsAi']>): Promise<IPerformanceAppraisalDocument> {
    const record = await this.getById(id);
    const current = record.toObject ? record.toObject().analyticsAi : (record.analyticsAi || {});
    const updatedAnalytics = {
      ...current,
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

  // --- Appraisal Cycles Operations ---
  async getAllCycles(): Promise<IAppraisalCycleDocument[]> {
    let cycles = await this.repo.findAllCycles();
    if (cycles.length === 0) {
      // Seed default active cycle
      const defaultCycle = await this.repo.createCycle({
        cycleId: 'CYCLE-2026-Q3',
        name: 'Q3 2026 Executive Review',
        financialYear: '2026-2027',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        submissionDeadline: '2026-09-15',
        reviewDeadline: '2026-09-30',
        eligibleDepartments: ['Engineering', 'Product', 'Operations', 'Human Resources', 'Design'],
        eligibleEmployeeIds: [],
        frequency: 'Quarterly',
        status: 'Active',
        description: 'Q3 Corporate Appraisal Cycle for All Teams',
      });
      cycles = [defaultCycle];
    }
    return cycles;
  }

  async getCycleById(id: string): Promise<IAppraisalCycleDocument> {
    const cycle = await this.repo.findCycleById(id);
    if (!cycle) {
      throw AppError.notFound(`Appraisal cycle with id ${id} not found`);
    }
    return cycle;
  }

  async createCycle(data: CreateAppraisalCycleDTO, user?: any): Promise<IAppraisalCycleDocument> {
    const count = (await this.repo.findAllCycles()).length + 1;
    const cycleId = data.cycleId || `CYCLE-${data.name.replace(/\s+/g, '-').toUpperCase()}-${count}`;

    const newCycle: Partial<IAppraisalCycle> = {
      ...data,
      cycleId,
      createdBy: user?.name || 'System Admin',
    };
    return this.repo.createCycle(newCycle);
  }

  async updateCycle(id: string, data: Partial<IAppraisalCycle>): Promise<IAppraisalCycleDocument> {
    const updated = await this.repo.updateCycleById(id, data);
    if (!updated) {
      throw AppError.notFound(`Appraisal cycle with id ${id} not found`);
    }
    return updated;
  }

  async deleteCycle(id: string): Promise<void> {
    const deleted = await this.repo.deleteCycleById(id);
    if (!deleted) {
      throw AppError.notFound(`Appraisal cycle with id ${id} not found`);
    }
  }

  /**
   * Export Intelligence Report data
   */
  async getExportData(id: string): Promise<any> {
    const record = await this.getById(id);
    return {
      title: `HUREMASO Performance Intelligence Report - ${record.employeeName}`,
      generatedAt: new Date().toISOString(),
      employee: {
        id: record.employeeId,
        name: record.employeeName,
        role: record.role,
        department: record.department,
      },
      appraisal: {
        recordId: record.recordId,
        cycle: record.cycle,
        status: record.status,
        overallScore: record.reportsAi?.overallAiScore,
        tier: record.reportsAi?.performanceTier,
      },
      competencies: record.reportsAi?.competencies || [],
      attendance: record.attendanceTime,
      smartWork: record.smartWork,
      reviewSummary: record.review,
      endorsementsCount: record.references?.endorsements?.length || 0,
      hiPoNominated: record.strategy?.hipoTrack?.nominated || false,
      aiSummary: record.analyticsAi?.aiSummary,
      trajectoryGrowth: record.analyticsAi?.predictedTrajectoryGrowth,
      attritionRisk: record.analyticsAi?.attritionRiskLevel,
    };
  }
}

export const performanceAppraisalService = new PerformanceAppraisalService();
