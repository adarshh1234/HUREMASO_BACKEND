import { PayGradeModel } from './payGrade.model';
import { IPayGradeDocument, CreatePayGradeDTO, UpdatePayGradeDTO } from '../payroll.types';
import { escapeRegex } from '../../../common/utils/regex';

export class PayGradeRepository {
  async create(data: CreatePayGradeDTO): Promise<IPayGradeDocument> {
    const item = new PayGradeModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IPayGradeDocument | null> {
    return PayGradeModel.findById(id);
  }

  async findByCode(gradeCode: string): Promise<IPayGradeDocument | null> {
    return PayGradeModel.findOne({ gradeCode: gradeCode.toUpperCase() });
  }

  async update(id: string, data: UpdatePayGradeDTO): Promise<IPayGradeDocument | null> {
    return PayGradeModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IPayGradeDocument | null> {
    return PayGradeModel.findByIdAndDelete(id);
  }

  async findAll(params: { search?: string; status?: string } = {}): Promise<{ items: IPayGradeDocument[]; total: number }> {
    await this.seedIfEmpty();
    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { gradeCode: regex },
        { gradeName: regex },
        { description: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    const [items, total] = await Promise.all([
      PayGradeModel.find(query).sort({ minSalary: 1 }),
      PayGradeModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await PayGradeModel.countDocuments();
    if (count > 0) return;

    await PayGradeModel.insertMany([
      {
        gradeCode: 'GR-A',
        gradeName: 'Grade A - Executive',
        minSalary: 120000,
        maxSalary: 180000,
        currency: 'USD',
        description: 'C-Suite, VP, and Director-level roles across all divisions.',
        allowances: [
          { name: 'Executive Travel & Vehicle', amount: 1500, type: 'fixed' },
          { name: 'Health & Wellness Cover', amount: 800, type: 'fixed' },
        ],
        assignedEmployees: [
          { employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', department: 'Executive', currentSalary: 155000 },
          { employeeId: 'EMP-1004', employeeName: 'David Vance', department: 'Engineering', currentSalary: 140000 },
        ],
        status: 'Active',
      },
      {
        gradeCode: 'GR-B',
        gradeName: 'Grade B - Senior Lead',
        minSalary: 85000,
        maxSalary: 115000,
        currency: 'USD',
        description: 'Staff Engineers, Principal Designers, and Engineering Managers.',
        allowances: [
          { name: 'Home Office & Technology', amount: 500, type: 'fixed' },
          { name: 'Annual Learning Grant', amount: 400, type: 'fixed' },
        ],
        assignedEmployees: [
          { employeeId: 'EMP-1002', employeeName: 'Marcus Brody', department: 'Product & Design', currentSalary: 96000 },
          { employeeId: 'EMP-1005', employeeName: 'Elena Rostova', department: 'Marketing', currentSalary: 89000 },
        ],
        status: 'Active',
      },
      {
        gradeCode: 'GR-C',
        gradeName: 'Grade C - Specialist',
        minSalary: 55000,
        maxSalary: 80000,
        currency: 'USD',
        description: 'Software Engineers, Product Analysts, and Operations Specialists.',
        allowances: [
          { name: 'Commuter Allowance', amount: 250, type: 'fixed' },
        ],
        assignedEmployees: [
          { employeeId: 'EMP-1003', employeeName: 'Jason Wu', department: 'Operations', currentSalary: 64000 },
        ],
        status: 'Active',
      },
    ]);
  }
}

export const payGradeRepository = new PayGradeRepository();
