import { benefitAdvanceRepository, BenefitAdvanceRepository } from './benefitAdvance.repository';
import {
  IBenefitAdvanceDocument,
  IBenefitSchemeDocument,
  CreateBenefitAdvanceDTO,
  BenefitAdvanceQueryParams,
  CreateBenefitSchemeDTO,
  UpdateBenefitSchemeDTO,
  BenefitAdvanceStatus,
} from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class BenefitAdvanceService {
  constructor(private repo: BenefitAdvanceRepository = benefitAdvanceRepository) {}

  // ─── Applications ──────────────────────────────────────────────────────────
  async getAll(params: BenefitAdvanceQueryParams = {}): Promise<{ items: IBenefitAdvanceDocument[]; total: number }> {
    return this.repo.findAll(params);
  }

  async getById(id: string): Promise<IBenefitAdvanceDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Benefit advance with id ${id} not found`);
    }
    return item;
  }

  async create(data: CreateBenefitAdvanceDTO): Promise<IBenefitAdvanceDocument> {
    const advanceId = `BA-${Math.floor(100 + Math.random() * 900)}`;
    const dateRequested = new Date().toISOString().split('T')[0];

    const initialHistory = [
      {
        status: 'Pending' as BenefitAdvanceStatus,
        changedBy: data.employeeName,
        timestamp: new Date().toISOString(),
        remarks: 'Application submitted',
      },
    ];

    return this.repo.create({
      ...data,
      advanceId,
      status: 'Pending',
      dateRequested,
      history: initialHistory,
    });
  }

  async updateStatus(
    id: string,
    status: BenefitAdvanceStatus,
    remarks?: string,
    approvedBy: string = 'HR Admin'
  ): Promise<IBenefitAdvanceDocument> {
    const record = await this.getById(id);

    // Prevent duplicate approval
    if (record.status === 'Approved' && status === 'Approved') {
      return record;
    }

    const historyItem = {
      status,
      changedBy: approvedBy,
      timestamp: new Date().toISOString(),
      remarks: remarks || `Status marked as ${status}`,
    };

    const updated = await this.repo.update(id, {
      status,
      approvalRemarks: remarks,
      approvedBy,
      approvedAt: new Date().toISOString(),
      history: [...(record.history || []), historyItem],
    });

    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }

  // ─── Schemes ───────────────────────────────────────────────────────────────
  async getSchemes(category?: string, tab?: string): Promise<IBenefitSchemeDocument[]> {
    return this.repo.findSchemes(category, tab);
  }

  async getSchemeById(id: string): Promise<IBenefitSchemeDocument> {
    const item = await this.repo.findSchemeById(id);
    if (!item) {
      throw AppError.notFound(`Benefit scheme with id ${id} not found`);
    }
    return item;
  }

  async createScheme(data: CreateBenefitSchemeDTO): Promise<IBenefitSchemeDocument> {
    return this.repo.createScheme(data);
  }

  async updateScheme(id: string, data: UpdateBenefitSchemeDTO): Promise<IBenefitSchemeDocument> {
    await this.getSchemeById(id);
    const updated = await this.repo.updateScheme(id, data);
    return updated!;
  }
}

export const benefitAdvanceService = new BenefitAdvanceService();
