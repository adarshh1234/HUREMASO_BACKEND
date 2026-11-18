import { payGradeRepository, PayGradeRepository } from './payGrade.repository';
import { IPayGradeDocument, CreatePayGradeDTO, UpdatePayGradeDTO } from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class PayGradeService {
  constructor(private repo: PayGradeRepository = payGradeRepository) {}

  async getAll(params: { search?: string; status?: string } = {}): Promise<{ items: IPayGradeDocument[]; total: number }> {
    return this.repo.findAll(params);
  }

  async getById(id: string): Promise<IPayGradeDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Pay grade with id ${id} not found`);
    }
    return item;
  }

  async create(data: CreatePayGradeDTO): Promise<IPayGradeDocument> {
    const existing = await this.repo.findByCode(data.gradeCode);
    if (existing) {
      throw AppError.conflict(`Pay grade code ${data.gradeCode} already exists`);
    }
    if (data.maxSalary < data.minSalary) {
      throw AppError.badRequest('Maximum salary cannot be less than minimum salary');
    }
    return this.repo.create(data);
  }

  async update(id: string, data: UpdatePayGradeDTO): Promise<IPayGradeDocument> {
    const grade = await this.getById(id);

    const min = data.minSalary !== undefined ? data.minSalary : grade.minSalary;
    const max = data.maxSalary !== undefined ? data.maxSalary : grade.maxSalary;

    if (max < min) {
      throw AppError.badRequest('Maximum salary cannot be less than minimum salary');
    }

    if (data.assignedEmployees && data.assignedEmployees.length > 0) {
      for (const emp of data.assignedEmployees) {
        if (emp.currentSalary < min || emp.currentSalary > max) {
          throw AppError.badRequest(
            `Assigned salary for ${emp.employeeName} ($${emp.currentSalary}) falls outside the grade range ($${min} - $${max})`
          );
        }
      }
    }

    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    const grade = await this.getById(id);
    if (grade.assignedEmployees && grade.assignedEmployees.length > 0) {
      throw AppError.badRequest(
        `Cannot delete pay grade '${grade.gradeName}' because ${grade.assignedEmployees.length} active employee(s) are assigned to it.`
      );
    }
    await this.repo.delete(id);
  }
}

export const payGradeService = new PayGradeService();
