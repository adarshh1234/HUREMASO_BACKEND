import { FinanceRequestModel } from './financeRequest.model';
import { IFinanceRequestDocument, FinanceRequestQueryParams } from '../payroll.types';
import { escapeRegex } from '../../../common/utils/regex';

export class FinanceRequestRepository {
  async create(data: Partial<IFinanceRequestDocument>): Promise<IFinanceRequestDocument> {
    const item = new FinanceRequestModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IFinanceRequestDocument | null> {
    return FinanceRequestModel.findById(id);
  }

  async update(id: string, data: Partial<IFinanceRequestDocument>): Promise<IFinanceRequestDocument | null> {
    return FinanceRequestModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IFinanceRequestDocument | null> {
    return FinanceRequestModel.findByIdAndDelete(id);
  }

  async findAll(params: FinanceRequestQueryParams = {}): Promise<{ items: IFinanceRequestDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { employeeName: regex },
        { requestType: regex },
        { department: regex },
        { requestId: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.department && params.department !== 'All') {
      query.department = new RegExp(escapeRegex(params.department), 'i');
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      FinanceRequestModel.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      FinanceRequestModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await FinanceRequestModel.countDocuments();
    if (count > 0) return;
    const today = new Date().toISOString().split('T')[0];
    await FinanceRequestModel.insertMany([
      { requestId: 'FIN-101', employeeName: 'Sarah Johnson', employeeId: 'EMP001', requestType: 'Salary Advance', department: 'Marketing', amount: 5000, description: 'Emergency medical expense', status: 'Pending', dateRequested: today },
      { requestId: 'FIN-102', employeeName: 'Michael Chen', employeeId: 'EMP002', requestType: 'Loan Repayment', department: 'Engineering', amount: 2500, description: 'Housing loan installment', status: 'Approved', dateRequested: today },
      { requestId: 'FIN-103', employeeName: 'James Wilson', employeeId: 'EMP003', requestType: 'Expense Reimbursement', department: 'Sales', amount: 850, description: 'Client entertainment expenses', status: 'Pending', dateRequested: today },
      { requestId: 'FIN-104', employeeName: 'Lisa Anderson', employeeId: 'EMP004', requestType: 'Salary Advance', department: 'HR', amount: 3200, description: 'School fee advance', status: 'Rejected', dateRequested: today },
      { requestId: 'FIN-105', employeeName: 'David Kim', employeeId: 'EMP005', requestType: 'Travel Allowance', department: 'Operations', amount: 1200, description: 'Business travel reimbursement', status: 'Pending', dateRequested: today },
    ]);
  }
}

export const financeRequestRepository = new FinanceRequestRepository();
