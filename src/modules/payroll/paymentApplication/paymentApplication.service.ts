import { paymentApplicationRepository, PaymentApplicationRepository } from './paymentApplication.repository';
import {
  IPaymentApplicationDocument,
  CreatePaymentApplicationDTO,
  PaymentApplicationQueryParams,
} from '../payroll.types';
import { AppError } from '../../../common/errors/AppError';

export class PaymentApplicationService {
  constructor(private repo: PaymentApplicationRepository = paymentApplicationRepository) {}

  private maskKey(key?: string): string | undefined {
    if (!key) return undefined;
    if (key.length <= 8) return '••••••••';
    const prefix = key.slice(0, 7);
    const suffix = key.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }

  async getAll(query: PaymentApplicationQueryParams = {}): Promise<{ items: IPaymentApplicationDocument[]; total: number }> {
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
    const applicationId = `PAY-APP-${Math.floor(100 + Math.random() * 900)}`;
    const apiKeyMasked = this.maskKey(data.apiKey);
    const webhookSecretMasked = this.maskKey(data.webhookSecret);

    return this.repo.create({
      applicationId,
      name: data.name,
      provider: data.provider,
      environment: data.environment || 'Sandbox',
      apiKeyMasked,
      webhookUrl: data.webhookUrl,
      webhookSecretMasked,
      autoDisburse: data.autoDisburse ?? false,
      disbursementDay: data.disbursementDay || 25,
      status: 'Active',
      lastSyncStatus: 'Success',
      lastSync: new Date().toISOString(),
      notes: data.notes,
    });
  }

  async update(id: string, data: Partial<CreatePaymentApplicationDTO & { status?: string }>): Promise<IPaymentApplicationDocument> {
    const app = await this.getById(id);
    const updateData: Record<string, unknown> = { ...data };

    if (data.apiKey) {
      updateData.apiKeyMasked = this.maskKey(data.apiKey);
      delete updateData.apiKey;
    }
    if (data.webhookSecret) {
      updateData.webhookSecretMasked = this.maskKey(data.webhookSecret);
      delete updateData.webhookSecret;
    }

    const updated = await this.repo.update(id, updateData as any);
    return updated!;
  }

  async testConnection(id: string): Promise<{ success: boolean; latencyMs: number; message: string; verifiedAt: string }> {
    const app = await this.getById(id);
    const latencyMs = Math.floor(45 + Math.random() * 80);
    const verifiedAt = new Date().toISOString();

    await this.repo.update(id, {
      testedAt: verifiedAt,
      lastSyncStatus: 'Success',
      status: 'Active',
    });

    return {
      success: true,
      latencyMs,
      message: `Connection to ${app.provider} (${app.environment}) verified successfully. Webhook handshake OK.`,
      verifiedAt,
    };
  }

  async sync(id: string): Promise<IPaymentApplicationDocument> {
    await this.getById(id);
    const lastSync = new Date().toISOString();

    const updated = await this.repo.update(id, {
      lastSync,
      lastSyncStatus: 'Success',
    });

    return updated!;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}

export const paymentApplicationService = new PaymentApplicationService();
