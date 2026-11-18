import { SalaryDisbursementModel } from './salaryDisbursement.model';
import { ISalaryDisbursementDocument, SalaryDisbursementQueryParams, DisbursementSummary } from '../payroll.types';
import { escapeRegex } from '../../../common/utils/regex';

export class SalaryDisbursementRepository {
  async create(data: Partial<ISalaryDisbursementDocument>): Promise<ISalaryDisbursementDocument> {
    const item = new SalaryDisbursementModel(data);
    return item.save();
  }

  async findById(id: string): Promise<ISalaryDisbursementDocument | null> {
    return SalaryDisbursementModel.findById(id);
  }

  async update(id: string, data: Partial<ISalaryDisbursementDocument>): Promise<ISalaryDisbursementDocument | null> {
    return SalaryDisbursementModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<ISalaryDisbursementDocument | null> {
    return SalaryDisbursementModel.findByIdAndDelete(id);
  }

  async findAll(params: SalaryDisbursementQueryParams = {}): Promise<{ items: ISalaryDisbursementDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { employeeName: regex },
        { department: regex },
        { disbursementId: regex },
        { period: regex },
        { transactionRef: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.department && params.department !== 'All') {
      query.department = { $regex: new RegExp(`^${escapeRegex(params.department)}$`, 'i') };
    }

    if (params.period && params.period !== 'All') {
      query.period = params.period;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      SalaryDisbursementModel.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      SalaryDisbursementModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getSummary(): Promise<DisbursementSummary> {
    await this.seedIfEmpty();
    const records = await SalaryDisbursementModel.find();

    let totalGross = 0;
    let totalNet = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    for (const r of records) {
      totalGross += r.grossAmount || 0;
      totalNet += r.netAmount || 0;
      if (r.status === 'Paid') {
        totalPaid += r.netAmount || 0;
        paidCount++;
      } else {
        totalPending += r.netAmount || 0;
        pendingCount++;
      }
    }

    return {
      totalGross: Math.round(totalGross),
      totalNet: Math.round(totalNet),
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending),
      count: records.length,
      paidCount,
      pendingCount,
    };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await SalaryDisbursementModel.countDocuments();
    if (count > 0) return;

    await SalaryDisbursementModel.insertMany([
      { disbursementId: 'DISB-2025-001', employeeName: 'Sarah Jenkins', employeeId: 'EMP-1001', department: 'Executive', period: 'July 2025', grossAmount: 14500, deductions: 1750, netAmount: 12750, method: 'Bank Transfer', status: 'Paid', disbursedAt: '2025-07-20T10:00:00Z', transactionRef: 'WIRE-US-9982410-HR', remarks: 'Executive cycle wire cleared' },
      { disbursementId: 'DISB-2025-002', employeeName: 'David Vance', employeeId: 'EMP-1004', department: 'Engineering', period: 'July 2025', grossAmount: 10000, deductions: 1200, netAmount: 8800, method: 'Bank Transfer', status: 'Pending', remarks: 'Awaiting end-of-week payroll batch release' },
      { disbursementId: 'DISB-2025-003', employeeName: 'Elena Rostova', employeeId: 'EMP-1005', department: 'Marketing', period: 'July 2025', grossAmount: 8500, deductions: 1100, netAmount: 7400, method: 'Stripe', status: 'Paid', disbursedAt: '2025-07-20T10:15:00Z', transactionRef: 'STRIPE-CH-77821094', remarks: 'Direct deposit via Stripe Payroll' },
      { disbursementId: 'DISB-2025-004', employeeName: 'Marcus Brody', employeeId: 'EMP-1002', department: 'Product & Design', period: 'July 2025', grossAmount: 8150, deductions: 1000, netAmount: 7150, method: 'Bank Transfer', status: 'Pending', remarks: 'Pending direct deposit validation' },
      { disbursementId: 'DISB-2025-005', employeeName: 'Jason Wu', employeeId: 'EMP-1003', department: 'Operations', period: 'July 2025', grossAmount: 6100, deductions: 750, netAmount: 5350, method: 'Cheque', status: 'Paid', disbursedAt: '2025-07-20T11:30:00Z', transactionRef: 'CHQ-CORP-440192', remarks: 'Physical cheque voucher issued' },
    ]);
  }
}

export const salaryDisbursementRepository = new SalaryDisbursementRepository();
