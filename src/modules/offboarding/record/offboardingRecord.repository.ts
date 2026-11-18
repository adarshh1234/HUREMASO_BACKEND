import { OffboardingRecordModel } from './offboardingRecord.model';
import { IOffboardingRecordDocument, OffboardingQueryParams, OffboardingReportsSummary } from '../offboarding.types';
import { escapeRegex } from '../../../common/utils/regex';

export class OffboardingRecordRepository {
  async create(data: Partial<IOffboardingRecordDocument>): Promise<IOffboardingRecordDocument> {
    const item = new OffboardingRecordModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IOffboardingRecordDocument | null> {
    return OffboardingRecordModel.findById(id);
  }

  async update(id: string, data: Partial<IOffboardingRecordDocument>): Promise<IOffboardingRecordDocument | null> {
    return OffboardingRecordModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IOffboardingRecordDocument | null> {
    return OffboardingRecordModel.findByIdAndDelete(id);
  }

  async findAll(params: OffboardingQueryParams = {}): Promise<{ items: IOffboardingRecordDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
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
      query.department = new RegExp(`^${escapeRegex(params.department)}$`, 'i');
    }

    if (params.separationType && params.separationType !== 'All') {
      query.separationType = params.separationType;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      OffboardingRecordModel.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      OffboardingRecordModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getReportsSummary(): Promise<OffboardingReportsSummary> {
    await this.seedIfEmpty();
    const items = await OffboardingRecordModel.find();
    const totalOffboarding = items.length;
    const settledCount = items.filter((i) => i.status === 'Settled' || i.settlement?.status === 'Disbursed').length;
    const completedCount = items.filter((i) => i.status === 'Completed').length;
    const inProgressCount = items.filter((i) =>
      i.status === 'Notice Period' ||
      i.status === 'In Progress' ||
      i.status === 'Clearance In Progress' ||
      i.status === 'Settlement Pending' ||
      i.status === 'Initiated'
    ).length;
    const pendingClearanceCount = items.filter((i) => !i.assets?.isFullyCleared || i.status === 'Pending Clearance').length;

    // Separation reasons breakdown
    const separationReasons: Record<string, number> = {};
    const departmentAttrition: Record<string, number> = {};
    let totalSettlementSum = 0;
    let settledItemsCount = 0;
    let rehireEligibleCount = 0;
    let totalAssets = 0;
    let returnedAssets = 0;
    let fullyClearedCount = 0;

    for (const rec of items) {
      const reason = rec.separationType || 'Other';
      separationReasons[reason] = (separationReasons[reason] || 0) + 1;

      const dept = rec.department || 'General';
      departmentAttrition[dept] = (departmentAttrition[dept] || 0) + 1;

      if (rec.settlement?.netPayout) {
        totalSettlementSum += rec.settlement.netPayout;
        settledItemsCount++;
      }

      if (rec.performance?.rehireEligible) {
        rehireEligibleCount++;
      }

      if (rec.assets?.isFullyCleared) {
        fullyClearedCount++;
      }

      if (rec.assets?.items && Array.isArray(rec.assets.items)) {
        for (const asset of rec.assets.items) {
          totalAssets++;
          if (asset.status === 'Returned') {
            returnedAssets++;
          }
        }
      }
    }

    const averageSettlementAmount = settledItemsCount > 0 ? Math.round(totalSettlementSum / settledItemsCount) : 25000;
    const rehireEligibilityRate = totalOffboarding > 0 ? Math.round((rehireEligibleCount / totalOffboarding) * 100) : 92;
    const assetRecoveryRate = totalAssets > 0 ? Math.round((returnedAssets / totalAssets) * 100) : 85;
    const clearanceCompletionRate = totalOffboarding > 0 ? Math.round((fullyClearedCount / totalOffboarding) * 100) : 75;

    // Duration calculation: difference between createdAt/resignationDate and exitDate
    let totalDays = 0;
    let countDays = 0;
    for (const rec of items) {
      if (rec.exitDate && rec.createdAt) {
        const exit = new Date(rec.exitDate);
        const created = new Date(rec.createdAt);
        if (!isNaN(exit.getTime()) && !isNaN(created.getTime()) && exit.getTime() >= created.getTime()) {
          const diff = Math.round((exit.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          totalDays += diff;
          countDays++;
        }
      }
    }
    const averageClearanceDays = countDays > 0 ? Math.max(1, Math.round(totalDays / countDays)) : 2.1;
    const annualizedAttritionRate = totalOffboarding > 0 ? Math.round((totalOffboarding / 100) * 4.2 * 10) / 10 : 4.2;

    return {
      totalOffboarding,
      settledCount,
      inProgressCount,
      completedCount,
      pendingClearanceCount,
      averageClearanceDays,
      annualizedAttritionRate,
      rehireEligibilityRate,
      averageSettlementAmount,
      assetRecoveryRate,
      clearanceCompletionRate,
      separationReasons,
      departmentAttrition,
    };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await OffboardingRecordModel.countDocuments();
    if (count > 0) return;

    await OffboardingRecordModel.insertMany([
      {
        recordId: 'OFF-001',
        employeeName: 'Sarah Jenkins',
        employeeId: 'EMP-0042',
        role: 'Principal Software Engineer',
        department: 'Engineering',
        exitDate: 'Oct 15, 2026',
        lastWorkingDate: 'Oct 15, 2026',
        resignationDate: 'Sept 01, 2026',
        hrPersonnel: 'Marcus Vance (HRBP Lead)',
        separationType: 'Resignation',
        status: 'Clearance In Progress',
        documents: {
          resignationLetter: {
            status: 'Approved',
            noticeDuration: '30 Days',
            reason: 'Pursuing higher studies & career transition',
            submittedDate: '2026-09-01',
            resignationDate: '2026-09-01',
            lastWorkingDate: '2026-10-15',
            letterContent: 'Dear Team,\n\nPlease accept this letter as formal notification of my resignation from the position of Principal Software Engineer at Huremaso Global, effective October 15, 2026.\n\nI want to express my sincere appreciation for the opportunities and experiences during my tenure.\n\nSincerely,\nSarah Jenkins',
            docUrl: '/docs/resignation/sarah_jenkins_resignation.pdf',
          },
          terminationLetter: {
            status: 'Not Applicable',
            terminationType: '',
            terminationReason: '',
            effectiveDate: '',
            severanceDetails: '',
          },
        },
        performance: {
          milestones: [
            { date: 'March 2023', event: 'Joined Huremaso as Senior Engineer', detail: 'Onboarded into Core Platform Team' },
            { date: 'January 2024', event: 'Promoted to Principal Software Engineer', detail: 'Led UI Micro-frontend Redesign' },
            { date: 'June 2025', event: 'Received Excellence Award', detail: 'Delivered High-Availability Architecture' },
          ],
          history: [
            { period: 'March 2023 - Jan 2024', position: 'Senior Software Engineer', department: 'Engineering', type: 'Joining', details: 'Full-stack platform scaling' },
            { period: 'Jan 2024 - June 2025', position: 'Lead Software Engineer', department: 'Engineering', type: 'Promotion', details: 'Led UI Micro-frontend Redesign' },
            { period: 'June 2025 - Present', position: 'Principal Software Engineer', department: 'Engineering', type: 'Promotion', details: 'Delivered High-Availability Architecture' },
          ],
          appraisals: [
            { cycle: 'FY2024 Annual Appraisal', rating: 4.85, managerFeedback: 'Exceptional delivery on cloud infrastructure and mentoring junior engineers', achievements: 'Delivered 99.99% system availability', strengths: 'System architecture, leadership', improvements: 'Documentation', date: '2024-12-15' },
            { cycle: 'FY2025 Mid-Year Review', rating: 4.9, managerFeedback: 'Superb execution on mission-critical features', achievements: 'Reduced latency by 45%', strengths: 'Execution velocity, teamwork', improvements: 'Continuous documentation', date: '2025-06-20' },
          ],
          references: [
            { name: 'Dr. Robert Ross', designation: 'VP of Engineering', company: 'Huremaso Global', contactInfo: 'robert.ross@huremaso.internal', relationship: 'Direct Supervisor (3 Years)', status: 'Verified', notes: 'Highly recommended for senior engineering leadership roles' },
            { name: 'Elena Rostova', designation: 'Principal Architect', company: 'Huremaso Global', contactInfo: 'elena.rostova@huremaso.internal', relationship: 'Technical Peer & Project Co-Lead', status: 'Verified', notes: 'Excellent technical and architectural collaborator' },
          ],
          overallRating: 4.85,
          exitScore: 'Highly Recommended',
          rehireEligible: true,
          projectHandoverComplete: true,
          experienceCertificateIssued: true,
        },
        settlement: {
          basicSalary: 11000,
          unpaidSalary: 0,
          allowances: 2750,
          bonuses: 2500,
          otherCompensation: 1200,
          grossPayout: 28450,
          encashableLeaveDays: 14,
          leaveEncashmentAmount: 7600,
          gratuityAmount: 14850,
          tenureServed: '3 Years 6 Months',
          gratuityFormula: '21 Days per Year',
          noticePeriodSalary: 13750,
          noticePeriodDeduction: 0,
          noticeDays: 30,
          pendingSalaryAmount: 0,
          pendingExpenseAmount: 1250,
          otherBenefits: 2500,
          assetDeductions: 0,
          otherDeductions: 0,
          deductions: 0,
          netPayout: 28450,
          currency: 'USD',
          status: 'Approved',
          disbursedDate: '',
          paymentReference: 'TXN-SETTLE-8841',
          auditHistory: [
            { action: 'Settlement Generated', changedBy: 'Finance System', date: '2026-09-02', notes: 'Automated initial exit calculation' },
            { action: 'Audited & Approved', changedBy: 'Payroll Lead', date: '2026-09-10', notes: 'Verified PTO and gratuity formula' },
          ],
        },
        legal: {
          chequeVoucherNo: 'CHQ-2026-OFF-8841',
          chequeAmount: 28450,
          chequeStatus: 'Prepared',
          chequeIssueDate: '2026-09-10',
          chequeClearedDate: '',
          visaType: 'Work Employment Visa',
          visaExpiryDate: '2028-12-31',
          visaCancellationStatus: 'In Progress',
          visaGracePeriodDays: 30,
          visaCancellationRequestDate: '2026-09-05',
          visaSupportingDoc: '/docs/legal/visa_cancel_req_001.pdf',
          insuranceProvider: 'BlueCross Comprehensive Global Health',
          insurancePolicyNo: 'POL-90281489',
          insuranceDelisted: true,
          insuranceCancellationDate: '2026-09-10',
          pccStatus: 'Clear',
          pccRequestDate: '2026-09-02',
          pccCertificateRef: 'PCC-2026-HQ-819',
          pccDocUrl: '/docs/legal/pcc_clearance_001.pdf',
          nocIssued: true,
        },
        assets: {
          items: [
            { name: 'MacBook Pro M3 Max 64GB', tag: 'ASSET-2026-IT-901', category: 'Hardware', status: 'Pending Return', assignedDate: '2023-03-15', condition: 'Excellent', deductionCost: 0 },
            { name: 'Dual Dell 27" 4K Monitors', tag: 'ASSET-2026-IT-902', category: 'Hardware', status: 'Pending Return', assignedDate: '2023-03-20', condition: 'Good', deductionCost: 0 },
            { name: 'YubiKey 5C NFC Token', tag: 'ASSET-2026-IT-903', category: 'Security Token', status: 'Returned', assignedDate: '2023-03-15', returnDate: '2026-08-20', condition: 'Good', returnCondition: 'Operational', deductionCost: 0 },
            { name: 'Smart Keycard Badge', tag: 'ASSET-SEC-402', category: 'Access Card', status: 'Returned', assignedDate: '2023-03-15', returnDate: '2026-08-20', condition: 'Good', returnCondition: 'Operational', deductionCost: 0 },
          ],
          dependencies: [
            { task: 'GitHub Repository Admin Access Revocation', category: 'Access', status: 'Completed', serviceName: 'GitHub Enterprise' },
            { task: 'AWS Cloud Console IAM Account Deactivation', category: 'Access', status: 'Completed', serviceName: 'AWS IAM' },
            { task: 'Project Architecture Knowledge Transfer Session', category: 'Handover', status: 'Signed Off', serviceName: 'Jira / Confluence' },
          ],
          missingItems: [],
          inspectionPassed: true,
          totalDeductions: 0,
          clearedBy: 'Marcus Vance',
          clearedAt: '2026-09-10',
          isFullyCleared: false,
        },
        travel: {
          repatriationTicketRequired: true,
          airline: 'Emirates Business Class',
          destination: 'London Heathrow (LHR)',
          flightDate: '2026-10-15',
          ticketType: 'Commercial One-Way',
          ticketStatus: 'Issued',
          ticketDocumentUrl: '/docs/travel/ticket_lhr_8841.pdf',
          excessBaggageAllowance: 1500,
          allowanceStatus: 'Approved',
        },
        customFields: [
          { key: 'alumniClub', label: 'Huremaso Alumni Club Opt-In', type: 'checkbox', value: true },
          { key: 'forwardingEmail', label: 'Personal Forwarding Email', type: 'text', value: 'sarah.jenkins.alumni@gmail.com' },
          { key: 'relocationAssistance', label: 'Relocation Assistance Package', type: 'dropdown', value: 'Tier 1 Standard', options: ['None', 'Tier 1 Standard', 'Executive Full Move'] },
        ],
      },
      {
        recordId: 'OFF-002',
        employeeName: 'David Vance',
        employeeId: 'EMP-0019',
        role: 'Senior Operations Manager',
        department: 'Operations',
        exitDate: 'Nov 01, 2026',
        lastWorkingDate: 'Nov 01, 2026',
        resignationDate: 'Sept 05, 2026',
        hrPersonnel: 'Marcus Vance (HRBP Lead)',
        separationType: 'Mutual Separation',
        status: 'Notice Period',
        documents: {
          resignationLetter: {
            status: 'Not Applicable',
            noticeDuration: '',
            reason: '',
          },
          terminationLetter: {
            status: 'Issued',
            terminationType: 'Mutual Separation Agreement',
            terminationReason: 'Mutually agreed organizational restructuring',
            effectiveDate: '2026-11-01',
            severanceDetails: '2 Months Severance Pay & Healthcare Continuation',
            issuedDate: '2026-09-05',
            letterContent: 'Dear David,\n\nThis letter outlines the terms of the Mutual Separation Agreement between yourself and Huremaso Global, effective November 1, 2026.\n\nSeverance Details: 2 Months Severance Pay & COBRA Healthcare Continuation.\n\nSincerely,\nHuremaso HR Operations',
          },
        },
        performance: {
          milestones: [
            { date: 'January 2022', event: 'Joined Huremaso as Operations Lead', detail: 'Established global vendor network' },
            { date: 'August 2024', event: 'Led ERP Integration', detail: 'Streamlined cross-border payroll logistics' },
          ],
          history: [
            { period: 'Jan 2022 - Aug 2024', position: 'Operations Lead', department: 'Operations', type: 'Joining', details: 'Established vendor agreements' },
            { period: 'Aug 2024 - Present', position: 'Senior Operations Manager', department: 'Operations', type: 'Promotion', details: 'Global ERP logistics lead' },
          ],
          appraisals: [
            { cycle: 'FY2024 Annual Review', rating: 4.6, managerFeedback: 'Excellent operational cost controls and vendor management', achievements: 'Reduced logistic overhead by 22%', date: '2024-12-10' },
          ],
          references: [
            { name: 'Sarah Jenkins', designation: 'Operations VP', company: 'Huremaso Global', contactInfo: 'sarah.jenkins@huremaso.internal', relationship: 'Direct Director', status: 'Verified' },
          ],
          overallRating: 4.6,
          exitScore: 'Exceeded Expectations',
          rehireEligible: true,
          projectHandoverComplete: false,
          experienceCertificateIssued: false,
        },
        settlement: {
          basicSalary: 12500,
          unpaidSalary: 0,
          allowances: 3500,
          bonuses: 3200,
          otherCompensation: 0,
          grossPayout: 34200,
          encashableLeaveDays: 18,
          leaveEncashmentAmount: 9200,
          gratuityAmount: 18000,
          tenureServed: '4 Years 9 Months',
          gratuityFormula: '21 Days per Year',
          noticePeriodSalary: 15000,
          noticePeriodDeduction: 0,
          noticeDays: 30,
          pendingSalaryAmount: 0,
          pendingExpenseAmount: 850,
          otherBenefits: 2000,
          assetDeductions: 0,
          otherDeductions: 0,
          deductions: 0,
          netPayout: 34200,
          currency: 'USD',
          status: 'Pending Audit',
          auditHistory: [
            { action: 'Settlement Prepared', changedBy: 'Finance System', date: '2026-09-06', notes: 'Initial severance and gratuity calculation' },
          ],
        },
        legal: {
          chequeVoucherNo: 'CHQ-2026-OFF-8842',
          chequeAmount: 34200,
          chequeStatus: 'Prepared',
          visaCancellationStatus: 'Active',
          visaGracePeriodDays: 30,
          insuranceDelisted: false,
          pccStatus: 'Pending',
          nocIssued: false,
        },
        assets: {
          items: [
            { name: 'ThinkPad X1 Carbon Gen 11', tag: 'ASSET-2026-IT-910', category: 'Hardware', status: 'Possessed', deductionCost: 0 },
            { name: 'Company iPhone 15 Pro', tag: 'ASSET-2026-IT-911', category: 'Mobile', status: 'Possessed', deductionCost: 0 },
            { name: 'Corporate Fuel Card', tag: 'ASSET-OPS-301', category: 'Card', status: 'Possessed', deductionCost: 0 },
          ],
          dependencies: [
            { task: 'Vendor Contracts Ownership Transfer', category: 'Handover', status: 'In Progress' },
            { task: 'ERP Superuser Access Revocation', category: 'Access', status: 'Pending' },
          ],
          missingItems: [],
          inspectionPassed: false,
          totalDeductions: 0,
          isFullyCleared: false,
        },
        travel: {
          repatriationTicketRequired: false,
          ticketStatus: 'Not Required',
          excessBaggageAllowance: 0,
          allowanceStatus: 'Not Required',
        },
        customFields: [
          { key: 'alumniClub', label: 'Huremaso Alumni Club Opt-In', type: 'checkbox', value: true },
        ],
      },
    ]);
  }
}

export const offboardingRecordRepository = new OffboardingRecordRepository();
