import { payrollRecordRepository, PayrollRecordRepository } from './payrollRecord.repository';
import {
  IPayrollRecordDocument,
  CreatePayrollRecordDTO,
  PayrollRecordQueryParams,
  PayrollReportsSummary,
} from '../payroll.types';
import { payrollCalculationService } from '../payrollCalculation.service';
import { AppError } from '../../../common/errors/AppError';

export class PayrollRecordService {
  constructor(private repo: PayrollRecordRepository = payrollRecordRepository) {}

  async getAll(params: PayrollRecordQueryParams = {}): Promise<{ items: IPayrollRecordDocument[]; total: number }> {
    return this.repo.findAll(params);
  }

  async getById(id: string): Promise<IPayrollRecordDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Payroll record with id ${id} not found`);
    }
    return item;
  }

  async create(data: CreatePayrollRecordDTO): Promise<IPayrollRecordDocument> {
    const calc = payrollCalculationService.calculate({
      basicSalary: data.basicSalary || data.amount || 2500,
      allowances: data.allowances,
      bonuses: data.bonuses,
      incentives: data.incentives,
      taxRatePercent: 10,
    });

    return this.repo.create({
      ...data,
      basicSalary: calc.basicSalary,
      allowances: calc.allowances,
      bonuses: calc.bonuses,
      incentives: calc.incentives,
      grossSalary: calc.grossSalary,
      taxDeductions: calc.taxDeductions,
      totalDeductions: calc.totalDeductions,
      netSalary: calc.netSalary,
      amount: data.amount || calc.netSalary,
      status: data.status || 'Pending',
      category: data.category || 'statement',
      date: data.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      period: data.period || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    });
  }

  async update(id: string, data: Partial<IPayrollRecordDocument>): Promise<IPayrollRecordDocument> {
    await this.getById(id);
    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async pay(
    id: string,
    amount?: number,
    paymentMethod = 'Bank Transfer',
    transactionRef?: string,
    notes?: string
  ): Promise<IPayrollRecordDocument> {
    const record = await this.getById(id);
    const finalAmount = amount !== undefined && amount > 0 ? amount : (record.netSalary || record.amount || record.grossSalary || 0);

    const ref = transactionRef || `TXN-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paidAt = new Date().toISOString();

    const updated = await this.repo.update(id, {
      status: 'Paid',
      paidAmount: finalAmount,
      paymentMethod,
      transactionRef: ref,
      paidAt,
      notes: notes || record.notes,
    });

    return updated!;
  }

  async generateSlip(id: string): Promise<IPayrollRecordDocument> {
    const record = await this.getById(id);
    const slipUrl = `/slips/slip-${record.employeeId || record._id}-${Date.now()}.pdf`;
    const slipPublishedDate = new Date().toISOString().split('T')[0];

    const updated = await this.repo.update(id, {
      slipsGenerated: true,
      slipUrl,
      slipPublishedDate,
    });

    return updated!;
  }

  async approvePayOnRequest(
    id: string,
    status: 'Approved' | 'Rejected',
    approvalRemarks?: string,
    approvedBy: string = 'HR Finance'
  ): Promise<IPayrollRecordDocument> {
    const record = await this.getById(id);
    const payOnRequestDetails = {
      ...(record.payOnRequestDetails || {}),
      approvedBy,
      approvalRemarks: approvalRemarks || `Request marked as ${status}`,
    };

    const updated = await this.repo.update(id, {
      status: status === 'Approved' ? 'Paid' : 'Failed',
      paidAmount: status === 'Approved' ? (record.payOnRequestDetails?.requestedAmount || record.amount) : 0,
      paidAt: status === 'Approved' ? new Date().toISOString() : undefined,
      payOnRequestDetails,
    });

    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async getReportsSummary(): Promise<PayrollReportsSummary> {
    return this.repo.getReportsSummary();
  }

  async getEmploymentStatusSummary() {
    return this.repo.getEmploymentStatusSummary();
  }

  // Backward-compatibility aliases
  getRecords = this.getAll;
  getRecordById = this.getById;
  createRecord = this.create;
  updateRecord = this.update;
  deleteRecord = this.delete;
  getReportsAndAnalytics = this.getReportsSummary;
  async processPayment(
    id: string,
    payload: {
      amount?: number;
      paymentMethod?: string;
      notes?: string;
      remarks?: string;
      transactionRef?: string;
      transactionReference?: string;
    }
  ) {
    return this.pay(
      id,
      payload.amount,
      payload.paymentMethod,
      payload.transactionRef || payload.transactionReference,
      payload.remarks || payload.notes
    );
  }
}

export const payrollRecordService = new PayrollRecordService();
