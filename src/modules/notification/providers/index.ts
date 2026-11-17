import { NotificationChannel, INotification, IRecipientDelivery } from '../notification.types';
import { EmailNotificationProvider, IProviderSendResult } from './email.provider';
import { SmsNotificationProvider } from './sms.provider';
import { WhatsAppNotificationProvider } from './whatsapp.provider';
import { EmployeeAppNotificationProvider } from './employeeApp.provider';
import { HuremasoBroadcastNotificationProvider } from './huremaso.provider';

export interface INotificationProvider {
  channel: NotificationChannel;
  send(
    notification: INotification,
    deliveries?: IRecipientDelivery[]
  ): Promise<{ success: boolean; results?: any[]; providerResponse?: any }>;
}

export class MockNotificationProvider implements INotificationProvider {
  constructor(public channel: NotificationChannel) {}

  async send(
    notification: INotification,
    deliveries?: IRecipientDelivery[]
  ): Promise<{ success: boolean; results?: any[]; providerResponse?: any }> {
    console.log(`[Provider Stub - ${this.channel}] Dispatching message ID: ${notification._id || (notification as any).id || 'new'}`);
    return {
      success: true,
      providerResponse: {
        status: 'DISPATCHED_STUB',
        channel: this.channel,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ProviderRegistry {
  private providers: Map<NotificationChannel, INotificationProvider> = new Map();

  constructor() {
    this.registerProvider(new EmailNotificationProvider());
    this.registerProvider(new SmsNotificationProvider());
    this.registerProvider(new WhatsAppNotificationProvider());
    this.registerProvider(new EmployeeAppNotificationProvider());
    this.registerProvider(new HuremasoBroadcastNotificationProvider());
  }

  registerProvider(provider: INotificationProvider): void {
    this.providers.set(provider.channel, provider);
  }

  getProvider(channel: NotificationChannel): INotificationProvider {
    const provider = this.providers.get(channel);
    if (!provider) {
      return new MockNotificationProvider(channel);
    }
    return provider;
  }
}

export const providerRegistry = new ProviderRegistry();
