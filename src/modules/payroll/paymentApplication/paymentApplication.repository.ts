import { PaymentApplicationModel } from './paymentApplication.model';
import { IPaymentApplicationDocument, PaymentApplicationQueryParams } from '../payroll.types';
import { escapeRegex } from '../../../common/utils/regex';

export class PaymentApplicationRepository {
  async create(data: Partial<IPaymentApplicationDocument>): Promise<IPaymentApplicationDocument> {
    const item = new PaymentApplicationModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IPaymentApplicationDocument | null> {
    return PaymentApplicationModel.findById(id);
  }

  async update(id: string, data: Partial<IPaymentApplicationDocument>): Promise<IPaymentApplicationDocument | null> {
    return PaymentApplicationModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IPaymentApplicationDocument | null> {
    return PaymentApplicationModel.findByIdAndDelete(id);
  }

  async findAll(params: PaymentApplicationQueryParams = {}): Promise<{ items: IPaymentApplicationDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { name: regex },
        { provider: regex },
        { applicationId: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      PaymentApplicationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PaymentApplicationModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await PaymentApplicationModel.countDocuments();
    if (count > 0) return;
    const today = new Date().toISOString().split('T')[0];
    await PaymentApplicationModel.insertMany([
      { applicationId: 'APP-001', name: 'Stripe Payroll Gateway', provider: 'Stripe', apiKeyMasked: 'sk_live_****Xr8p', webhookUrl: 'https://api.huremaso.com/webhooks/stripe', status: 'Active', autoDisburse: true, disbursementDay: 25, lastSync: today },
      { applicationId: 'APP-002', name: 'Razorpay Payout', provider: 'Razorpay', apiKeyMasked: 'rzp_live_****9kQj', webhookUrl: 'https://api.huremaso.com/webhooks/razorpay', status: 'Inactive', autoDisburse: false, lastSync: today },
      { applicationId: 'APP-003', name: 'PayPal Mass Payout', provider: 'PayPal', apiKeyMasked: 'AXh****mZ92', status: 'Pending', autoDisburse: false },
    ]);
  }
}

export const paymentApplicationRepository = new PaymentApplicationRepository();
