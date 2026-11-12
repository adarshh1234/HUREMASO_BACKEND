import { OvertimeRepository, overtimeRepository } from './overtime.repository';
import {
  CreateOvertimeDTO,
  OvertimeQueryParams,
  IOvertime,
  IOvertimeMetrics,
} from './overtime.types';
import { EmployeeModel } from '../../employee/employee.model';
import { AppError } from '../../../common/errors/AppError';

export class OvertimeService {
  constructor(private repo: OvertimeRepository = overtimeRepository) {}

  private extractMultiplierRate(multiplierStr = '1.5x (Weekday OT)'): number {
    const match = multiplierStr.match(/(\d+(\.\d+)?)x/i);
    return match ? parseFloat(match[1]) : 1.5;
  }

  async createOvertime(dto: CreateOvertimeDTO): Promise<IOvertime> {
    let employeeId = dto.employeeId;
    let employeeName = dto.employeeName || 'Employee';
    let department = dto.department || 'Engineering';

    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
        employeeName = firstEmp.name || `${firstEmp.firstName || ''} ${firstEmp.lastName || ''}`.trim();
        department = firstEmp.department || 'Engineering';
      } else {
        throw new AppError('No employee found to assign overtime', 404);
      }
    } else {
      const emp = await EmployeeModel.findById(employeeId);
      if (emp) {
        employeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        department = emp.department || department;
      }
    }

    const hours = Number(dto.hours) || 1;
    const multiplier = dto.multiplier || '1.5x (Weekday OT)';
    const multiplierRate = this.extractMultiplierRate(multiplier);
    const hourlyRate = Number(dto.hourlyRate) || 30;
    const amount = Number((hours * hourlyRate * multiplierRate).toFixed(2));

    const created = await this.repo.create({
      employeeId,
      employeeName,
      department,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      hours,
      hoursText: `${hours.toFixed(1)} hrs`,
      multiplier,
      multiplierRate,
      hourlyRate,
      amount,
      amountText: `$${amount.toFixed(2)}`,
      reason: dto.reason || 'Scheduled project overtime',
      status: dto.status || 'Approved',
    });

    return created.toJSON() as unknown as IOvertime;
  }

  async getOvertimeById(id: string): Promise<IOvertime> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Overtime request not found', 404);
    }
    return item.toJSON() as unknown as IOvertime;
  }

  async updateStatus(
    id: string,
    status: IOvertime['status'],
    approverName = 'Supervisor',
    comments?: string
  ): Promise<IOvertime> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Overtime request not found', 404);
    }

    const updated = await this.repo.update(id, {
      status,
      approverName,
      approvedAt: status === 'Approved' ? new Date() : undefined,
      comments,
    });

    return updated!.toJSON() as unknown as IOvertime;
  }

  async deleteOvertime(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Overtime request not found', 404);
    }
  }

  async getMetrics(): Promise<IOvertimeMetrics> {
    return this.repo.getMetrics();
  }

  async calculate(hours = 0, multiplier = 1.5, baseRate = 20): Promise<{ calculatedPayout: number; hours: number; multiplier: number; baseRate: number }> {
    const calculatedPayout = Number((hours * multiplier * baseRate).toFixed(2));
    return {
      hours,
      multiplier,
      baseRate,
      calculatedPayout,
    };
  }

  async getAllOvertime(params: OvertimeQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IOvertime),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }
}

export const overtimeService = new OvertimeService();

