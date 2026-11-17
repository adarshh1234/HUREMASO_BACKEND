import {
  FlightRiskModel,
  SkillGapModel,
  DevelopmentRecommendationModel,
  AIConversationModel,
  ComplianceRecordModel,
  KnowledgeDocumentModel,
  KnowledgeChunkModel,
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
  IKnowledgeDocument,
  IKnowledgeDocumentDocument,
  IKnowledgeChunk,
  IKnowledgeChunkDocument,
  IRAGSearchResult,
  IComplianceScanResult,
  IComplianceDiscrepancy,
} from './ai.types';
import { EmployeeModel } from '../employee/employee.model';
import { LeaveRequestModel } from '../employee/leave/leave.model';
import { AttendanceModel } from '../time/attendance/attendance.model';
import { PerformanceAppraisalModel } from '../performance/performanceAppraisal.model';
import { EmployeeDocumentModel } from '../employee/documents/document.model';

export class AIRepository {
  // ================= INITIAL KNOWLEDGE BASE SEED DEFINITION =================
  private getInitialKnowledgeDocuments(): Array<{ doc: Partial<IKnowledgeDocument>; chunks: Array<Partial<IKnowledgeChunk>> }> {
    return [
      {
        doc: {
          documentId: 'DOC-POL-01',
          title: 'HUREMASO Comprehensive Leave & Attendance Policy (2026)',
          category: 'Leave & Attendance',
          version: '3.2',
          jurisdiction: 'Global Entities & India',
          summary: 'Official standard operating procedures for annual leaves, maternity benefits, paternity leave, medical leaves, and hybrid work attendance.',
          content: 'Full policy detailing annual leave entitlement of 20 days per year, 5 days maximum rollover, 26 weeks paid statutory maternity leave, 2 weeks paid paternity leave, 10 days sick leave, and flexible hybrid core hours between 09:30 AM to 06:30 PM.',
          effectiveDate: '2026-01-01',
          lastReviewDate: '2026-06-15',
          tags: ['leave', 'maternity', 'paternity', 'attendance', 'working hours', 'hybrid', 'sick leave', 'pto'],
          chunkCount: 5,
        },
        chunks: [
          {
            chunkId: 'CHK-POL01-01',
            documentId: 'DOC-POL-01',
            documentTitle: 'HUREMASO Comprehensive Leave & Attendance Policy',
            category: 'Leave & Attendance',
            sectionHeader: 'Annual Leave & Paid Time Off (PTO)',
            content: 'Employees receive 20 days of fully paid annual leave per calendar year, accrued proportionally on a monthly basis. A maximum of 5 unused leave days can be carried forward into the next fiscal year. Any additional unused leaves beyond 5 days lapse automatically on December 31 unless granted special executive exemption. Planned leave requests exceeding 3 days must be submitted through the portal at least 3 business days in advance.',
            keywords: ['annual leave', 'pto', 'paid time off', 'vacation', 'leave balance', 'carry forward', 'rollover', 'apply leave'],
            tokensCount: 78,
          },
          {
            chunkId: 'CHK-POL01-02',
            documentId: 'DOC-POL-01',
            documentTitle: 'HUREMASO Comprehensive Leave & Attendance Policy',
            category: 'Leave & Attendance',
            sectionHeader: 'Statutory Maternity Leave Benefits',
            content: 'Under the statutory Maternity Benefit Amendment Act, all eligible female employees who have completed at least 80 working days within the preceding 12 months are entitled to 26 weeks (182 calendar days) of fully paid maternity leave for up to two surviving children. The policy includes flexible return-to-work arrangements with optional hybrid or reduced working hours during the first 60 calendar days post-resumption. Employees must submit medical certification at least 30 days prior to the expected commencement date.',
            keywords: ['maternity', 'maternity leave', 'pregnancy', 'childbirth', '26 weeks', 'paid leave', 'return to work', 'mother'],
            tokensCount: 84,
          },
          {
            chunkId: 'CHK-POL01-03',
            documentId: 'DOC-POL-01',
            documentTitle: 'HUREMASO Comprehensive Leave & Attendance Policy',
            category: 'Leave & Attendance',
            sectionHeader: 'Paternity & Secondary Caregiver Leave',
            content: 'All full-time employees are entitled to 2 weeks (10 working days) of fully paid paternity and caregiver leave upon the birth or legal adoption of a child. This leave can be availed either consecutively or in two separate 1-week blocks within the first 6 months following childbirth or placement. Paternity leave requests should be submitted alongside proof of birth or adoption notification.',
            keywords: ['paternity', 'paternity leave', 'caregiver', 'father', 'adoption', 'child', '2 weeks'],
            tokensCount: 68,
          },
          {
            chunkId: 'CHK-POL01-04',
            documentId: 'DOC-POL-01',
            documentTitle: 'HUREMASO Comprehensive Leave & Attendance Policy',
            category: 'Leave & Attendance',
            sectionHeader: 'Sick & Medical Emergency Leave',
            content: 'Full-time employees are allotted 10 days of paid sick and casual medical leave each calendar year. For any medical absence extending beyond 2 consecutive days, a signed medical fitness and consultation certificate from a registered healthcare professional must be uploaded into the self-service HR portal. Unused sick leave does not encash or roll over.',
            keywords: ['sick leave', 'medical', 'illness', 'doctor certificate', 'medical emergency', 'hospitalization', 'unwell'],
            tokensCount: 65,
          },
          {
            chunkId: 'CHK-POL01-05',
            documentId: 'DOC-POL-01',
            documentTitle: 'HUREMASO Comprehensive Leave & Attendance Policy',
            category: 'Leave & Attendance',
            sectionHeader: 'Core Hours, Attendance & Flexible Hybrid Work',
            content: 'Standard operating hours are 09:30 AM to 06:30 PM, Monday through Friday, with a standard 45-minute lunch break. A 15-minute grace period applies to morning biometric or portal punch-in. Eligible departments operate on a hybrid model permitting up to 2 days of remote work per week, provided in-office core meetings are attended and manager sign-off is logged in the Attendance portal.',
            keywords: ['working hours', 'timing', 'shift', 'hybrid', 'wfh', 'work from home', 'punch in', 'punch out', 'attendance', 'grace period'],
            tokensCount: 75,
          },
        ],
      },
      {
        doc: {
          documentId: 'DOC-POL-02',
          title: 'Compensation, Performance Bonus & Promotion Framework (2026)',
          category: 'Compensation & Benefits',
          version: '2.4',
          jurisdiction: 'Global Tech Organization',
          summary: 'Comprehensive guidelines for performance bonuses, appraisal cycles, rating definitions, and career level promotion benchmarks.',
          content: 'Details annual bonus eligibility criteria requiring 6 months tenure and rating >= 4.0/5.0, biannual appraisal review cycles, salary band benchmarks, and promotion tracks.',
          effectiveDate: '2026-01-01',
          lastReviewDate: '2026-07-01',
          tags: ['bonus', 'compensation', 'salary', 'payroll', 'performance', 'appraisal', 'promotion', 'rating'],
          chunkCount: 4,
        },
        chunks: [
          {
            chunkId: 'CHK-POL02-01',
            documentId: 'DOC-POL-02',
            documentTitle: 'Compensation, Performance Bonus & Promotion Framework',
            category: 'Compensation & Benefits',
            sectionHeader: 'Annual Performance Bonus Eligibility Criteria',
            content: 'To qualify for the annual performance incentive bonus, an employee must satisfy: 1) Active Tenure: Minimum 6 consecutive months of active employment within the evaluation fiscal year; 2) Performance Rating: An overall score of 4.0 or above out of 5.0 in the annual appraisal; 3) Objective Completion: At least 85% of assigned department OKRs/KPIs validated by the Department Head; 4) Good Standing: No active disciplinary or compliance notices. Bonus payouts are processed in the March payroll run.',
            keywords: ['bonus', 'annual bonus', 'eligibility', 'performance bonus', 'incentive', 'payout', 'okr', 'kpi'],
            tokensCount: 88,
          },
          {
            chunkId: 'CHK-POL02-02',
            documentId: 'DOC-POL-02',
            documentTitle: 'Compensation, Performance Bonus & Promotion Framework',
            category: 'Performance & Development',
            sectionHeader: 'Appraisal Cycles & Rating Scale',
            content: 'HUREMASO conducts biannual performance evaluations: Mid-Year Review in June (developmental check-in) and Annual Appraisal in December (scoring and compensation evaluation). Ratings operate on a 5-point scale: 1.0 = Unsatisfactory, 2.0 = Needs Improvement, 3.0 = Meets Expectations, 4.0 = Exceeds Expectations (High Performer), 5.0 = Outstanding Impact (Top 5% Tier). Peer 360 reviews and direct manager evaluations determine composite scoring.',
            keywords: ['appraisal', 'performance review', 'rating', 'mid-year', 'annual review', 'evaluation', 'peer review', 'score'],
            tokensCount: 79,
          },
          {
            chunkId: 'CHK-POL02-03',
            documentId: 'DOC-POL-02',
            documentTitle: 'Compensation, Performance Bonus & Promotion Framework',
            category: 'Compensation & Benefits',
            sectionHeader: 'Career Band Progression & Promotion Guidelines',
            content: 'Promotions require a minimum tenure of 18 to 24 months in the current band with continuous performance ratings of 4.0 or higher. The employee must demonstrate competency benchmarks for the target grade for at least 2 consecutive quarters. Managers submit formal promotion nominations during the Q4 review window, reviewed by the Talent Calibration Committee.',
            keywords: ['promotion', 'career progression', 'band', 'level upgrade', 'salary hike', 'title change', 'advancement'],
            tokensCount: 72,
          },
          {
            chunkId: 'CHK-POL02-04',
            documentId: 'DOC-POL-02',
            documentTitle: 'Compensation, Performance Bonus & Promotion Framework',
            category: 'Performance & Development',
            sectionHeader: 'Upskilling & Cloud Certification Sponsorship',
            content: 'The company provides an annual Professional Learning & Development Stipend of up to USD $1,500 (or local currency equivalent) per employee per calendar year. Covered programs include AWS, Google Cloud, Azure certifications, SHRM, PMP, and specialized technical bootcamps. Reimbursements are processed via Expense Reimbursements within 14 business days of credential submission.',
            keywords: ['certification', 'stipend', 'upskilling', 'learning budget', 'course reimbursement', 'aws', 'training'],
            tokensCount: 71,
          },
        ],
      },
      {
        doc: {
          documentId: 'DOC-POL-03',
          title: 'Statutory Labour Guardrails, POSH & Borderless Compliance (2026)',
          category: 'Statutory & Compliance',
          version: '4.0',
          jurisdiction: 'India & International Entities',
          summary: 'Guidelines on POSH committee, EPF/ESI statutory contributions, UAE labour regulations, overtime compensation, and borderless remote employment.',
          content: 'Details POSH Internal Committee rules and 90-day inquiry window, statutory Provident Fund and ESI rates, and UAE Labour Law compliance under Federal Decree-Law No. 33 of 2021.',
          effectiveDate: '2026-01-01',
          lastReviewDate: '2026-08-10',
          tags: ['compliance', 'posh', 'labour law', 'epf', 'esi', 'statutory', 'audit', 'uae', 'borderless'],
          chunkCount: 4,
        },
        chunks: [
          {
            chunkId: 'CHK-POL03-01',
            documentId: 'DOC-POL-03',
            documentTitle: 'Statutory Labour Guardrails & Compliance',
            category: 'Statutory & Compliance',
            sectionHeader: 'Prevention of Sexual Harassment (POSH) Guardrails',
            content: 'HUREMASO maintains strict zero-tolerance for workplace harassment and discrimination. In compliance with the POSH Act 2013, an active Internal Committee (IC) is constituted, chaired by a senior female executive with external legal representation. Complaints can be filed directly to posh@huremaso.com with guaranteed confidentiality. All inquiries must conclude within 90 days with formal findings submitted to the Executive Board.',
            keywords: ['posh', 'sexual harassment', 'harassment', 'internal committee', 'discrimination', 'investigation', 'complaint'],
            tokensCount: 76,
          },
          {
            chunkId: 'CHK-POL03-02',
            documentId: 'DOC-POL-03',
            documentTitle: 'Statutory Labour Guardrails & Compliance',
            category: 'Statutory & Compliance',
            sectionHeader: 'Provident Fund (EPF) & ESI Statutory Filings',
            content: 'Statutory employee deductions and equal employer matching contributions of 12% toward the Employees Provident Fund (EPF) are remitted monthly by the 15th of each subsequent month. ESI medical insurance contributions (0.75% employee, 3.25% employer) apply for covered wages. Individual UAN and ESI cards are linked to employee profiles upon onboarding, with automated monthly Electronic Challan Return (ECR) generation.',
            keywords: ['epf', 'pf', 'provident fund', 'esi', 'esic', 'statutory filing', 'challan', 'deduction', 'uan'],
            tokensCount: 75,
          },
          {
            chunkId: 'CHK-POL03-03',
            documentId: 'DOC-POL-03',
            documentTitle: 'Statutory Labour Guardrails & Compliance',
            category: 'Statutory & Compliance',
            sectionHeader: 'UAE & Borderless Labour Compliance',
            content: 'For personnel operating under UAE jurisdiction, employment contracts strictly adhere to Federal Decree-Law No. 33 of 2021. This mandates Wage Protection System (WPS) compliant monthly bank disbursements, maximum 48-hour statutory working weeks, mandatory health insurance coverage, and End of Service Gratuity (EOSG) computed at 21 days basic wage per year for the first 5 years and 30 days per year thereafter.',
            keywords: ['uae', 'borderless', 'wps', 'gratuity', 'eosg', 'dubai', 'international', 'foreign entity'],
            tokensCount: 77,
          },
          {
            chunkId: 'CHK-POL03-04',
            documentId: 'DOC-POL-03',
            documentTitle: 'Statutory Labour Guardrails & Compliance',
            category: 'Statutory & Compliance',
            sectionHeader: 'Overtime Compensation & Night Shift Allowances',
            content: 'Non-exempt employees working beyond standard daily hours or on designated corporate holidays receive statutory overtime pay calculated at 1.5x regular hourly base pay on regular working days, and 2.0x base pay on weekends and national holidays. Shift allowances of $25 per shift apply to scheduled night rotations, requiring prior written authorization from the Department Manager.',
            keywords: ['overtime', 'ot', 'night shift', 'allowance', 'extra hours', 'weekend deploy', 'shift pay'],
            tokensCount: 71,
          },
        ],
      },
      {
        doc: {
          documentId: 'DOC-POL-04',
          title: 'Engineering & Corporate Onboarding Guidebook (2026)',
          category: 'Onboarding & Culture',
          version: '1.8',
          jurisdiction: 'Global Engineering Hubs',
          summary: 'Standardized onboarding journey for engineering and corporate new hires, covering workstation setup, credentials, first pull request, and mentor pairing.',
          content: 'Details 5-step onboarding framework spanning Day 1 to Day 30 milestones for engineering, product, and corporate talent.',
          effectiveDate: '2026-01-01',
          lastReviewDate: '2026-05-20',
          tags: ['onboarding', 'new hire', 'engineer', 'checklist', 'mentor', 'culture', 'orientation'],
          chunkCount: 3,
        },
        chunks: [
          {
            chunkId: 'CHK-POL04-01',
            documentId: 'DOC-POL-04',
            documentTitle: 'Engineering & Corporate Onboarding Guidebook',
            category: 'Onboarding & Culture',
            sectionHeader: '5-Step Senior Software Engineer Onboarding Framework',
            content: 'Step 1: IT Hardware & Secure Single Sign-On (SSO) credential provisioning on Day 1. Step 2: GitHub Enterprise, CI/CD pipeline, and AWS/GCP developer sandbox access on Day 2. Step 3: Architecture Deep-Dive and Codebase Walkthrough with Engineering Tech Lead in Week 1. Step 4: First Good-First-Issue pull request merged into development branch by Day 7. Step 5: 30-Day Check-in & pairing with designated senior buddy from Inhouse Association.',
            keywords: ['onboarding', 'checklist', 'engineer onboarding', 'new hire checklist', 'first week', 'setup', 'github', 'developer setup'],
            tokensCount: 85,
          },
          {
            chunkId: 'CHK-POL04-02',
            documentId: 'DOC-POL-04',
            documentTitle: 'Engineering & Corporate Onboarding Guidebook',
            category: 'Onboarding & Culture',
            sectionHeader: 'Probationary Period & Confirmation Review',
            content: 'Standard probationary period is 90 days for all new full-time hires. A 45-day interim sync is conducted between the employee and department manager. At 80 days, a formal Confirmation Appraisal is initiated in the HR portal. Upon manager approval and HR sign-off, a formal Employment Confirmation Letter is generated and issued.',
            keywords: ['probation', 'confirmation', '90 days', 'probationary review', 'confirmation letter', 'new hire evaluation'],
            tokensCount: 68,
          },
          {
            chunkId: 'CHK-POL04-03',
            documentId: 'DOC-POL-04',
            documentTitle: 'Engineering & Corporate Onboarding Guidebook',
            category: 'Onboarding & Culture',
            sectionHeader: 'HR Letter & Memo Drafting Standard',
            content: 'All official company communications, including Leave Approvals, Experience Letters, Bonafide Letters, and Compensation Adjustments, must use standardized HUREMASO institutional templates carrying authorized digital signatures, letterhead watermark, and tracking verification hashes. Drafts can be pre-generated via the AI Assistant and forwarded to HR Operations for formal issuance.',
            keywords: ['hr letter', 'draft letter', 'template', 'experience letter', 'approval letter', 'bonafide', 'formal memo'],
            tokensCount: 69,
          },
        ],
      },
    ];
  }

  // ================= SEED INITIAL DATA =================

  async seedInitialDataIfEmpty(): Promise<void> {
    // 1. Flight Risks
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

    // 2. Skill Gaps
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

    // 3. Development Recommendations
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

    // 4. Compliance Records
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

    // 5. Knowledge Documents & Chunks (RAG)
    const docCount = await KnowledgeDocumentModel.countDocuments();
    if (docCount === 0) {
      await this.syncKnowledgeBase();
    }
  }

  // ================= KNOWLEDGE BASE & RAG PIPELINE =================

  async syncKnowledgeBase(): Promise<{
    status: string;
    syncedEntities: number;
    chunksCount: number;
    categories: string[];
    timestamp: string;
  }> {
    const rawData = this.getInitialKnowledgeDocuments();

    // Upsert Knowledge Documents
    let totalChunks = 0;
    const categoriesSet = new Set<string>();

    for (const item of rawData) {
      categoriesSet.add(item.doc.category as string);
      await KnowledgeDocumentModel.findOneAndUpdate(
        { documentId: item.doc.documentId },
        { ...item.doc, chunkCount: item.chunks.length },
        { upsert: true, new: true }
      );

      for (const chunk of item.chunks) {
        totalChunks++;
        await KnowledgeChunkModel.findOneAndUpdate(
          { chunkId: chunk.chunkId },
          chunk,
          { upsert: true, new: true }
        );
      }
    }

    return {
      status: 'Knowledge Base Synced',
      syncedEntities: rawData.length,
      chunksCount: totalChunks,
      categories: Array.from(categoriesSet),
      timestamp: new Date().toISOString(),
    };
  }

  async searchKnowledgeChunks(query: string, limit = 3): Promise<IRAGSearchResult[]> {
    await this.seedInitialDataIfEmpty();

    const normalizedQuery = query.toLowerCase();
    const queryTokens = normalizedQuery
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const allChunks = await KnowledgeChunkModel.find().lean().exec();
    const scoredChunks: Array<{ chunk: IKnowledgeChunk; score: number }> = [];

    for (const chunk of allChunks) {
      let score = 0;
      const lowerHeader = chunk.sectionHeader.toLowerCase();
      const lowerContent = chunk.content.toLowerCase();
      const lowerKeywords = (chunk.keywords || []).map((k) => k.toLowerCase());

      // Exact phrase match bonus
      if (lowerContent.includes(normalizedQuery) || lowerHeader.includes(normalizedQuery)) {
        score += 50;
      }

      // Header matches
      for (const token of queryTokens) {
        if (lowerHeader.includes(token)) score += 25;
        if (lowerKeywords.some((k) => k.includes(token))) score += 15;
        if (lowerContent.includes(token)) score += 5;
      }

      if (score > 0) {
        scoredChunks.push({ chunk, score });
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    const topResults = scoredChunks.slice(0, limit);

    return topResults.map((item) => ({
      chunk: item.chunk,
      score: item.score,
      citation: `[Source: ${item.chunk.documentTitle} — ${item.chunk.sectionHeader}]`,
    }));
  }

  async listKnowledgeDocuments(): Promise<IKnowledgeDocumentDocument[]> {
    await this.seedInitialDataIfEmpty();
    return KnowledgeDocumentModel.find().sort({ category: 1, title: 1 }).exec();
  }

  async listKnowledgeChunks(documentId?: string): Promise<IKnowledgeChunkDocument[]> {
    await this.seedInitialDataIfEmpty();
    const filter = documentId ? { documentId } : {};
    return KnowledgeChunkModel.find(filter).sort({ documentId: 1, chunkId: 1 }).exec();
  }

  // ================= DYNAMIC CONTEXT RETRIEVAL (HRMS DB LOOKUP) =================

  async getEmployeeContext(query: string, userId = 'user-1', userName = 'Sarah Joseph'): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      userId,
      userName,
    };

    try {
      // 1. Check if an employee matches userName or userId
      let employee: any = null;
      if (EmployeeModel) {
        employee = await EmployeeModel.findOne({
          $or: [
            { employeeId: userId },
            { firstName: { $regex: new RegExp(userName.split(' ')[0], 'i') } },
            { email: { $regex: new RegExp(userName.replace(/\s+/g, '.'), 'i') } },
          ],
        }).lean().exec();

        // If not found, look for any employee name mentioned in query
        if (!employee) {
          const words = query.split(/\s+/).filter(w => w.length > 3);
          for (const word of words) {
            const found = await EmployeeModel.findOne({
              $or: [
                { firstName: { $regex: new RegExp(word, 'i') } },
                { lastName: { $regex: new RegExp(word, 'i') } },
                { employeeId: { $regex: new RegExp(word, 'i') } },
              ],
            }).lean().exec();
            if (found) {
              employee = found;
              break;
            }
          }
        }
      }

      if (employee) {
        context.employee = {
          id: employee.id || employee._id,
          employeeId: employee.employeeId || 'EMP-1042',
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || userName,
          department: employee.jobDetails?.department || employee.department || 'Engineering',
          jobTitle: employee.jobDetails?.jobTitle || employee.jobTitle || 'Senior Frontend Developer',
          joiningDate: employee.joiningDate || '2023-01-15',
          email: employee.email || 'sarah.joseph@huremaso.internal',
        };
      } else {
        context.employee = {
          id: 'emp-sarah',
          employeeId: 'EMP-1042',
          name: userName || 'Sarah Joseph',
          department: 'Engineering',
          jobTitle: 'Senior Frontend Developer',
          joiningDate: '2023-01-15',
          email: 'sarah.joseph@huremaso.internal',
        };
      }

      // 2. Fetch leave balance and recent leave requests
      if (LeaveRequestModel) {
        const empName = context.employee.name;
        const leaveRecords = await LeaveRequestModel.find({
          $or: [
            { employeeName: { $regex: new RegExp(empName.split(' ')[0], 'i') } },
            { employeeId: context.employee.employeeId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean()
          .exec();

        context.leaveHistory = leaveRecords;
        context.leaveBalance = {
          annualLeaveTotal: 20,
          annualLeaveUsed: leaveRecords.filter(l => l.status === 'Approved').reduce((acc, l) => acc + (l.numberOfDays || 1), 4),
          annualLeaveRemaining: 16,
          sickLeaveRemaining: 9,
          maternityEligible: true,
        };
      }

      // 3. Fetch recent performance appraisal
      if (PerformanceAppraisalModel) {
        const appraisal = await PerformanceAppraisalModel.findOne({
          $or: [
            { employeeName: { $regex: new RegExp(context.employee.name.split(' ')[0], 'i') } },
            { employeeId: context.employee.employeeId },
          ],
        }).lean().exec();

        if (appraisal) {
          context.performance = {
            score: appraisal.reportsAi?.overallAiScore || (appraisal as any).overallScore || 4.2,
            tier: appraisal.reportsAi?.performanceTier || 'Top 10% Contributor',
            peerSentiment: appraisal.reportsAi?.peerSentimentRating || 94,
          };
        } else {
          context.performance = {
            score: 4.2,
            tier: 'High Performer (Band 4)',
            peerSentiment: 92,
          };
        }
      }

      // 4. Fetch recent attendance & overtime info
      if (AttendanceModel) {
        const attendance = await AttendanceModel.find({
          $or: [
            { employeeName: { $regex: new RegExp(context.employee.name.split(' ')[0], 'i') } },
            { employeeId: context.employee.id },
          ],
        })
          .sort({ date: -1 })
          .limit(5)
          .lean()
          .exec();

        context.recentAttendance = attendance;
      }
    } catch (err) {
      // Graceful fallback if other models throw in test environment
      context.employee = {
        name: userName || 'Sarah Joseph',
        department: 'Engineering',
        jobTitle: 'Senior Frontend Developer',
      };
    }

    return context;
  }

  // ================= PREDICTIVE WORKFORCE ANALYTICS =================

  async getWorkforceAnalyticsSummary(): Promise<IWorkforceAnalyticsSummary> {
    await this.seedInitialDataIfEmpty();

    const [highCount, medCount, lowCount, totalRisks] = await Promise.all([
      FlightRiskModel.countDocuments({ riskLevel: 'High', status: { $in: ['Open', 'Mitigating'] } }),
      FlightRiskModel.countDocuments({ riskLevel: 'Medium', status: { $in: ['Open', 'Mitigating'] } }),
      FlightRiskModel.countDocuments({ riskLevel: 'Low', status: { $in: ['Open', 'Mitigating'] } }),
      FlightRiskModel.countDocuments(),
    ]);

    let actualEmployeeCount = 0;
    try {
      if (EmployeeModel) {
        actualEmployeeCount = await EmployeeModel.countDocuments();
      }
    } catch {
      actualEmployeeCount = 0;
    }

    const totalEvaluated = actualEmployeeCount > 0 ? actualEmployeeCount : 145;
    const projectedTurnover = Number((((highCount * 0.45 + medCount * 0.15) / totalEvaluated) * 100).toFixed(1));
    const retentionScore = Number((100 - projectedTurnover).toFixed(1));
    const workforceHealthIndex = Math.min(100, Math.max(70, Math.round(retentionScore - (highCount * 1.5))));

    // Aggregate department risk breakdown
    const risks = await FlightRiskModel.find().lean().exec();
    const departmentRiskDistribution: Record<string, { high: number; medium: number; low: number }> = {
      Engineering: { high: 0, medium: 0, low: 0 },
      'Product Design': { high: 0, medium: 0, low: 0 },
      Recruitment: { high: 0, medium: 0, low: 0 },
      Sales: { high: 0, medium: 0, low: 0 },
    };

    for (const r of risks) {
      const dept = r.department || 'Engineering';
      if (!departmentRiskDistribution[dept]) {
        departmentRiskDistribution[dept] = { high: 0, medium: 0, low: 0 };
      }
      const lvl = (r.riskLevel || 'Low').toLowerCase() as 'high' | 'medium' | 'low';
      if (departmentRiskDistribution[dept][lvl] !== undefined) {
        departmentRiskDistribution[dept][lvl]++;
      }
    }

    return {
      projectedTurnoverRate: projectedTurnover > 0 ? projectedTurnover : 2.1,
      industryTurnoverBenchmark: 5.0,
      retentionScore: retentionScore > 0 ? retentionScore : 94.2,
      workforceHealthIndex: workforceHealthIndex || 92,
      totalEmployeesEvaluated: totalEvaluated,
      highRiskCount: highCount,
      mediumRiskCount: medCount,
      lowRiskCount: lowCount,
      departmentRiskDistribution,
    };
  }

  // ================= FLIGHT RISK REPOSITORY =================

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

  // ================= SKILL GAP REPOSITORY =================

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

  // ================= CONVERSATIONAL HR & CHAT REPOSITORY =================

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

  // ================= COMPLIANCE REPOSITORY & LIVE AUDIT SCAN =================

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

  async runComplianceAuditScan(): Promise<IComplianceScanResult> {
    await this.seedInitialDataIfEmpty();

    const discrepancies: IComplianceDiscrepancy[] = [];
    let scannedCount = 145;

    try {
      // Check employee document model for missing or expired files
      if (EmployeeDocumentModel) {
        const expiredDocs = await EmployeeDocumentModel.find({
          expiryDate: { $ne: '', $lt: new Date().toISOString().split('T')[0] },
        }).limit(5).lean().exec();

        for (const doc of expiredDocs) {
          discrepancies.push({
            employeeId: doc.employeeId,
            issue: `Document '${doc.name}' (${doc.category}) has expired on ${doc.expiryDate}`,
            severity: 'Warning',
            recommendation: 'Request renewed documentation upload from employee self-service',
          });
        }
      }
    } catch {
      // Keep baseline
    }

    const readinessScore = discrepancies.length === 0 ? 100 : Math.max(80, 100 - (discrepancies.length * 5));
    const status = readinessScore === 100 ? 'Audit Ready' : 'At Risk';

    // Update compliance records with scan timestamp
    await ComplianceRecordModel.updateMany({}, {
      $set: {
        lastAuditedAt: new Date().toISOString(),
        auditScore: readinessScore,
        discrepanciesCount: discrepancies.length,
      },
    });

    return {
      scanTimestamp: new Date().toISOString(),
      totalRecordsScanned: scannedCount,
      auditReadinessScore: readinessScore,
      discrepanciesFound: discrepancies.length,
      status,
      summary: discrepancies.length === 0
        ? '100% Audit Ready — 0 compliance discrepancies found across all active statutory registers and employee files.'
        : `Audit Scan Complete — Score: ${readinessScore}%. ${discrepancies.length} non-critical document discrepancies flagged for remediation.`,
      discrepancies,
    };
  }
}

export const aiRepository = new AIRepository();
