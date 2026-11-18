import { financeRequestRepository, FinanceRequestRepository } from './financeRequest.repository';
import {
  IFinanceRequestDocument,
  CreateFinanceRequestDTO,
  FinanceRequestQueryParams,
  FinanceRequestStatus,
} from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class FinanceRequestService {
  constructor(private repo: FinanceRequestRepository = financeRequestRepository) {}

  async getAll(query: FinanceRequestQueryParams = {}): Promise<{ items: IFinanceRequestDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getById(id: string): Promise<IFinanceRequestDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Finance request with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: CreateFinanceRequestDTO): Promise<IFinanceRequestDocument> {
    const requestId = `FIN-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const initialHistory = [
      {
        status: 'Pending' as FinanceRequestStatus,
        changedBy: data.employeeName,
        timestamp: new Date().toISOString(),
        remarks: 'Finance request submitted',
      },
    ];

    return this.repo.create({
      ...data,
      requestId,
      dateRequested: today,
      status: 'Pending',
      history: initialHistory,
    });
  }

  async updateStatus(
    id: string,
    status: FinanceRequestStatus,
    remarks?: string,
    approvedBy: string = 'Finance Manager'
  ): Promise<IFinanceRequestDocument> {
    const record = await this.getById(id);

    // Prevent duplicate approval
    if (record.status === 'Approved' && status === 'Approved') {
      return record;
    }

    const historyItem = {
      status,
      changedBy: approvedBy,
      timestamp: new Date().toISOString(),
      remarks: remarks || `Request status updated to ${status}`,
    };

    const updateData: Partial<IFinanceRequestDocument> = {
      status,
      approvalRemarks: remarks,
      approvedBy,
      approvedAt: new Date().toISOString(),
      history: [...(record.history || []), historyItem],
    };

    const updated = await this.repo.update(id, updateData);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}

export const financeRequestService = new FinanceRequestService();
