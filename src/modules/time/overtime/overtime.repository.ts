import { OvertimeModel } from './overtime.model';
import { IOvertimeDocument, OvertimeQueryParams, IOvertimeMetrics } from './overtime.types';

export class OvertimeRepository {
  async create(data: Partial<IOvertimeDocument>): Promise<IOvertimeDocument> {
    const ot = new OvertimeModel(data);
    return (await ot.save()).populate('employeeId');
  }

  async findById(id: string): Promise<IOvertimeDocument | null> {
    return OvertimeModel.findById(id).populate('employeeId');
  }

  async update(id: string, data: Partial<IOvertimeDocument>): Promise<IOvertimeDocument | null> {
    return OvertimeModel.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('employeeId');
  }

  async delete(id: string): Promise<IOvertimeDocument | null> {
    return OvertimeModel.findByIdAndDelete(id);
  }

  async findAll(params: OvertimeQueryParams): Promise<{ items: IOvertimeDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { employeeName: { $regex: params.search, $options: 'i' } },
        { department: { $regex: params.search, $options: 'i' } },
        { reason: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    if (params.department) {
      query.department = { $regex: params.department, $options: 'i' };
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.fromDate || params.toDate) {
      query.date = {};
      if (params.fromDate) query.date.$gte = params.fromDate;
      if (params.toDate) query.date.$lte = params.toDate;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'date';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      OvertimeModel.find(query)
        .populate('employeeId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      OvertimeModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getMetrics(): Promise<IOvertimeMetrics> {
    const all = await OvertimeModel.find();
    let totalOtHours = 0;
    let pendingApprovalsCount = 0;
    let totalPayoutValuation = 0;

    all.forEach((item) => {
      totalOtHours += item.hours || 0;
      if (item.status === 'Pending' || item.status === 'Pending Approval') {
        pendingApprovalsCount++;
      }
      totalPayoutValuation += item.amount || 0;
    });

    return {
      totalOtHours,
      totalOtHoursText: `${totalOtHours.toFixed(1)} hrs`,
      pendingApprovalsCount,
      totalPayoutValuation,
      totalPayoutValuationText: `$${totalPayoutValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };
  }
}

export const overtimeRepository = new OvertimeRepository();
