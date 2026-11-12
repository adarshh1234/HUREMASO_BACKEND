import { BenefitAdvanceModel } from './benefitAdvance.model';
import { IBenefitAdvanceDocument, BenefitAdvanceQueryParams } from '../payroll.types';
import { escapeRegex } from '../../../common/utils/regex';

export class BenefitAdvanceRepository {
  async create(data: Partial<IBenefitAdvanceDocument>): Promise<IBenefitAdvanceDocument> {
    const item = new BenefitAdvanceModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IBenefitAdvanceDocument | null> {
    return BenefitAdvanceModel.findById(id);
  }

  async update(id: string, data: Partial<IBenefitAdvanceDocument>): Promise<IBenefitAdvanceDocument | null> {
    return BenefitAdvanceModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IBenefitAdvanceDocument | null> {
    return BenefitAdvanceModel.findByIdAndDelete(id);
  }

  async findAll(params: BenefitAdvanceQueryParams = {}): Promise<{ items: IBenefitAdvanceDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { employeeName: regex },
        { benefitType: regex },
        { advanceId: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.category && params.category !== 'all') {
      query.category = params.category;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      BenefitAdvanceModel.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      BenefitAdvanceModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await BenefitAdvanceModel.countDocuments();
    if (count > 0) return;
    const today = new Date().toISOString().split('T')[0];
    await BenefitAdvanceModel.insertMany([
      { advanceId: 'BA-001', employeeName: 'Sarah Johnson', employeeId: 'EMP001', benefitType: 'Annual Health Check-up', category: 'benefit-advance', amount: 500, status: 'Approved', dateRequested: today },
      { advanceId: 'BA-002', employeeName: 'Michael Chen', employeeId: 'EMP002', benefitType: 'Annual Performance Bonus', category: 'employee-benefits', amount: 8000, status: 'Pending', dateRequested: today },
      { advanceId: 'BA-003', employeeName: 'James Wilson', employeeId: 'EMP003', benefitType: 'Sales Commission Incentive', category: 'performance-benefits', amount: 3500, status: 'Approved', dateRequested: today },
      { advanceId: 'BA-004', employeeName: 'Lisa Anderson', employeeId: 'EMP004', benefitType: 'Employees Provident Fund', category: 'other-benefits', amount: 1200, status: 'Approved', dateRequested: today },
      { advanceId: 'BA-005', employeeName: 'David Kim', employeeId: 'EMP005', benefitType: 'ESOP Plan 2025', category: 'employee-benefits', amount: 0, status: 'Pending', dateRequested: today },
    ]);
  }
}

export const benefitAdvanceRepository = new BenefitAdvanceRepository();
