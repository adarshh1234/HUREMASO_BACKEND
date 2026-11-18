import { salaryDisbursementRepository, SalaryDisbursementRepository } from './salaryDisbursement.repository';
import {
  ISalaryDisbursementDocument,
  CreateSalaryDisbursementDTO,
  SalaryDisbursementQueryParams,
  DisbursementSummary,
  DisbursementStatus,
} from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class SalaryDisbursementService {
  constructor(private repo: SalaryDisbursementRepository = salaryDisbursementRepository) {}

  async getAll(query: SalaryDisbursementQueryParams = {}): Promise<{ items: ISalaryDisbursementDocument[]; total: number }> {
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
    const disbursementId = `DISB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const deductions = data.deductions !== undefined ? data.deductions : 0;
    const netAmount = data.netAmount !== undefined ? data.netAmount : Math.max(0, data.grossAmount - deductions);

    return this.repo.create({
      ...data,
      disbursementId,
      deductions,
      netAmount,
      status: data.status || 'Pending',
      method: data.method || 'Bank Transfer',
    });
  }

  async disburse(id: string, transactionRef?: string, remarks?: string): Promise<ISalaryDisbursementDocument> {
    const record = await this.getById(id);

    // Prevent duplicate disbursement
    if (record.status === 'Paid') {
      return record;
    }

    const ref = transactionRef || `TXN-DISB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const disbursedAt = new Date().toISOString();

    const updated = await this.repo.update(id, {
      status: 'Paid',
      disbursedAt,
      transactionRef: ref,
      remarks: remarks || record.remarks,
    });

    return updated!;
  }

  async updateStatus(id: string, status: DisbursementStatus, remarks?: string, transactionRef?: string): Promise<ISalaryDisbursementDocument> {
    const record = await this.getById(id);
    const updateData: Partial<ISalaryDisbursementDocument> = { status };
    if (remarks) updateData.remarks = remarks;
    if (transactionRef) updateData.transactionRef = transactionRef;
    if (status === 'Paid' && !record.disbursedAt) {
      updateData.disbursedAt = new Date().toISOString();
      if (!updateData.transactionRef && !record.transactionRef) {
        updateData.transactionRef = `TXN-DISB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const updated = await this.repo.update(id, updateData);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async getSummary(): Promise<DisbursementSummary> {
    return this.repo.getSummary();
  }
}

export const salaryDisbursementService = new SalaryDisbursementService();
