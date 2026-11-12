import {
  FlightRiskModel,
  SkillGapModel,
  DevelopmentRecommendationModel,
  AIConversationModel,
  ComplianceRecordModel,
} from './ai.model';
import {
  IFlightRisk,
  IFlightRiskDocument,
  ISkillGap,
  ISkillGapDocument,
  IDevelopmentRecommendation,
  IDevelopmentRecommendationDocument,
  IAIConversationDocument,
  IComplianceRecord,
  IComplianceRecordDocument,
  IWorkforceAnalyticsSummary,
  IEmployeeSentimentMetrics,
} from './ai.types';

export class AIRepository {
  async seedInitialDataIfEmpty(): Promise<void> {
    const flightRiskCount = await FlightRiskModel.countDocuments();
    if (flightRiskCount === 0) {
      const initialFlightRisks: Partial<IFlightRisk>[] = [
        {
          employeeId: 'EMP-1042',
          employeeName: 'Sarah Joseph',
          department: 'Engineering',
          jobTitle: 'Senior Frontend Developer',
          riskLevel: 'High',
          riskScore: 78,
          indicators: [
            { factor: 'Extended Tenure Without Band Promotion', weight: 35, description: 'Over 28 months in same level' },
            { factor: 'Recent Surge in Weekend Deployments', weight: 25, description: '42+ hrs overtime recorded' },
            { factor: 'Market Demand for React/Next.js Specialists', weight: 18, description: 'High external recruiter outreach' },
          ],
          recommendedActions: [
            'Propose Senior Staff Frontend Engineer promotion track',
            'Conduct quarterly retention compensation adjustment review',
            'Pair on strategic Cloud Architecture initiative',
          ],
          status: 'Open',
          notes: 'High-performing contributor requiring senior mentorship.',
        },
        {
          employeeId: 'EMP-1088',
          employeeName: 'Marcus Vance',
          department: 'Product Design',
          jobTitle: 'Lead UX Designer',
          riskLevel: 'High',
          riskScore: 74,
          indicators: [
            { factor: 'Cross-Department Workload Saturation', weight: 40, description: 'Assigned across 5 parallel project streams' },
            { factor: 'Reduced Appraisal Engagement Score', weight: 34, description: 'Dropped from 4.8 to 3.6 rating' },
          ],
          recommendedActions: [
            'Re-balance design allocations and offload redundant tasks',
            'Schedule retention 1-on-1 with Chief Product Officer',
          ],
          status: 'Mitigating',
          notes: 'Active workload realignment underway.',
        },
        {
          employeeId: 'EMP-1015',
          employeeName: 'Elena Rostova',
          department: 'Recruitment',
          jobTitle: 'Senior Talent Partner',
          riskLevel: 'High',
          riskScore: 72,
          indicators: [
            { factor: 'High Hiring Target Compression', weight: 38, description: 'Q3 target volume doubled' },
            { factor: 'Consecutive Overtime Logged', weight: 34, description: 'High weekly fatigue index' },
          ],
          recommendedActions: [
            'Assign recruitment sourcer assistant to balance load',
            'Grant extra restorative wellness compensatory leave',
          ],
          status: 'Open',
          notes: 'Candidate pipeline overload identified.',
        },
        {
          employeeId: 'EMP-1064',
          employeeName: 'Devon Patel',
          department: 'Sales',
          jobTitle: 'Enterprise Account Executive',
          riskLevel: 'High',
          riskScore: 71,
          indicators: [
            { factor: 'Territory Reallocation Discontent', weight: 40, description: 'New territory assignment in Q2' },
            { factor: 'Bonus Target Realignment Discrepancy', weight: 31, description: 'Incentive calculation inquiry' },
          ],
          recommendedActions: [
            'Review incentive plan with VP of Sales',
            'Grant tier accelerator on tier-1 closed enterprise accounts',
          ],
          status: 'Open',
          notes: 'Compensation review pending.',
        },
      ];

      await FlightRiskModel.insertMany(initialFlightRisks);
    }

    const skillGapCount = await SkillGapModel.countDocuments();
    if (skillGapCount === 0) {
      const initialSkillGaps: Partial<ISkillGap>[] = [
        {
          department: 'Engineering',
          skillName: 'React & Next.js Skill Density',
          category: 'Technical',
          targetCompetencyScore: 90,
          currentTeamScore: 88,
          gapPercentage: 2,
          readinessLevel: 88,
          requiredStaffCount: 12,
          qualifiedStaffCount: 11,
          upskillingRecommended: false,
          notes: 'Team readiness is optimal at 88%. Ongoing masterclasses sufficient.',
        },
        {
          department: 'Engineering',
          skillName: 'Cloud AI & LLM Engineering',
          category: 'Technical',
          targetCompetencyScore: 90,
          currentTeamScore: 65,
          gapPercentage: 25,
          readinessLevel: 65,
          requiredStaffCount: 10,
          qualifiedStaffCount: 6,
          upskillingRecommended: true,
          notes: '65% Team Readiness. Upskilling & cloud certification recommended.',
        },
        {
          department: 'Product',
          skillName: 'AI Product Management & Prompt Ops',
          category: 'Domain',
          targetCompetencyScore: 85,
          currentTeamScore: 68,
          gapPercentage: 17,
          readinessLevel: 72,
          requiredStaffCount: 6,
          qualifiedStaffCount: 4,
          upskillingRecommended: true,
          notes: 'Upskilling suggested for upcoming generative features.',
        },
      ];

      await SkillGapModel.insertMany(initialSkillGaps);
    }

    const devRecCount = await DevelopmentRecommendationModel.countDocuments();
    if (devRecCount === 0) {
      const initialDevRecs: Partial<IDevelopmentRecommendation>[] = [
        {
          employeeId: 'EMP-1042',
          employeeName: 'Sarah Joseph',
          department: 'Engineering',
          skillName: 'Cloud AI & LLM Engineering',
          recommendationTitle: 'AWS Certified AI Practitioner & LLM Fine-Tuning Bootcamp',
          recommendationType: 'Course',
          priority: 'High',
          status: 'In Progress',
          completionProgress: 45,
          targetCompletionDate: 'October 30, 2026',
          assignedBy: 'Autonomous Skill Engine',
          notes: 'Enrolled via corporate learning budget.',
        },
        {
          employeeId: 'EMP-1088',
          employeeName: 'Marcus Vance',
          department: 'Product Design',
          skillName: 'Generative UI & Design Systems',
          recommendationTitle: 'Design Token Automation with Figma & AI Tokens',
          recommendationType: 'Certification',
          priority: 'Medium',
          status: 'Suggested',
          completionProgress: 0,
          targetCompletionDate: 'November 15, 2026',
          assignedBy: 'Autonomous Skill Engine',
          notes: 'Recommended for design system scaling.',
        },
      ];

      await DevelopmentRecommendationModel.insertMany(initialDevRecs);
    }

    const complianceCount = await ComplianceRecordModel.countDocuments();
    if (complianceCount === 0) {
      const initialCompliance: Partial<IComplianceRecord>[] = [
        {
          complianceCode: 'CMP-IND-01',
          title: 'Indian Labour Laws & Employment Standards Act',
          category: 'Labor Law',
          jurisdiction: 'India (Central & State)',
          status: 'Audit Ready',
          auditScore: 100,
          discrepanciesCount: 0,
          lastAuditedAt: new Date().toISOString(),
          nextDeadline: 'December 31, 2026',
          description: 'Comprehensive compliance covering statutory working hours, leaves, and overtime wage registers.',
          autoScanEnabled: true,
          affectedEmployeesCount: 145,
          remediationSteps: [],
        },
        {
          complianceCode: 'CMP-IND-02',
          title: 'Maternity Benefit Act (Amendment)',
          category: 'Statutory',
          jurisdiction: 'India & Global Sub-entities',
          status: 'Audit Ready',
          auditScore: 100,
          discrepanciesCount: 0,
          lastAuditedAt: new Date().toISOString(),
          nextDeadline: 'Annual Recurring',
          description: 'Statutory 26 weeks paid maternity leave, crèche facility accessibility, and nursing break verification.',
          autoScanEnabled: true,
          affectedEmployeesCount: 62,
          remediationSteps: [],
        },
        {
          complianceCode: 'CMP-IND-03',
          title: 'Prevention of Sexual Harassment (POSH) Act',
          category: 'Internal Policy',
          jurisdiction: 'All Operating Offices',
          status: 'Audit Ready',
          auditScore: 100,
          discrepanciesCount: 0,
          lastAuditedAt: new Date().toISOString(),
          nextDeadline: 'Quarterly Internal Committee Review',
          description: 'Mandatory annual employee sensitization, Internal Committee (IC) constitution, and annual return filing.',
          autoScanEnabled: true,
          affectedEmployeesCount: 145,
          remediationSteps: [],
        },
        {
          complianceCode: 'CMP-IND-04',
          title: 'Provident Fund (EPF) & ESI Statutory Filings',
          category: 'Statutory',
          jurisdiction: 'India Central EPFO / ESIC',
          status: 'Compliant',
          auditScore: 100,
          discrepanciesCount: 0,
          lastAuditedAt: new Date().toISOString(),
          nextDeadline: 'Monthly (15th of next month)',
          description: 'Automated ECR file generation, challan verification, and individual member UAN wage reconciliation.',
          autoScanEnabled: true,
          affectedEmployeesCount: 145,
          remediationSteps: [],
        },
      ];

      await ComplianceRecordModel.insertMany(initialCompliance);
    }
  }

  // ================= 1. FLIGHT RISK REPOSITORY =================

  async getFlightRisks(filter: Record<string, any> = {}, skip = 0, limit = 10): Promise<{ items: IFlightRiskDocument[]; total: number }> {
    await this.seedInitialDataIfEmpty();
    const [items, total] = await Promise.all([
      FlightRiskModel.find(filter).sort({ riskScore: -1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      FlightRiskModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async getFlightRiskById(id: string): Promise<IFlightRiskDocument | null> {
    await this.seedInitialDataIfEmpty();
    return FlightRiskModel.findById(id).exec();
  }

  async createFlightRisk(data: Partial<IFlightRisk>): Promise<IFlightRiskDocument> {
    return FlightRiskModel.create(data);
  }

  async updateFlightRisk(id: string, data: Partial<IFlightRisk>): Promise<IFlightRiskDocument | null> {
    return FlightRiskModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async deleteFlightRisk(id: string): Promise<IFlightRiskDocument | null> {
    return FlightRiskModel.findByIdAndDelete(id).exec();
  }

  async getWorkforceAnalyticsSummary(): Promise<IWorkforceAnalyticsSummary> {
    await this.seedInitialDataIfEmpty();

    const [highCount, medCount, lowCount, totalCount] = await Promise.all([
      FlightRiskModel.countDocuments({ riskLevel: 'High', status: { $in: ['Open', 'Mitigating'] } }),
      FlightRiskModel.countDocuments({ riskLevel: 'Medium', status: { $in: ['Open', 'Mitigating'] } }),
      FlightRiskModel.countDocuments({ riskLevel: 'Low', status: { $in: ['Open', 'Mitigating'] } }),
      FlightRiskModel.countDocuments(),
    ]);

    return {
      projectedTurnoverRate: 2.1,
      industryTurnoverBenchmark: 5.0,
      retentionScore: 94.2,
      workforceHealthIndex: 92,
      totalEmployeesEvaluated: totalCount || 145,
      highRiskCount: highCount || 4,
      mediumRiskCount: medCount || 2,
      lowRiskCount: lowCount || 1,
      departmentRiskDistribution: {
        Engineering: { high: 1, medium: 1, low: 0 },
        'Product Design': { high: 1, medium: 0, low: 0 },
        Recruitment: { high: 1, medium: 0, low: 0 },
        Sales: { high: 1, medium: 1, low: 1 },
      },
    };
  }

  // ================= 2. SKILL GAP REPOSITORY =================

  async getSkillGaps(): Promise<ISkillGapDocument[]> {
    await this.seedInitialDataIfEmpty();
    return SkillGapModel.find().sort({ gapPercentage: -1 }).exec();
  }

  async getSkillGapById(id: string): Promise<ISkillGapDocument | null> {
    return SkillGapModel.findById(id).exec();
  }

  async createSkillGap(data: Partial<ISkillGap>): Promise<ISkillGapDocument> {
    return SkillGapModel.create(data);
  }

  async updateSkillGap(id: string, data: Partial<ISkillGap>): Promise<ISkillGapDocument | null> {
    return SkillGapModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async getDevelopmentRecommendations(employeeId?: string): Promise<IDevelopmentRecommendationDocument[]> {
    await this.seedInitialDataIfEmpty();
    const query = employeeId ? { employeeId } : {};
    return DevelopmentRecommendationModel.find(query).sort({ priority: 1, createdAt: -1 }).exec();
  }

  async createDevelopmentRecommendation(data: Partial<IDevelopmentRecommendation>): Promise<IDevelopmentRecommendationDocument> {
    return DevelopmentRecommendationModel.create(data);
  }

  async updateDevelopmentRecommendation(id: string, data: Partial<IDevelopmentRecommendation>): Promise<IDevelopmentRecommendationDocument | null> {
    return DevelopmentRecommendationModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  // ================= 3. CONVERSATIONAL HR & CHAT REPOSITORY =================

  async getConversation(conversationId: string): Promise<IAIConversationDocument | null> {
    return AIConversationModel.findOne({ conversationId }).exec();
  }

  async getOrCreateConversation(conversationId: string, userId = 'user-1', userName = 'Sarah Joseph'): Promise<IAIConversationDocument> {
    let conv = await AIConversationModel.findOne({ conversationId }).exec();
    if (!conv) {
      conv = await AIConversationModel.create({
        conversationId,
        userId,
        userName,
        title: 'HR AI Assistant Chat',
        messages: [
          {
            id: '1',
            sender: 'ai',
            text: 'Hello Sarah! I am your HUREMASO AI Assistant. You can ask me anything about company policies, payroll status, leave balances, performance reviews, or request AI-generated HR drafts!',
            timestamp: new Date().toISOString(),
            category: 'General',
          },
        ],
        lastActivity: new Date().toISOString(),
      });
    }
    return conv;
  }

  async addMessageToConversation(conversationId: string, message: any): Promise<IAIConversationDocument | null> {
    return AIConversationModel.findOneAndUpdate(
      { conversationId },
      {
        $push: { messages: message },
        $set: { lastActivity: new Date().toISOString() },
      },
      { new: true, upsert: true }
    ).exec();
  }

  async clearConversationMessages(conversationId: string): Promise<IAIConversationDocument | null> {
    return AIConversationModel.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          messages: [
            {
              id: '1',
              sender: 'ai',
              text: 'Chat history cleared. How can I help you next?',
              timestamp: new Date().toISOString(),
              category: 'General',
            },
          ],
          lastActivity: new Date().toISOString(),
        },
      },
      { new: true }
    ).exec();
  }

  async getEmployeeSentimentMetrics(): Promise<IEmployeeSentimentMetrics> {
    return {
      sentimentScore: 8.6,
      sentimentRating: 'Positive',
      engagementIndex: 92,
      sampleResponsesCount: 142,
      topDrivers: ['Flexible Hybrid Work Hours', 'Transparent Leave Approvals', 'Inhouse Association Opportunities'],
      keyRiskAreas: ['Q3 Weekend Overtime Spikes in Core Engineering'],
    };
  }

  // ================= 4. COMPLIANCE REPOSITORY =================

  async getComplianceRecords(filter: Record<string, any> = {}, skip = 0, limit = 10): Promise<{ items: IComplianceRecordDocument[]; total: number }> {
    await this.seedInitialDataIfEmpty();
    const [items, total] = await Promise.all([
      ComplianceRecordModel.find(filter).sort({ auditScore: 1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      ComplianceRecordModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async getComplianceById(id: string): Promise<IComplianceRecordDocument | null> {
    await this.seedInitialDataIfEmpty();
    return ComplianceRecordModel.findById(id).exec();
  }

  async createComplianceRecord(data: Partial<IComplianceRecord>): Promise<IComplianceRecordDocument> {
    return ComplianceRecordModel.create(data);
  }

  async updateComplianceRecord(id: string, data: Partial<IComplianceRecord>): Promise<IComplianceRecordDocument | null> {
    return ComplianceRecordModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async deleteComplianceRecord(id: string): Promise<IComplianceRecordDocument | null> {
    return ComplianceRecordModel.findByIdAndDelete(id).exec();
  }
}

export const aiRepository = new AIRepository();
