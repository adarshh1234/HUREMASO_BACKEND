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

    if (params.employeeCode) {
      query.employeeCode = { $regex: params.employeeCode, $options: 'i' };
    }

    if (params.companyName) {
      query.companyName = { $regex: params.companyName, $options: 'i' };
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.period) {
      query.period = { $regex: params.period, $options: 'i' };
    }

    if (params.workType) {
      query.workType = params.workType;
    }

    if (params.loginSource) {
      query.loginSource = params.loginSource;
    }

    if (params.signInMethod) {
      query.signInMethod = params.signInMethod;
    }

    if (params.officeLocation) {
      query.officeLocation = { $regex: params.officeLocation, $options: 'i' };
    }

    if (params.projectName) {
      query.projectName = { $regex: params.projectName, $options: 'i' };
    }

    if (params.projectLocation) {
      query.projectLocation = { $regex: params.projectLocation, $options: 'i' };
    }

    if (params.siteLocation) {
      query.siteLocation = { $regex: params.siteLocation, $options: 'i' };
    }

    if (params.siteName) {
      query.$or = [
        { siteName: { $regex: params.siteName, $options: 'i' } },
        { projectName: { $regex: params.siteName, $options: 'i' } },
      ];
    }

    if (params.supervisorName) {
      query.supervisorName = { $regex: params.supervisorName, $options: 'i' };
    }

    if (params.assignedField) {
      query.assignedField = { $regex: params.assignedField, $options: 'i' };
    }

    if (params.location) {
      query.location = { $regex: params.location, $options: 'i' };
    }

    if (params.date) {
      query.$or = [
        { date: params.date },
        { periodStartDate: params.date },
        { periodEndDate: params.date },
        { period: { $regex: params.date, $options: 'i' } },
      ];
    }

    if (params.search) {
      const s = params.search.trim();
      query.$or = [
        { employeeName: { $regex: s, $options: 'i' } },
        { employeeCode: { $regex: s, $options: 'i' } },
        { projectName: { $regex: s, $options: 'i' } },
        { siteName: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { siteLocation: { $regex: s, $options: 'i' } },
        { officeLocation: { $regex: s, $options: 'i' } },
        { companyName: { $regex: s, $options: 'i' } },
        { assignedField: { $regex: s, $options: 'i' } },
        { jobDescription: { $regex: s, $options: 'i' } },
        { supervisorName: { $regex: s, $options: 'i' } },
        { period: { $regex: s, $options: 'i' } },
        { workDetails: { $regex: s, $options: 'i' } },
      ];
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 100));
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
