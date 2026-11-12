import { AttendanceModel, AttendanceConfigModel } from './attendance.model';
import {
  IAttendanceDocument,
  AttendanceQueryParams,
  IAttendanceConfig,
} from './attendance.types';

export class AttendanceRepository {
  async findByEmployeeAndDate(employeeId: string, date: string): Promise<IAttendanceDocument | null> {
    return AttendanceModel.findOne({ employeeId, date }).populate('employeeId');
  }

  async findById(id: string): Promise<IAttendanceDocument | null> {
    return AttendanceModel.findById(id).populate('employeeId');
  }

  async save(attendance: IAttendanceDocument): Promise<IAttendanceDocument> {
    return (await attendance.save()).populate('employeeId');
  }

  async findAll(params: AttendanceQueryParams): Promise<{ items: IAttendanceDocument[]; total: number }> {
    const query: any = {};

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    if (params.date) {
      query.date = params.date;
    }

    if (params.fromDate || params.toDate) {
      query.date = {};
      if (params.fromDate) query.date.$gte = params.fromDate;
      if (params.toDate) query.date.$lte = params.toDate;
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.employeeName) {
      query.employeeName = { $regex: params.employeeName, $options: 'i' };
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'date';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      AttendanceModel.find(query)
        .populate('employeeId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      AttendanceModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getConfig(): Promise<IAttendanceConfig> {
    const config = await AttendanceConfigModel.findOne({ key: 'default' });
    if (!config) {
      return {
        recordWorkingTime: true,
        canEditRecords: true,
        supervisorCanEdit: true,
        standardHours: 8,
        breakDuration: 60,
        gracePeriodMinutes: 15,
      };
    }
    return {
      recordWorkingTime: config.recordWorkingTime,
      canEditRecords: config.canEditRecords,
      supervisorCanEdit: config.supervisorCanEdit,
      standardHours: config.standardHours,
      breakDuration: config.breakDuration,
      gracePeriodMinutes: config.gracePeriodMinutes,
    };
  }

  async saveConfig(data: Partial<IAttendanceConfig>): Promise<IAttendanceConfig> {
    const updated = await AttendanceConfigModel.findOneAndUpdate(
      { key: 'default' },
      { $set: data },
      { upsert: true, new: true }
    );
    return {
      recordWorkingTime: updated.recordWorkingTime,
      canEditRecords: updated.canEditRecords,
      supervisorCanEdit: updated.supervisorCanEdit,
      standardHours: updated.standardHours,
      breakDuration: updated.breakDuration,
      gracePeriodMinutes: updated.gracePeriodMinutes,
    };
  }
}

export const attendanceRepository = new AttendanceRepository();
