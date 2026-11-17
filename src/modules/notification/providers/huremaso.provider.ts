import { NotificationChannel, INotification, DeliveryStatus, IRecipientDelivery } from '../notification.types';
import { IDeliveryResult, IProviderSendResult } from './email.provider';
import { UserNotificationModel } from '../../profile/profile.model';

export class HuremasoBroadcastNotificationProvider {
  channel = NotificationChannel.HUREMASO;

  async send(
    notification: INotification,
    deliveries?: IRecipientDelivery[]
  ): Promise<IProviderSendResult> {
    const targets = deliveries && deliveries.length > 0 ? deliveries : notification.recipientDeliveries || [];
    const results: IDeliveryResult[] = [];

    const category = notification.announcementCategory || 'General Announcement';

    for (let i = 0; i < targets.length; i++) {
      const recipient = targets[i];
      const messageId = `huremaso_bc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        await UserNotificationModel.create({
          userId: recipient.recipientId || 'default',
          title: `[${category}] ${notification.subject || 'Company Announcement'}`,
          message: notification.message,
          type: category === 'Emergency Notice' ? 'warning' : 'info',
          isRead: false,
          link: '/notifications/huremaso',
        }).catch(() => null);

        results.push({
          recipientId: recipient.recipientId,
          status: DeliveryStatus.DELIVERED,
          messageId,
        });
      } catch (err: any) {
        results.push({
          recipientId: recipient.recipientId,
          status: DeliveryStatus.FAILED,
          error: err?.message || 'Failed to dispatch platform broadcast',
        });
      }
    }

    return {
      success: true,
      results,
      providerResponse: {
        channel: this.channel,
        category,
        totalAttempted: targets.length,
        delivered: results.filter((r) => r.status === DeliveryStatus.DELIVERED).length,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
