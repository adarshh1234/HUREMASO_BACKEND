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
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.department && params.department !== 'All') {
      query.department = new RegExp(escapeRegex(params.department), 'i');
    }

    if (params.period) {
      query.period = new RegExp(escapeRegex(params.period), 'i');
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
    const items = await SalaryDisbursementModel.find();
    const totalGross = items.reduce((sum, item) => sum + (item.grossAmount || 0), 0);
    const totalNet = items.reduce((sum, item) => sum + (item.netAmount || 0), 0);
    const totalPaid = items.filter((i) => i.status === 'Paid').reduce((sum, item) => sum + (item.netAmount || 0), 0);
    const totalPending = items.filter((i) => i.status === 'Pending').reduce((sum, item) => sum + (item.netAmount || 0), 0);

    return {
      totalGross,
      totalNet,
      totalPaid,
      totalPending,
      count: items.length,
    };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await SalaryDisbursementModel.countDocuments();
    if (count > 0) return;
    await SalaryDisbursementModel.insertMany([
      { disbursementId: 'DISB-001', employeeName: 'Sarah Johnson', department: 'Marketing', period: 'July 2025', grossAmount: 8500, deductions: 1200, netAmount: 7300, method: 'Bank Transfer', status: 'Paid', disbursedAt: '2025-07-25' },
      { disbursementId: 'DISB-002', employeeName: 'Michael Chen', department: 'Engineering', period: 'July 2025', grossAmount: 11000, deductions: 1800, netAmount: 9200, method: 'Bank Transfer', status: 'Paid', disbursedAt: '2025-07-25' },
      { disbursementId: 'DISB-003', employeeName: 'James Wilson', department: 'Sales', period: 'July 2025', grossAmount: 7200, deductions: 900, netAmount: 6300, method: 'Bank Transfer', status: 'Pending' },
      { disbursementId: 'DISB-004', employeeName: 'Lisa Anderson', department: 'HR', period: 'July 2025', grossAmount: 6800, deductions: 850, netAmount: 5950, method: 'Cheque', status: 'Processing' },
      { disbursementId: 'DISB-005', employeeName: 'David Kim', department: 'Operations', period: 'July 2025', grossAmount: 9500, deductions: 1500, netAmount: 8000, method: 'Bank Transfer', status: 'Pending' },
    ]);
  }
}

export const salaryDisbursementRepository = new SalaryDisbursementRepository();
