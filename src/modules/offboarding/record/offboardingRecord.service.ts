import { offboardingRecordRepository, OffboardingRecordRepository } from './offboardingRecord.repository';
import { IOffboardingRecordDocument, CreateOffboardingRecordDTO, OffboardingQueryParams, OffboardingReportsSummary } from '../offboarding.types';
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
    const exitDate = data.exitDate || new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    return this.repo.create({
      ...data,
      recordId,
      exitDate,
      status: data.status || 'Notice Period',
      documents: {
        resignationLetter: {
          status: data.separationType === 'Resignation' ? 'Submitted' : 'Not Applicable',
          noticeDuration: data.noticeDuration || '30 Days',
          reason: data.reason || 'Career progression & personal reasons',
          submittedDate: new Date().toISOString().split('T')[0],
        },
        terminationLetter: {
          status: data.separationType === 'Termination' ? 'Issued' : 'Not Applicable',
          terminationType: data.separationType || '',
          severanceDetails: '',
        },
      },
      settlement: {
        grossPayout: 25000,
        encashableLeaveDays: 10,
        leaveEncashmentAmount: 5000,
        gratuityAmount: 12000,
        tenureServed: '3 Years',
        gratuityFormula: '21 Days per Year',
        noticePeriodSalary: 8000,
        noticeDays: 30,
        pendingSalaryAmount: 0,
        pendingExpenseAmount: 500,
        deductions: 0,
        netPayout: 25000,
        status: 'Pending Audit',
      },
      legal: {
        chequeVoucherNo: `CHQ-2026-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
        chequeAmount: 25000,
        chequeStatus: 'Prepared',
        visaCancellationStatus: 'Active',
        visaGracePeriodDays: 30,
        insuranceDelisted: false,
        pccStatus: 'Pending',
        nocIssued: false,
      },
      assets: {
        items: [
          { name: 'MacBook Pro M3', tag: `ASSET-2026-IT-${Math.floor(100 + Math.random() * 900)}`, category: 'Hardware', status: 'Possessed', deductionCost: 0 },
          { name: 'Smart Keycard Badge', tag: `ASSET-SEC-${Math.floor(100 + Math.random() * 900)}`, category: 'Access Card', status: 'Possessed', deductionCost: 0 },
        ],
        dependencies: [
          { task: 'GitHub Repository Admin Access Revocation', category: 'Access', status: 'Pending' },
          { task: 'AWS Cloud Console IAM Account Deactivation', category: 'Access', status: 'Pending' },
          { task: 'Project Architecture Knowledge Transfer Session', category: 'Handover', status: 'In Progress' },
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
      documents.resignationLetter = { ...documents.resignationLetter, ...rest };
    } else if (isTermination) {
      documents.terminationLetter = { ...documents.terminationLetter, ...rest };
    }
    const updated = await this.repo.update(id, { documents });
    return updated!;
  }

  async updateSettlement(id: string, settlementData: any): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const gross = settlementData.grossPayout ?? record.settlement.grossPayout;
    const deductions = settlementData.deductions ?? record.settlement.deductions;
    const netPayout = Math.max(0, gross - deductions);

    const settlement = {
      ...record.settlement,
      ...settlementData,
      netPayout,
    };
    const updated = await this.repo.update(id, { settlement });
    return updated!;
  }

  async updateLegal(id: string, legalData: any): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const legal = { ...record.legal, ...legalData };
    const updated = await this.repo.update(id, { legal });
    return updated!;
  }

  async updateAssets(id: string, assetsData: any): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const assets = { ...record.assets, ...assetsData };
    const updated = await this.repo.update(id, { assets });
    return updated!;
  }

  async updateTravel(id: string, travelData: any): Promise<IOffboardingRecordDocument> {
    const record = await this.getById(id);
    const travel = { ...record.travel, ...travelData };
    const updated = await this.repo.update(id, { travel });
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
