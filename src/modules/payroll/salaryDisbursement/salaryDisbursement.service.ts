import { salaryDisbursementRepository, SalaryDisbursementRepository } from './salaryDisbursement.repository';
import { ISalaryDisbursementDocument, CreateSalaryDisbursementDTO, SalaryDisbursementQueryParams, DisbursementStatus, DisbursementSummary } from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class SalaryDisbursementService {
  constructor(private repo: SalaryDisbursementRepository = salaryDisbursementRepository) {}

  async getAll(query: SalaryDisbursementQueryParams): Promise<{ items: ISalaryDisbursementDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getById(id: string): Promise<ISalaryDisbursementDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Salary disbursement record with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: CreateSalaryDisbursementDTO): Promise<ISalaryDisbursementDocument> {
    const disbursementId = `DISB-${Math.floor(100 + Math.random() * 900)}`;
    const deductions = data.deductions || 0;
    const netAmount = Math.max(0, data.grossAmount - deductions);
    return this.repo.create({
      ...data,
      disbursementId,
      deductions,
      netAmount,
      method: data.method || 'Bank Transfer',
      status: 'Pending',
    });
  }

  async disburse(id: string): Promise<ISalaryDisbursementDocument> {
    const item = await this.getById(id);
    if (item.status === 'Paid') {
      throw AppError.badRequest('This record has already been disbursed.');
    }
    const today = new Date().toISOString().split('T')[0];
    const updated = await this.repo.update(id, {
      status: 'Paid',
      disbursedAt: today,
    });
    return updated!;
  }

  async updateStatus(id: string, status: DisbursementStatus): Promise<ISalaryDisbursementDocument> {
    await this.getById(id);
    const updateData: Partial<ISalaryDisbursementDocument> = { status };
    if (status === 'Paid') {
      updateData.disbursedAt = new Date().toISOString().split('T')[0];
    }
    const updated = await this.repo.update(id, updateData);
    return updated!;
  }

  async getSummary(): Promise<DisbursementSummary> {
    return this.repo.getSummary();
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}

export const salaryDisbursementService = new SalaryDisbursementService();
