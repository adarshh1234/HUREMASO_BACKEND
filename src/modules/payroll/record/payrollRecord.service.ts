import { payrollRecordRepository, PayrollRecordRepository } from './payrollRecord.repository';
import { IPayrollRecordDocument, CreatePayrollRecordDTO, PayRecordDTO, PayrollRecordQueryParams } from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class PayrollRecordService {
  constructor(private repo: PayrollRecordRepository = payrollRecordRepository) {}

  async getRecords(query: PayrollRecordQueryParams): Promise<{ items: IPayrollRecordDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getRecordById(id: string): Promise<IPayrollRecordDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Payroll record with ID '${id}' not found`);
    }
    return item;
  }

  async createRecord(data: CreatePayrollRecordDTO): Promise<IPayrollRecordDocument> {
    return this.repo.create({
      ...data,
      date: data.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      period: data.period || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      status: data.status || 'Pending',
      paidAmount: data.status === 'Paid' ? data.amount : 0,
    });
  }

  async processPayment(id: string, paymentData: PayRecordDTO): Promise<IPayrollRecordDocument> {
    const record = await this.getRecordById(id);

    if (record.status === 'Paid') {
      throw AppError.badRequest(`This payroll record has already been paid.`);
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw AppError.badRequest(`Payment amount must be greater than zero.`);
    }

    const updated = await this.repo.update(id, {
      status: 'Paid',
      paidAmount: paymentData.amount,
      paidAt: new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      transactionRef: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: paymentData.notes || record.notes,
    });

    if (!updated) {
      throw AppError.notFound(`Payroll record could not be updated.`);
    }

    return updated;
  }

  async updateRecord(id: string, data: Partial<IPayrollRecordDocument>): Promise<IPayrollRecordDocument> {
    await this.getRecordById(id);
    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async deleteRecord(id: string): Promise<void> {
    await this.getRecordById(id);
    await this.repo.delete(id);
  }

  async getReportsAndAnalytics() {
    return this.repo.getReportsSummary();
  }
}

export const payrollRecordService = new PayrollRecordService();
