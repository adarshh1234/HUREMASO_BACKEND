import { TimesheetRepository, timesheetRepository } from './timesheet.repository';
import {
  CreateTimesheetDTO,
  TimesheetQueryParams,
  ITimesheet,
  ITimesheetRow,
} from './timesheet.types';
import { TimesheetModel } from './timesheet.model';
import { EmployeeModel } from '../../employee/employee.model';
import { AppError } from '../../../common/errors/AppError';

export class TimesheetService {
  constructor(private repo: TimesheetRepository = timesheetRepository) {}

  private calculateRows(rows: ITimesheetRow[] = []): { computedRows: ITimesheetRow[]; totalPeriodHours: number } {
    let totalPeriodHours = 0;
    const computedRows = rows.map((r) => {
      const mon = Number(r.monHours) || 0;
      const tue = Number(r.tueHours) || 0;
      const wed = Number(r.wedHours) || 0;
      const thu = Number(r.thuHours) || 0;
      const fri = Number(r.friHours) || 0;
      const sat = Number(r.satHours) || 0;
      const sun = Number(r.sunHours) || 0;
      const total = mon + tue + wed + thu + fri + sat + sun;
      totalPeriodHours += total;
      return {
        ...r,
        monHours: mon,
        tueHours: tue,
        wedHours: wed,
        thuHours: thu,
        friHours: fri,
        satHours: sat,
        sunHours: sun,
        totalHours: total,
      };
    });

    return { computedRows, totalPeriodHours };
  }

  async saveTimesheet(dto: CreateTimesheetDTO): Promise<ITimesheet> {
    let employeeId = dto.employeeId;
    let employeeName = 'Employee';

    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
        employeeName = firstEmp.name || `${firstEmp.firstName || ''} ${firstEmp.lastName || ''}`.trim();
      } else {
        throw new AppError('No employee found', 404);
      }
    } else {
      const emp = await EmployeeModel.findById(employeeId);
      if (emp) {
        employeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      }
    }

    const periodStartDate = dto.periodStartDate || '2026-09-07';
    const periodEndDate = dto.periodEndDate || '2026-09-13';
    const period = dto.period || `${periodStartDate} to ${periodEndDate}`;

    const { computedRows, totalPeriodHours } = this.calculateRows(dto.rows);

    let timesheet = await this.repo.findByEmployeeAndPeriod(employeeId, period);

    if (!timesheet) {
      timesheet = new TimesheetModel({
        employeeId,
        employeeName,
        periodStartDate,
        periodEndDate,
        period,
        rows: computedRows,
        totalPeriodHours,
        status: dto.status || 'Draft',
        actions: [
          {
            action: dto.status === 'Submitted' ? 'Submitted' : 'Created',
            performedBy: employeeName,
            comment: dto.comment || 'Timesheet created',
            date: new Date(),
          },
        ],
      });
    } else {
      timesheet.rows = computedRows as any;
      timesheet.totalPeriodHours = totalPeriodHours;
      if (dto.status) timesheet.status = dto.status;
      timesheet.actions.push({
        action: dto.status === 'Submitted' ? 'Submitted' : 'Updated',
        performedBy: employeeName,
        comment: dto.comment || 'Timesheet updated',
        date: new Date(),
      });
    }

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async submitTimesheet(id: string, comment?: string): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    timesheet.status = 'Submitted';
    timesheet.actions.push({
      action: 'Submitted',
      performedBy: timesheet.employeeName || 'Employee',
      comment: comment || 'Timesheet submitted for manager approval',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async approveTimesheet(id: string, approverName = 'Manager', comment?: string): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    timesheet.status = 'Approved';
    timesheet.actions.push({
      action: 'Approved',
      performedBy: approverName,
      comment: comment || 'Timesheet approved',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async rejectTimesheet(id: string, approverName = 'Manager', comment?: string): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    timesheet.status = 'Rejected';
    timesheet.actions.push({
      action: 'Rejected',
      performedBy: approverName,
      comment: comment || 'Timesheet rejected',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async getMyTimesheets(employeeId?: string, period?: string): Promise<ITimesheet[]> {
    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
      }
    }
    if (!employeeId) return [];

    const query: TimesheetQueryParams = { employeeId };
    if (period) query.period = period;

    const { items } = await this.repo.findAll(query);
    return items.map((i) => i.toJSON() as unknown as ITimesheet);
  }

  async getPendingTimesheets(params: TimesheetQueryParams = {}) {
    const query: TimesheetQueryParams = { ...params, status: 'Submitted' };
    const { items, total } = await this.repo.findAll(query);
    return {
      items: items.map((i) => i.toJSON() as unknown as ITimesheet),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getAllTimesheets(params: TimesheetQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as ITimesheet),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getTimesheetById(id: string): Promise<ITimesheet | null> {
    const doc = await this.repo.findById(id);
    return doc ? (doc.toJSON() as unknown as ITimesheet) : null;
  }

  async updateStatus(id: string, status: string, approverName = 'Manager', comment?: string): Promise<ITimesheet | null> {
    if (status === 'Approved') {
      return this.approveTimesheet(id, approverName, comment);
    } else if (status === 'Rejected') {
      return this.rejectTimesheet(id, approverName, comment);
    } else {
      const timesheet = await this.repo.findById(id);
      if (!timesheet) return null;
      timesheet.status = status as any;
      const saved = await this.repo.save(timesheet);
      return saved.toJSON() as unknown as ITimesheet;
    }
  }

  async deleteTimesheet(id: string): Promise<boolean> {
    const doc = await this.repo.findById(id);
    if (!doc) return false;
    await doc.deleteOne();
    return true;
  }
}

export const timesheetService = new TimesheetService();

