import { employeeRequestRepository, EmployeeRequestRepository } from './request.repository';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import { IEmployeeRequest } from './request.types';

export class EmployeeRequestService {
  constructor(private repo: EmployeeRequestRepository = employeeRequestRepository) {}

  async createRequest(data: {
    empId: string;
    name: string;
    type: string;
    department: string;
    date: string;
    amount: string;
    comments?: string;
  }): Promise<IEmployeeRequest> {
    const employee = await EmployeeModel.findOne({
      $or: [{ employeeId: data.empId }, { name: data.name }],
    });

    return await this.repo.create({
      empId: employee?.employeeId || data.empId,
      employeeRef: employee?._id,
      name: data.name,
      type: data.type,
      department: data.department || employee?.department || '',
      date: data.date,
      amount: data.amount,
      status: 'Pending',
      comments: data.comments || '',
    });
  }

  async getRequests(filter: {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<IEmployeeRequest[]> {
    const query: any = {};
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { empId: { $regex: filter.search, $options: 'i' } },
        { type: { $regex: filter.search, $options: 'i' } },
        { department: { $regex: filter.search, $options: 'i' } },
      ];
    }
    if (filter.status && filter.status !== 'All') {
      query.status = filter.status;
    }
    if (filter.fromDate) {
      query.date = { $gte: filter.fromDate };
    }
    if (filter.toDate) {
      query.date = { ...query.date, $lte: filter.toDate };
    }
    const results = await this.repo.findAll(query);
    if (results.length === 0 && !filter.search && !filter.status) {
      // Seed initial requests if empty so the UI has immediate data
      const sample = [
        { empId: 'EMP2024001', name: 'Sarah Johnson', type: 'Training Course Payment', department: 'Engineering', date: '2024-02-14', amount: '1,800', status: 'Pending' as const },
        { empId: 'EMP2024002', name: 'Alex Smith', type: 'Travel Allowance', department: 'Software', date: '2024-02-15', amount: '650', status: 'Approved' as const },
        { empId: 'EMP2024003', name: 'Michael Chen', type: 'Certification Reimbursement', department: 'Engineering', date: '2024-02-16', amount: '2,200', status: 'Pending' as const },
      ];
      return await Promise.all(sample.map(s => this.repo.create(s)));
    }
    return results;
  }

  async getRequestById(id: string): Promise<IEmployeeRequest> {
    const req = await this.repo.findById(id);
    if (!req) throw AppError.notFound('Employee request not found');
    return req;
  }

  async updateStatus(
    id: string,
    status: 'Approved' | 'Rejected',
    approver: string = 'HR Admin',
    rejectionReason?: string
  ): Promise<IEmployeeRequest> {
    const req = await this.repo.findById(id);
    if (!req) throw AppError.notFound('Employee request not found');

    const updateData: Partial<IEmployeeRequest> = {
      status,
      approver,
      approvalDate: new Date().toISOString().split('T')[0],
    };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updated = await this.repo.update(id, updateData);
    return updated!;
  }
}

export const employeeRequestService = new EmployeeRequestService();
