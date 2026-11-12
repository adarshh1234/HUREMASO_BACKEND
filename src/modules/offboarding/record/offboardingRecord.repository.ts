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
    const settledCount = items.filter((i) => i.status === 'Settled' || i.status === 'Completed').length;
    const inProgressCount = items.filter((i) => i.status === 'Notice Period' || i.status === 'Clearance In Progress' || i.status === 'Settlement Pending').length;

    return {
      totalOffboarding,
      settledCount,
      inProgressCount,
      averageClearanceDays: 2.1,
      annualizedAttritionRate: 4.2,
      rehireEligibilityRate: 92,
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
        separationType: 'Resignation',
        status: 'Clearance In Progress',
        documents: {
          resignationLetter: {
            status: 'Approved',
            noticeDuration: '30 Days',
            reason: 'Pursuing higher studies & career transition',
            submittedDate: '2026-09-01',
            docUrl: '/docs/resignation/sarah_jenkins_resignation.pdf',
          },
          terminationLetter: {
            status: 'Not Applicable',
            terminationType: '',
            severanceDetails: '',
          },
        },
        performance: {
          milestones: [
            { date: 'March 2023', event: 'Joined Huremaso as Senior Engineer', detail: 'Onboarded into Core Platform Team' },
            { date: 'January 2024', event: 'Promoted to Principal Software Engineer', detail: 'Led UI Micro-frontend Redesign' },
            { date: 'June 2025', event: 'Received Excellence Award', detail: 'Delivered High-Availability Architecture' },
          ],
          overallRating: 4.85,
          exitScore: 'Highly Recommended',
          rehireEligible: true,
          projectHandoverComplete: true,
          experienceCertificateIssued: true,
        },
        settlement: {
          grossPayout: 28450,
          encashableLeaveDays: 14,
          leaveEncashmentAmount: 7600,
          gratuityAmount: 14850,
          tenureServed: '3 Years 6 Months',
          gratuityFormula: '21 Days per Year',
          noticePeriodSalary: 13750,
          noticeDays: 30,
          pendingSalaryAmount: 0,
          pendingExpenseAmount: 1250,
          deductions: 0,
          netPayout: 28450,
          status: 'Approved',
        },
        legal: {
          chequeVoucherNo: 'CHQ-2026-OFF-8841',
          chequeAmount: 28450,
          chequeStatus: 'Prepared',
          visaCancellationStatus: 'In Progress',
          visaGracePeriodDays: 30,
          insuranceDelisted: true,
          pccStatus: 'Clear',
          nocIssued: true,
        },
        assets: {
          items: [
            { name: 'MacBook Pro M3 Max 64GB', tag: 'ASSET-2026-IT-901', category: 'Hardware', status: 'Pending Return', deductionCost: 0 },
            { name: 'Dual Dell 27" 4K Monitors', tag: 'ASSET-2026-IT-902', category: 'Hardware', status: 'Pending Return', deductionCost: 0 },
            { name: 'YubiKey 5C NFC Token', tag: 'ASSET-2026-IT-903', category: 'Security Token', status: 'Returned', returnDate: '2026-08-20', deductionCost: 0 },
            { name: 'Smart Keycard Badge', tag: 'ASSET-SEC-402', category: 'Access Card', status: 'Returned', returnDate: '2026-08-20', deductionCost: 0 },
          ],
          dependencies: [
            { task: 'GitHub Repository Admin Access Revocation', category: 'Access', status: 'Completed' },
            { task: 'AWS Cloud Console IAM Account Deactivation', category: 'Access', status: 'Completed' },
            { task: 'Project Architecture Knowledge Transfer Session', category: 'Handover', status: 'Signed Off' },
          ],
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
          ticketStatus: 'Issued',
          excessBaggageAllowance: 1500,
          allowanceStatus: 'Approved',
        },
      },
      {
        recordId: 'OFF-002',
        employeeName: 'David Vance',
        employeeId: 'EMP-0019',
        role: 'Senior Operations Manager',
        department: 'Operations',
        exitDate: 'Nov 01, 2026',
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
            severanceDetails: '2 Months Severance Pay & Healthcare Continuation',
            issuedDate: '2026-09-05',
          },
        },
        performance: {
          milestones: [
            { date: 'January 2022', event: 'Joined Huremaso as Operations Lead', detail: 'Established global vendor network' },
            { date: 'August 2024', event: 'Led ERP Integration', detail: 'Streamlined cross-border payroll logistics' },
          ],
          overallRating: 4.6,
          exitScore: 'Exceeded Expectations',
          rehireEligible: true,
          projectHandoverComplete: false,
          experienceCertificateIssued: false,
        },
        settlement: {
          grossPayout: 34200,
          encashableLeaveDays: 18,
          leaveEncashmentAmount: 9200,
          gratuityAmount: 18000,
          tenureServed: '4 Years 9 Months',
          gratuityFormula: '21 Days per Year',
          noticePeriodSalary: 15000,
          noticeDays: 30,
          pendingSalaryAmount: 0,
          pendingExpenseAmount: 850,
          deductions: 0,
          netPayout: 34200,
          status: 'Pending Audit',
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
      },
    ]);
  }
}

export const offboardingRecordRepository = new OffboardingRecordRepository();
