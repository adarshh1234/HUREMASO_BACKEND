import { offboardingRecordRepository, OffboardingRecordRepository } from './offboardingRecord.repository';
import {
  IOffboardingRecordDocument,
  CreateOffboardingRecordDTO,
  OffboardingQueryParams,
  OffboardingReportsSummary,
  IOffboardingPerformance,
  IOffboardingSettlement,
  IOffboardingLegal,
  IOffboardingAssets,
  IOffboardingTravel,
  IOffboardingCustomField,
} from '../offboarding.types';
import { AppError } from '../../../common/errors/AppError';

export class OffboardingRecordService {
  constructor(private repo: OffboardingRecordRepository = offboardingRecordRepository) {}

  async getAll(query: OffboardingQueryParams): Promise<{ items: IOffboardingRecordDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getById(id: string): Promise<IOffboardingRecordDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Offboarding record with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: CreateOffboardingRecordDTO): Promise<IOffboardingRecordDocument> {
    const recordId = `OFF-${Math.floor(100 + Math.random() * 900)}`;
    const exitDate = data.exitDate || data.lastWorkingDate || new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const lastWorkingDate = data.lastWorkingDate || exitDate;
    const resignationDate = data.resignationDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const separationType = data.separationType || 'Resignation';
    const status = data.status || 'Initiated';
    const hrPersonnel = data.hrPersonnel || 'HR Operations Team';

    const defaultResignationContent = `Dear Management,\n\nPlease accept this letter as formal notification of my resignation from the position of ${data.role} at Huremaso Global, with my last working day scheduled for ${lastWorkingDate}.\n\nReason: ${data.reason || 'Career progression & personal opportunities'}.\n\nI want to thank you for the professional growth and support provided to me during my time with the organization.\n\nSincerely,\n${data.employeeName}`;
    const defaultTerminationContent = `Dear ${data.employeeName},\n\nThis letter serves as formal notification regarding your separation from Huremaso Global from the position of ${data.role}, effective ${lastWorkingDate}.\n\nSeparation Type: ${separationType}.\nTerms: Standard transition and severance package terms as per company policy.\n\nSincerely,\n${hrPersonnel}\nHuremaso HR Operations`;

    return this.repo.create({
      ...data,
      recordId,
      exitDate,
      lastWorkingDate,
      resignationDate,
      hrPersonnel,
      separationType,
      status,
      documents: {
        resignationLetter: {
          status: separationType === 'Resignation' ? 'Submitted' : 'Not Applicable',
          noticeDuration: data.noticeDuration || '30 Days',
          reason: data.reason || 'Career progression & personal opportunities',
          submittedDate: new Date().toISOString().split('T')[0],
          resignationDate,
          lastWorkingDate,
          letterContent: separationType === 'Resignation' ? defaultResignationContent : '',
        },
        terminationLetter: {
          status: separationType === 'Termination' || separationType === 'Mutual Separation' ? 'Issued' : 'Not Applicable',
          terminationType: separationType,
          terminationReason: data.reason || 'Organizational restructuring / separation agreement',
          effectiveDate: lastWorkingDate,
          severanceDetails: separationType === 'Mutual Separation' ? '2 Months Severance Pay & Healthcare Continuation' : 'Standard exit terms apply',
          issuedDate: new Date().toISOString().split('T')[0],
          letterContent: separationType !== 'Resignation' ? defaultTerminationContent : '',
        },
      },
      performance: {
        milestones: [
          { date: 'Initial Date', event: `Joined as ${data.role}`, detail: `Onboarded into ${data.department}` },
          { date: 'Recent Review', event: 'Tenure Accomplishment', detail: 'Consistent contribution to core team deliverables' },
        ],
        history: [
          { period: 'Tenure Start - Present', position: data.role, department: data.department, type: 'Joining', details: `Active contributor in ${data.department}` },
        ],
        appraisals: [
          { cycle: 'Exit Performance Review', rating: 4.5, managerFeedback: 'Consistent technical performance throughout employment', achievements: 'Project delivery on schedule', date: new Date().toISOString().split('T')[0] },
        ],
        references: [],
        overallRating: 4.5,
        exitScore: 'Standard Release',
        rehireEligible: true,
        projectHandoverComplete: false,
        experienceCertificateIssued: false,
      },
      settlement: {
        basicSalary: 9500,
        unpaidSalary: 0,
        allowances: 1500,
        bonuses: 1000,
        otherCompensation: 500,
        grossPayout: 22500,
        encashableLeaveDays: 10,
        leaveEncashmentAmount: 4500,
        gratuityAmount: 9500,
        tenureServed: '2 Years',
        gratuityFormula: '21 Days per Year',
        noticePeriodSalary: 5500,
        noticePeriodDeduction: 0,
        noticeDays: 30,
        pendingSalaryAmount: 0,
        pendingExpenseAmount: 500,
        otherBenefits: 1000,
        assetDeductions: 0,
        otherDeductions: 0,
        deductions: 0,
        netPayout: 22500,
        currency: 'USD',
        status: 'Pending Audit',
        auditHistory: [
          { action: 'Settlement Initiated', changedBy: hrPersonnel, date: new Date().toISOString().split('T')[0], notes: 'Initial offboarding calculation created' },
        ],
      },
      legal: {
        chequeVoucherNo: `CHQ-2026-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
        chequeAmount: 22500,
        chequeStatus: 'Prepared',
        visaType: 'Work Employment Visa',
        visaExpiryDate: '2028-12-31',
        visaCancellationStatus: 'Active',
        visaGracePeriodDays: 30,
        insuranceDelisted: false,
        pccStatus: 'Pending',
        nocIssued: false,
      },
      assets: {
        items: [
          { name: 'Corporate Laptop Workstation', tag: `ASSET-${Math.floor(1000 + Math.random() * 9000)}`, category: 'Hardware', status: 'Possessed', assignedDate: '2024-01-15', condition: 'Good', deductionCost: 0 },
          { name: 'Building Access Smartcard', tag: `SEC-${Math.floor(100 + Math.random() * 900)}`, category: 'Access Card', status: 'Possessed', assignedDate: '2024-01-15', condition: 'Good', deductionCost: 0 },
        ],
        dependencies: [
          { task: 'Corporate Email & Google Workspace Deactivation', category: 'Access', status: 'Pending', serviceName: 'Google Workspace' },
          { task: 'Internal VPN & Cloud Infrastructure Revocation', category: 'Access', status: 'Pending', serviceName: 'Corporate VPN' },
          { task: 'Work Handover & Documentation Sign-off', category: 'Handover', status: 'In Progress', serviceName: 'Direct Manager' },
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
      customFields: [],
    });
  }

  async update(id: string, data: Partial<IOffboardingRecordDocument>): Promise<IOffboardingRecordDocument> {
    await this.getById(id);
    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async updateDocument(id: string, docPayload: any): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const documents = { ...record.documents };
    const rawType = docPayload.docType || docPayload.type;
    const isResignation = rawType === 'resignation' || rawType === 'resignationLetter';
    const isTermination = rawType === 'termination' || rawType === 'terminationLetter';
    const { docType, type, ...rest } = docPayload;

    if (isResignation) {
      const resignationDate = rest.resignationDate || documents.resignationLetter?.resignationDate || new Date().toISOString().split('T')[0];
      const lastWorkingDate = rest.lastWorkingDate || documents.resignationLetter?.lastWorkingDate || record.exitDate;
      const noticeDuration = rest.noticeDuration || documents.resignationLetter?.noticeDuration || '30 Days';
      const reason = rest.reason || documents.resignationLetter?.reason || 'Career transition';

      const letterContent = rest.letterContent || documents.resignationLetter?.letterContent ||
        `Dear Management,\n\nPlease accept this letter as formal notification of my resignation from the position of ${record.role} at Huremaso Global, effective ${lastWorkingDate}.\n\nNotice Period: ${noticeDuration}\nReason: ${reason}\n\nThank you for the guidance and opportunities during my employment.\n\nSincerely,\n${record.employeeName}`;

      documents.resignationLetter = {
        ...documents.resignationLetter,
        ...rest,
        resignationDate,
        lastWorkingDate,
        noticeDuration,
        reason,
        letterContent,
      };
    } else if (isTermination) {
      const effectiveDate = rest.effectiveDate || documents.terminationLetter?.effectiveDate || record.exitDate;
      const terminationType = rest.terminationType || documents.terminationLetter?.terminationType || record.separationType || 'Mutual Separation Agreement';
      const severanceDetails = rest.severanceDetails || documents.terminationLetter?.severanceDetails || 'Standard severance package';
      const terminationReason = rest.terminationReason || rest.reason || documents.terminationLetter?.terminationReason || 'Separation agreement';

      const letterContent = rest.letterContent || documents.terminationLetter?.letterContent ||
        `Dear ${record.employeeName},\n\nThis letter confirms your separation from Huremaso Global from the position of ${record.role}, effective ${effectiveDate}.\n\nType: ${terminationType}\nDetails: ${severanceDetails}\n\nSincerely,\nHuremaso HR Operations`;

      documents.terminationLetter = {
        ...documents.terminationLetter,
        ...rest,
        effectiveDate,
        terminationType,
        severanceDetails,
        terminationReason,
        letterContent,
      };
    }

    const updated = await this.repo.update(id, { documents });
    return updated!;
  }

  async updatePerformance(id: string, performanceData: Partial<IOffboardingPerformance>): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const performance = { ...record.performance, ...performanceData };
    const updated = await this.repo.update(id, { performance });
    return updated!;
  }

  async updateSettlement(id: string, settlementData: Partial<IOffboardingSettlement> & { auditAction?: string }): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const existing = record.settlement || {};

    const basicSalary = settlementData.basicSalary ?? existing.basicSalary ?? 10000;
    const unpaidSalary = settlementData.unpaidSalary ?? existing.unpaidSalary ?? 0;
    const allowances = settlementData.allowances ?? existing.allowances ?? 2000;
    const bonuses = settlementData.bonuses ?? existing.bonuses ?? 1500;
    const otherCompensation = settlementData.otherCompensation ?? existing.otherCompensation ?? 0;
    const leaveEncashmentAmount = settlementData.leaveEncashmentAmount ?? existing.leaveEncashmentAmount ?? 5000;
    const gratuityAmount = settlementData.gratuityAmount ?? existing.gratuityAmount ?? 10000;
    const noticePeriodSalary = settlementData.noticePeriodSalary ?? existing.noticePeriodSalary ?? 5000;
    const pendingSalaryAmount = settlementData.pendingSalaryAmount ?? existing.pendingSalaryAmount ?? 0;
    const pendingExpenseAmount = settlementData.pendingExpenseAmount ?? existing.pendingExpenseAmount ?? 500;
    const otherBenefits = settlementData.otherBenefits ?? existing.otherBenefits ?? 1000;

    // Gross exit payout sum
    const grossPayout = settlementData.grossPayout ?? (
      basicSalary +
      unpaidSalary +
      allowances +
      bonuses +
      otherCompensation +
      leaveEncashmentAmount +
      gratuityAmount +
      noticePeriodSalary +
      pendingSalaryAmount +
      pendingExpenseAmount +
      otherBenefits
    );

    const assetDeductions = settlementData.assetDeductions ?? existing.assetDeductions ?? (record.assets?.totalDeductions || 0);
    const otherDeductions = settlementData.otherDeductions ?? existing.otherDeductions ?? 0;
    const noticePeriodDeduction = settlementData.noticePeriodDeduction ?? existing.noticePeriodDeduction ?? 0;

    const deductions = settlementData.deductions ?? (assetDeductions + otherDeductions + noticePeriodDeduction);
    const netPayout = Math.max(0, grossPayout - deductions);

    const auditHistory = [...(existing.auditHistory || [])];
    if (settlementData.status && settlementData.status !== existing.status) {
      auditHistory.push({
        action: `Status changed to ${settlementData.status}`,
        changedBy: 'Authorized HR Finance Officer',
        date: new Date().toISOString().split('T')[0],
        notes: settlementData.auditAction || 'Settlement workflow update',
      });
    }

    const disbursedDate = settlementData.status === 'Disbursed'
      ? (settlementData.disbursedDate || new Date().toISOString().split('T')[0])
      : existing.disbursedDate;

    const paymentReference = settlementData.paymentReference || existing.paymentReference || (settlementData.status === 'Disbursed' ? `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}` : undefined);

    const settlement: IOffboardingSettlement = {
      ...existing,
      ...settlementData,
      basicSalary,
      unpaidSalary,
      allowances,
      bonuses,
      otherCompensation,
      grossPayout,
      leaveEncashmentAmount,
      gratuityAmount,
      noticePeriodSalary,
      noticePeriodDeduction,
      pendingSalaryAmount,
      pendingExpenseAmount,
      otherBenefits,
      assetDeductions,
      otherDeductions,
      deductions,
      netPayout,
      status: settlementData.status || existing.status || 'Pending Audit',
      disbursedDate,
      paymentReference,
      auditHistory,
    };

    const updated = await this.repo.update(id, { settlement });
    return updated!;
  }

  async updateLegal(id: string, legalData: Partial<IOffboardingLegal>): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const legal = { ...record.legal, ...legalData };
    const updated = await this.repo.update(id, { legal });
    return updated!;
  }

  async updateAssets(id: string, assetsData: Partial<IOffboardingAssets>): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const currentAssets = record.assets || {};

    const items = assetsData.items ?? currentAssets.items ?? [];
    const missingItems = assetsData.missingItems ?? currentAssets.missingItems ?? [];
    const dependencies = assetsData.dependencies ?? currentAssets.dependencies ?? [];

    let totalDeductions = assetsData.totalDeductions ?? 0;
    if (assetsData.totalDeductions === undefined) {
      let calcDeductions = 0;
      for (const item of items) {
        if (item.status === 'Damaged' || item.status === 'Missing') {
          calcDeductions += item.deductionCost || 0;
        }
      }
      for (const missing of missingItems) {
        if (missing.deductionApproved) {
          calcDeductions += missing.deductionAmount || 0;
        }
      }
      totalDeductions = calcDeductions;
    }

    const allReturned = items.every((i) => i.status === 'Returned');
    const allDepsComplete = dependencies.every((d) => d.status === 'Completed' || d.status === 'Signed Off');
    const isFullyCleared = assetsData.isFullyCleared ?? (allReturned && allDepsComplete && (assetsData.inspectionPassed ?? currentAssets.inspectionPassed ?? true));

    const assets: IOffboardingAssets = {
      ...currentAssets,
      ...assetsData,
      items,
      missingItems,
      dependencies,
      totalDeductions,
      isFullyCleared,
    };

    const updated = await this.repo.update(id, { assets });

    // If deductions changed, automatically update settlement asset deductions
    if (totalDeductions !== record.settlement?.assetDeductions) {
      await this.updateSettlement(id, {
        assetDeductions: totalDeductions,
      });
      return (await this.getById(id))!;
    }

    return updated!;
  }

  async updateTravel(id: string, travelData: Partial<IOffboardingTravel>): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const travel = { ...record.travel, ...travelData };
    const updated = await this.repo.update(id, { travel });
    return updated!;
  }

  async updateCustomFields(id: string, customFields: IOffboardingCustomField[]): Promise<IOffboardingRecordDocument> {
    await this.getById(id);
    const updated = await this.repo.update(id, { customFields });
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async getReportsSummary(): Promise<OffboardingReportsSummary> {
    return this.repo.getReportsSummary();
  }
}

export const offboardingRecordService = new OffboardingRecordService();
