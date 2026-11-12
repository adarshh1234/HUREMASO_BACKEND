import { ReplacementRepository, replacementRepository } from './replacement.repository';
import {
  CreateReplacementDTO,
  ReplacementQueryParams,
  IReplacement,
  IReplacementMetrics,
} from './replacement.types';
import { EmployeeModel } from '../../employee/employee.model';
import { AppError } from '../../../common/errors/AppError';

export class ReplacementService {
  constructor(private repo: ReplacementRepository = replacementRepository) {}

  async createReplacement(dto: CreateReplacementDTO): Promise<IReplacement> {
    let originalEmployeeId = dto.originalEmployeeId;
    let originalEmployeeName = dto.originalEmployeeName || 'Original Employee';
    let department = dto.department || 'Field Operations';

    if (!originalEmployeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        originalEmployeeId = firstEmp._id.toString();
        originalEmployeeName = firstEmp.name || `${firstEmp.firstName || ''} ${firstEmp.lastName || ''}`.trim();
        department = firstEmp.department || 'Field Operations';
      } else {
        throw new AppError('No employee found to assign as original employee', 404);
      }
    } else {
      const emp = await EmployeeModel.findById(originalEmployeeId);
      if (emp) {
        originalEmployeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        department = emp.department || department;
      }
    }

    let substituteEmployeeId = dto.substituteEmployeeId;
    if (!substituteEmployeeId) {
      const subEmp = await EmployeeModel.findOne({
        _id: { $ne: originalEmployeeId },
        isTerminated: false,
      });
      if (subEmp) {
        substituteEmployeeId = subEmp._id.toString();
      }
    }

    const created = await this.repo.create({
      originalEmployeeId,
      originalEmployeeName,
      substituteEmployeeId,
      substituteEmployeeName: dto.substituteEmployeeName || (dto as any).employeeName || 'Substitute Employee',
      department,
      shiftDate: dto.shiftDate || (dto as any).workDate || (dto as any).claimDate || new Date().toISOString().split('T')[0],
      shiftTime: dto.shiftTime,
      shift: dto.shift || 'Morning Shift (08:00 - 16:00)',
      reason: dto.reason,
      status: dto.status || 'Approved',
      daysEarned: (dto as any).daysEarned || 1,
      hoursWorked: (dto as any).hoursWorked || 8,
      expiryDate: (dto as any).expiryDate,
    } as any);

    return created.toJSON() as unknown as IReplacement;
  }

  async getReplacementById(id: string): Promise<IReplacement> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Replacement request not found', 404);
    }
    return item.toJSON() as unknown as IReplacement;
  }

  async updateStatus(
    id: string,
    status: IReplacement['status'],
    approverName = 'Manager',
    comments?: string
  ): Promise<IReplacement> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Replacement request not found', 404);
    }

    const updated = await this.repo.update(id, {
      status,
      approverName,
      approvedAt: status === 'Approved' ? new Date() : undefined,
      comments,
    });

    return updated!.toJSON() as unknown as IReplacement;
  }

  async deleteReplacement(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Replacement request not found', 404);
    }
  }

  async getMetrics(): Promise<IReplacementMetrics> {
    return this.repo.getMetrics();
  }

  async getAllReplacements(params: ReplacementQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IReplacement),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }
}

export const replacementService = new ReplacementService();
