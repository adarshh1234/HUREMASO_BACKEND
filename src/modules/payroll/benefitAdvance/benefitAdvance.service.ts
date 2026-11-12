import { benefitAdvanceRepository, BenefitAdvanceRepository } from './benefitAdvance.repository';
import { IBenefitAdvanceDocument, CreateBenefitAdvanceDTO, BenefitAdvanceQueryParams, BenefitAdvanceStatus } from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class BenefitAdvanceService {
  constructor(private repo: BenefitAdvanceRepository = benefitAdvanceRepository) {}

  async getAll(query: BenefitAdvanceQueryParams): Promise<{ items: IBenefitAdvanceDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getById(id: string): Promise<IBenefitAdvanceDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Benefit advance with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: CreateBenefitAdvanceDTO): Promise<IBenefitAdvanceDocument> {
    const advanceId = `BA-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    return this.repo.create({
      ...data,
      advanceId,
      dateRequested: today,
      status: 'Pending',
    });
  }

  async updateStatus(id: string, status: BenefitAdvanceStatus, notes?: string): Promise<IBenefitAdvanceDocument> {
    await this.getById(id);
    const updateData: Partial<IBenefitAdvanceDocument> = { status };
    if (notes) updateData.notes = notes;
    const updated = await this.repo.update(id, updateData);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}

export const benefitAdvanceService = new BenefitAdvanceService();
