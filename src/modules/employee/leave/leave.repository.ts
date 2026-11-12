import {
  LeaveTypeModel,
  LeavePeriodConfigModel,
  WorkWeekConfigModel,
  HolidayModel,
  LeaveEntitlementModel,
  LeaveRequestModel,
} from './leave.model';
import {
  ILeaveTypeConfig,
  ILeavePeriodConfig,
  IWorkWeekConfig,
  IHoliday,
  ILeaveEntitlement,
  ILeaveRequest,
} from './leave.types';

export class LeaveRepository {
  // Requests
  async createRequest(data: Partial<ILeaveRequest>): Promise<ILeaveRequest> {
    const req = new LeaveRequestModel(data);
    return await req.save();
  }

  async findRequests(filter: any = {}): Promise<ILeaveRequest[]> {
    return await LeaveRequestModel.find(filter).sort({ createdAt: -1 });
  }

  async findRequestById(id: string): Promise<ILeaveRequest | null> {
    return await LeaveRequestModel.findById(id);
  }

  async updateRequest(id: string, data: Partial<ILeaveRequest>): Promise<ILeaveRequest | null> {
    return await LeaveRequestModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findOverlappingRequests(
    employeeName: string,
    fromDate: string,
    toDate: string,
    excludeId?: string
  ): Promise<ILeaveRequest[]> {
    const filter: any = {
      employeeName,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } },
      ],
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return await LeaveRequestModel.find(filter);
  }

  // Entitlements
  async createEntitlement(data: Partial<ILeaveEntitlement>): Promise<ILeaveEntitlement> {
    const ent = new LeaveEntitlementModel(data);
    return await ent.save();
  }

  async findEntitlements(filter: any = {}): Promise<ILeaveEntitlement[]> {
    return await LeaveEntitlementModel.find(filter).sort({ createdAt: -1 });
  }

  // Configurations
  async getLeavePeriod(): Promise<ILeavePeriodConfig> {
    let config = await LeavePeriodConfigModel.findOne();
    if (!config) {
      config = await LeavePeriodConfigModel.create({
        startMonth: 'January',
        startDate: '01',
        endDate: '31',
        currentPeriod: '2026-01-01 - 2026-12-31',
      });
    }
    return config;
  }

  async saveLeavePeriod(data: Partial<ILeavePeriodConfig>): Promise<ILeavePeriodConfig> {
    return await LeavePeriodConfigModel.findOneAndUpdate({}, data, { upsert: true, new: true });
  }

  async getLeaveTypes(): Promise<ILeaveTypeConfig[]> {
    const types = await LeaveTypeModel.find().sort({ createdAt: 1 });
    if (types.length === 0) {
      const defaultTypes = [
        { name: 'Casual Leave', daysPerYear: 12 },
        { name: 'Sick Leave', daysPerYear: 10 },
        { name: 'Earned Leave', daysPerYear: 15 },
        { name: 'Maternity Leave', daysPerYear: 90 },
      ];
      return await LeaveTypeModel.insertMany(defaultTypes);
    }
    return types;
  }

  async createLeaveType(data: Partial<ILeaveTypeConfig>): Promise<ILeaveTypeConfig> {
    const type = new LeaveTypeModel(data);
    return await type.save();
  }

  async updateLeaveType(id: string, data: Partial<ILeaveTypeConfig>): Promise<ILeaveTypeConfig | null> {
    return await LeaveTypeModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteLeaveType(id: string): Promise<boolean> {
    const res = await LeaveTypeModel.findByIdAndDelete(id);
    return !!res;
  }

  async getWorkWeek(): Promise<IWorkWeekConfig> {
    let config = await WorkWeekConfigModel.findOne();
    if (!config) {
      config = await WorkWeekConfigModel.create({
        monday: 'Full Day',
        tuesday: 'Full Day',
        wednesday: 'Full Day',
        thursday: 'Full Day',
        friday: 'Full Day',
        saturday: 'Non-working Day',
        sunday: 'Non-working Day',
      });
    }
    return config;
  }

  async saveWorkWeek(data: Partial<IWorkWeekConfig>): Promise<IWorkWeekConfig> {
    return await WorkWeekConfigModel.findOneAndUpdate({}, data, { upsert: true, new: true });
  }

  // Holidays
  async getHolidays(filter: any = {}): Promise<IHoliday[]> {
    return await HolidayModel.find(filter).sort({ date: 1 });
  }

  async createHoliday(data: Partial<IHoliday>): Promise<IHoliday> {
    const holiday = new HolidayModel(data);
    return await holiday.save();
  }

  async updateHoliday(id: string, data: Partial<IHoliday>): Promise<IHoliday | null> {
    return await HolidayModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteHoliday(id: string): Promise<boolean> {
    const res = await HolidayModel.findByIdAndDelete(id);
    return !!res;
  }
}

export const leaveRepository = new LeaveRepository();
