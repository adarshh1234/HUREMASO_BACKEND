import { paymentApplicationRepository, PaymentApplicationRepository } from './paymentApplication.repository';
import { IPaymentApplicationDocument, CreatePaymentApplicationDTO, PaymentApplicationQueryParams } from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class PaymentApplicationService {
  constructor(private repo: PaymentApplicationRepository = paymentApplicationRepository) {}

  async getAll(query: PaymentApplicationQueryParams): Promise<{ items: IPaymentApplicationDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getById(id: string): Promise<IPaymentApplicationDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Payment application with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: CreatePaymentApplicationDTO): Promise<IPaymentApplicationDocument> {
    const applicationId = `APP-${Math.floor(100 + Math.random() * 900)}`;
    const maskedKey = data.apiKey
      ? `${data.apiKey.slice(0, 7)}****${data.apiKey.slice(-4)}`
      : undefined;

    return this.repo.create({
      ...data,
      applicationId,
      apiKeyMasked: maskedKey,
      status: 'Active',
      lastSync: new Date().toISOString().split('T')[0],
    });
  }

  async update(id: string, data: Partial<IPaymentApplicationDocument>): Promise<IPaymentApplicationDocument> {
    await this.getById(id);
    const updateData = { ...data };
    const updated = await this.repo.update(id, updateData);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}

export const paymentApplicationService = new PaymentApplicationService();
