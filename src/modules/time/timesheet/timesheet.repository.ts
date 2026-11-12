import { TimesheetModel } from './timesheet.model';
import { ITimesheetDocument, TimesheetQueryParams } from './timesheet.types';

export class TimesheetRepository {
  async findById(id: string): Promise<ITimesheetDocument | null> {
    return TimesheetModel.findById(id).populate('employeeId');
  }

  async findByEmployeeAndPeriod(employeeId: string, period: string): Promise<ITimesheetDocument | null> {
    return TimesheetModel.findOne({ employeeId, period }).populate('employeeId');
  }

  async save(timesheet: ITimesheetDocument): Promise<ITimesheetDocument> {
    return (await timesheet.save()).populate('employeeId');
  }

  async delete(id: string): Promise<ITimesheetDocument | null> {
    return TimesheetModel.findByIdAndDelete(id);
  }

  async findAll(params: TimesheetQueryParams): Promise<{ items: ITimesheetDocument[]; total: number }> {
    const query: any = {};

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.period) {
      query.period = params.period;
    }

    if (params.search) {
      query.$or = [
        { employeeName: { $regex: params.search, $options: 'i' } },
        { period: { $regex: params.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      TimesheetModel.find(query)
        .populate('employeeId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      TimesheetModel.countDocuments(query),
    ]);

    return { items, total };
  }
}

export const timesheetRepository = new TimesheetRepository();
