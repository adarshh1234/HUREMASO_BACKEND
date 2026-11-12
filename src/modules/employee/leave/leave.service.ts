import mongoose from 'mongoose';
import { leaveRepository, LeaveRepository } from './leave.repository';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import {
  ILeaveRequest,
  ILeaveBalance,
  ILeaveEntitlement,
  ILeavePeriodConfig,
  ILeaveTypeConfig,
  IWorkWeekConfig,
  IHoliday,
} from './leave.types';

export class LeaveService {
  constructor(private repo: LeaveRepository = leaveRepository) {}

  // Helper to calculate working days between two dates
  private calculateDays(fromDate: string, toDate: string): number {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw AppError.badRequest('Invalid date format');
    }
    if (start > end) {
      throw AppError.badRequest('Start date cannot be after end date');
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // --- Requests ---
  async createRequest(data: {
    employeeId?: string;
    employeeName: string;
    department?: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    comments?: string;
  }): Promise<ILeaveRequest> {
    const days = this.calculateDays(data.fromDate, data.toDate);

    // Verify employee
    let employee = null;
    if (data.employeeId) {
      const isOid = mongoose.Types.ObjectId.isValid(data.employeeId);
      employee = isOid
        ? await EmployeeModel.findOne({ $or: [{ employeeId: data.employeeId }, { _id: data.employeeId }] })
        : await EmployeeModel.findOne({ employeeId: data.employeeId });
    }
    if (!employee) {
      employee = await EmployeeModel.findOne({ name: data.employeeName });
    }

    // Check overlap
    const overlapping = await this.repo.findOverlappingRequests(
      data.employeeName,
      data.fromDate,
      data.toDate
    );
    if (overlapping.length > 0) {
      throw AppError.badRequest('Leave request overlaps with an existing leave application');
    }

    // Check balance
    const balances = await this.getBalances(data.employeeName);
    const targetBalance = balances.find((b) => b.leaveType.toLowerCase() === data.leaveType.toLowerCase());
    if (targetBalance && targetBalance.balance < days) {
      throw AppError.badRequest(`Insufficient leave balance. Available: ${targetBalance.balance}, Requested: ${days}`);
    }

    return await this.repo.createRequest({
      employeeId: employee?.employeeId || data.employeeId || '',
      employeeRef: employee?._id,
      employeeName: data.employeeName,
      department: data.department || employee?.department || '',
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      numberOfDays: days,
      status: 'Pending',
      comments: data.comments || '',
      dateRequested: new Date().toISOString().split('T')[0],
    });
  }

  async getRequests(filter: any = {}): Promise<ILeaveRequest[]> {
    const query: any = {};
    if (filter.employeeName) {
      query.employeeName = { $regex: filter.employeeName, $options: 'i' };
    }
    if (filter.leaveType && filter.leaveType !== 'All') {
      query.leaveType = filter.leaveType;
    }
    if (filter.status && filter.status !== 'All') {
      query.status = filter.status;
    }
    if (filter.fromDate) {
      query.fromDate = { $gte: filter.fromDate };
    }
    if (filter.toDate) {
      query.toDate = { $lte: filter.toDate };
    }
    return await this.repo.findRequests(query);
  }

  async updateRequestStatus(id: string, status: 'Approved' | 'Rejected' | 'Cancelled', comments?: string): Promise<ILeaveRequest> {
    const request = await this.repo.findRequestById(id);
    if (!request) {
      throw AppError.notFound('Leave request not found');
    }

    if (request.status === 'Approved' && status === 'Approved') {
      throw AppError.badRequest('Leave request is already approved');
    }
    if (request.status === 'Rejected' && status === 'Rejected') {
      throw AppError.badRequest('Leave request is already rejected');
    }

    const updateData: Partial<ILeaveRequest> = { status };
    if (comments) updateData.comments = comments;

    const updated = await this.repo.updateRequest(id, updateData);
    return updated!;
  }

  async assignLeave(data: {
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    comment?: string;
  }): Promise<ILeaveRequest> {
    const days = this.calculateDays(data.fromDate, data.toDate);
    const employee = await EmployeeModel.findOne({ name: data.employeeName });

    // Check overlap
    const overlapping = await this.repo.findOverlappingRequests(
      data.employeeName,
      data.fromDate,
      data.toDate
    );
    if (overlapping.length > 0) {
      throw AppError.badRequest('Assigned leave overlaps with an existing leave');
    }

    return await this.repo.createRequest({
      employeeId: employee?.employeeId || '',
      employeeRef: employee?._id,
      employeeName: data.employeeName,
      department: employee?.department || '',
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      numberOfDays: days,
      status: 'Approved',
      comments: data.comment || '',
      dateRequested: new Date().toISOString().split('T')[0],
    });
  }

  // --- Balances Calculation ---
  async getBalances(employeeName?: string): Promise<ILeaveBalance[]> {
    const leaveTypes = await this.repo.getLeaveTypes();
    const query: any = {};
    if (employeeName) query.employeeName = employeeName;

    const entitlements = await this.repo.findEntitlements(query);
    const requests = await this.repo.findRequests(query);

    return leaveTypes.map((lt) => {
      const typeEntitlements = entitlements.filter(
        (e) => e.leaveType.toLowerCase() === lt.name.toLowerCase()
      );
      const entitled = typeEntitlements.length > 0
        ? typeEntitlements.reduce((acc, curr) => acc + curr.days, 0)
        : (lt.daysPerYear || 20);

      const typeRequests = requests.filter(
        (r) => r.leaveType.toLowerCase() === lt.name.toLowerCase()
      );

      const pending = typeRequests
        .filter((r) => r.status === 'Pending')
        .reduce((acc, curr) => acc + curr.numberOfDays, 0);

      const scheduled = typeRequests
        .filter((r) => r.status === 'Approved' && new Date(r.fromDate) > new Date())
        .reduce((acc, curr) => acc + curr.numberOfDays, 0);

      const taken = typeRequests
        .filter((r) => r.status === 'Approved' && new Date(r.fromDate) <= new Date())
        .reduce((acc, curr) => acc + curr.numberOfDays, 0);

      const totalDeducted = typeRequests
        .filter((r) => r.status === 'Approved')
        .reduce((acc, curr) => acc + curr.numberOfDays, 0);

      const balance = Math.max(0, entitled - totalDeducted);

      return {
        leaveType: lt.name,
        entitled,
        pending,
        scheduled,
        taken,
        balance,
      };
    });
  }

  // --- Entitlements ---
  async addEntitlement(data: {
    targetType: 'individual' | 'multiple';
    employeeName?: string;
    leaveType: string;
    leavePeriod: string;
    entitlement: number;
  }): Promise<ILeaveEntitlement> {
    const [validFrom, validTo] = data.leavePeriod.includes(' - ')
      ? data.leavePeriod.split(' - ')
      : [data.leavePeriod, data.leavePeriod];

    let employee = null;
    if (data.employeeName) {
      employee = await EmployeeModel.findOne({ name: data.employeeName });
    }

    return await this.repo.createEntitlement({
      employeeId: employee?.employeeId || '',
      employeeRef: employee?._id,
      employeeName: data.employeeName || '',
      leaveType: data.leaveType,
      entitlementType: data.targetType === 'individual' ? 'Added' : 'Bulk',
      validFrom,
      validTo,
      days: data.entitlement,
    });
  }

  async getEntitlements(filter: any = {}): Promise<ILeaveEntitlement[]> {
    const query: any = {};
    if (filter.employeeName) query.employeeName = { $regex: filter.employeeName, $options: 'i' };
    if (filter.leaveType) query.leaveType = filter.leaveType;
    return await this.repo.findEntitlements(query);
  }

  // --- Reports ---
  async getLeaveUsageReport(leaveType?: string): Promise<any[]> {
    const balances = await this.getBalances();
    const filtered = leaveType
      ? balances.filter((b) => b.leaveType.toLowerCase() === leaveType.toLowerCase())
      : balances;

    return filtered.map((b, idx) => ({
      id: `RPT-${idx + 1}`,
      leaveType: b.leaveType,
      leaveEntitlementDays: b.entitled,
      leavePendingApprovals: b.pending,
      leaveScheduledDays: b.scheduled,
      leaveTakenDays: b.taken,
      leaveBalanceDays: b.balance,
    }));
  }

  // --- Configurations ---
  async getLeavePeriod(): Promise<ILeavePeriodConfig> {
    return await this.repo.getLeavePeriod();
  }

  async saveLeavePeriod(data: Partial<ILeavePeriodConfig>): Promise<ILeavePeriodConfig> {
    return await this.repo.saveLeavePeriod(data);
  }

  async getLeaveTypes(): Promise<ILeaveTypeConfig[]> {
    return await this.repo.getLeaveTypes();
  }

  async createLeaveType(name: string, daysPerYear?: number): Promise<ILeaveTypeConfig> {
    return await this.repo.createLeaveType({ name, daysPerYear });
  }

  async updateLeaveType(id: string, name: string): Promise<ILeaveTypeConfig> {
    const updated = await this.repo.updateLeaveType(id, { name });
    if (!updated) throw AppError.notFound('Leave type not found');
    return updated;
  }

  async deleteLeaveType(id: string): Promise<void> {
    const deleted = await this.repo.deleteLeaveType(id);
    if (!deleted) throw AppError.notFound('Leave type not found');
  }

  async getWorkWeek(): Promise<IWorkWeekConfig> {
    return await this.repo.getWorkWeek();
  }

  async saveWorkWeek(data: Partial<IWorkWeekConfig>): Promise<IWorkWeekConfig> {
    return await this.repo.saveWorkWeek(data);
  }

  // --- Holidays ---
  async getHolidays(fromDate?: string, toDate?: string): Promise<IHoliday[]> {
    const query: any = {};
    if (fromDate) query.date = { $gte: fromDate };
    if (toDate) query.date = { ...query.date, $lte: toDate };
    return await this.repo.getHolidays(query);
  }

  async createHoliday(data: Partial<IHoliday>): Promise<IHoliday> {
    return await this.repo.createHoliday(data);
  }

  async updateHoliday(id: string, data: Partial<IHoliday>): Promise<IHoliday> {
    const updated = await this.repo.updateHoliday(id, data);
    if (!updated) throw AppError.notFound('Holiday not found');
    return updated;
  }

  async deleteHoliday(id: string): Promise<void> {
    const deleted = await this.repo.deleteHoliday(id);
    if (!deleted) throw AppError.notFound('Holiday not found');
  }
}

export const leaveService = new LeaveService();
