import { timePayrollRepository, TimePayrollRepository } from './timePayroll.repository';
import { CreateTimePayrollDTO, ITimePayroll, ITimePayrollDocument, ITimePayrollSummary, TimePayrollQueryParams } from './timePayroll.types';
import { EmployeeModel } from '../../employee/employee.model';
import { AttendanceModel } from '../attendance/attendance.model';
import { OvertimeModel } from '../overtime/overtime.model';

export class TimePayrollService {
  private repository: TimePayrollRepository;

  constructor() {
    this.repository = timePayrollRepository;
  }

  async getAllTimePayrolls(params: TimePayrollQueryParams): Promise<{ items: ITimePayroll[]; total: number }> {
    await this.repository.seedDefaultRecordsIfEmpty();
    const res = await this.repository.findAll(params);
    return {
      items: res.items.map((doc) => doc.toObject() as unknown as ITimePayroll),
      total: res.total,
    };
  }

  async getTimePayrollById(id: string): Promise<ITimePayroll | null> {
    const doc = await this.repository.findById(id);
    return doc ? (doc.toObject() as unknown as ITimePayroll) : null;
  }

  async getSummary(): Promise<ITimePayrollSummary> {
    await this.repository.seedDefaultRecordsIfEmpty();
    return this.repository.getSummary();
  }

  async createTimePayroll(dto: CreateTimePayrollDTO): Promise<ITimePayroll> {
    let recordId = dto.recordId;
    if (!recordId) {
      recordId = `TP-${Math.floor(100 + Math.random() * 900)}`;
    }

    let employeeName = dto.name;
    let dept = dto.dept || 'Operations';
    if (dto.employeeId) {
      const emp: any = await EmployeeModel.findById(dto.employeeId);
      if (emp) {
        employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || employeeName;
        dept = emp.department || dept;
      }
    }

    const shiftAllowanceAmount = dto.shiftAllowanceAmount ?? 0;
    const overtimeAmount = dto.overtimeAmount ?? 0;
    const lopDeductions = dto.lopDeductions ?? 0;
    
    // Net adjustment calculation: (daysPresent * 150) + shiftAllowance + overtime - lop
    const baseDaily = 150;
    const netAmount = (dto.daysPresent * baseDaily) + shiftAllowanceAmount + overtimeAmount - lopDeductions;
    const netAdjustment = dto.netAdjustment || `+$${netAmount.toLocaleString('en-US')}`;

    const data: Partial<ITimePayrollDocument> = {
      recordId,
      employeeId: dto.employeeId as any,
      name: employeeName,
      dept,
      month: dto.month || new Date().toISOString().slice(0, 7),
      year: dto.year || new Date().getFullYear(),
      daysPresent: dto.daysPresent,
      paidLeave: dto.paidLeave || 0,
      shiftAllowance: dto.shiftAllowance || `$${shiftAllowanceAmount}`,
      shiftAllowanceAmount,
      overtimeHours: dto.overtimeHours || 0,
      overtimeAmount,
      lopDeductions,
      netAdjustment,
      netAdjustmentAmount: netAmount,
      status: dto.status || 'Processed',
      notes: dto.notes,
    };

    const doc = await this.repository.create(data);
    return doc.toObject() as unknown as ITimePayroll;
  }

  async updateTimePayroll(id: string, dto: Partial<CreateTimePayrollDTO>): Promise<ITimePayroll | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const daysPresent = dto.daysPresent ?? existing.daysPresent;
    const shiftAllowanceAmount = dto.shiftAllowanceAmount ?? existing.shiftAllowanceAmount ?? 0;
    const overtimeAmount = dto.overtimeAmount ?? existing.overtimeAmount ?? 0;
    const lopDeductions = dto.lopDeductions ?? existing.lopDeductions ?? 0;

    const baseDaily = 150;
    const netAmount = (daysPresent * baseDaily) + shiftAllowanceAmount + overtimeAmount - lopDeductions;

    const updateData: Partial<ITimePayrollDocument> = {
      ...dto,
      employeeId: (dto.employeeId || existing.employeeId) as any,
      daysPresent,
      shiftAllowanceAmount,
      overtimeAmount,
      lopDeductions,
      netAdjustment: dto.netAdjustment || `+$${netAmount.toLocaleString('en-US')}`,
      netAdjustmentAmount: netAmount,
    };

    const doc = await this.repository.update(id, updateData);
    return doc ? (doc.toObject() as unknown as ITimePayroll) : null;
  }

  async deleteTimePayroll(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return !!deleted;
  }

  async calculateTimePayrollForPeriod(month?: string): Promise<{ processed: number; records: ITimePayroll[] }> {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const employees: any[] = await EmployeeModel.find();

    const createdRecords: ITimePayroll[] = [];

    for (const emp of employees) {
      const empId = emp._id.toString();
      const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name;
      const dept = emp.department || 'Operations';

      // Count attendance in this month
      const attendanceCount = await AttendanceModel.countDocuments({
        employeeId: empId,
        date: { $regex: `^${targetMonth}` },
        status: 'Present',
      });

      // Find overtime in this month
      const overtimes = await OvertimeModel.find({
        employeeId: empId,
        date: { $regex: `^${targetMonth}` },
        status: 'Approved',
      });

      let totalOtHours = 0;
      let totalOtPayout = 0;
      overtimes.forEach((ot) => {
        totalOtHours += ot.hours || 0;
        totalOtPayout += ot.amount || 0;
      });

      const daysPresent = attendanceCount > 0 ? attendanceCount : 22;
      const shiftAllowanceAmount = 200;
      const basicDaily = 150;
      const netAmount = Math.round((daysPresent * basicDaily) + shiftAllowanceAmount + totalOtPayout);

      const record = await this.createTimePayroll({
        employeeId: empId,
        name: empName,
        dept,
        month: targetMonth,
        daysPresent,
        paidLeave: 1,
        shiftAllowance: `$${shiftAllowanceAmount}`,
        shiftAllowanceAmount,
        overtimeHours: totalOtHours,
        overtimeAmount: totalOtPayout,
        netAdjustment: `+$${netAmount.toLocaleString('en-US')}`,
        netAdjustmentAmount: netAmount,
        status: 'Processed',
      });

      createdRecords.push(record);
    }

    return {
      processed: createdRecords.length,
      records: createdRecords,
    };
  }

  async exportFeed(month?: string): Promise<any[]> {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const { items } = await this.getAllTimePayrolls({ month: targetMonth, limit: 1000 });
    return items.map((r) => ({
      RecordID: r.recordId,
      EmployeeName: r.name,
      Department: r.dept,
      Month: r.month,
      DaysPresent: r.daysPresent,
      PaidLeaveDays: r.paidLeave,
      ShiftAllowance: r.shiftAllowance,
      NetAdjustment: r.netAdjustment,
      Status: r.status,
    }));
  }
}

export const timePayrollService = new TimePayrollService();
