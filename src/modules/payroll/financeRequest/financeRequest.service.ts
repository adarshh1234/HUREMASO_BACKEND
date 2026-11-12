import { financeRequestRepository, FinanceRequestRepository } from './financeRequest.repository';
import { IFinanceRequestDocument, CreateFinanceRequestDTO, FinanceRequestQueryParams, FinanceRequestStatus } from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class FinanceRequestService {
  constructor(private repo: FinanceRequestRepository = financeRequestRepository) {}

  async getAll(query: FinanceRequestQueryParams): Promise<{ items: IFinanceRequestDocument[]; total: number }> {
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
    const requestId = `FIN-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    return this.repo.create({
      ...data,
      requestId,
      dateRequested: today,
      status: 'Pending',
    });
  }

  async updateStatus(id: string, status: FinanceRequestStatus, notes?: string): Promise<IFinanceRequestDocument> {
    await this.getById(id);
    const updateData: Partial<IFinanceRequestDocument> = { status };
    if (notes) updateData.notes = notes;
    const updated = await this.repo.update(id, updateData);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}

export const financeRequestService = new FinanceRequestService();
