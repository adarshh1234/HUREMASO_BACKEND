import { NotificationChannel, INotification, DeliveryStatus, IRecipientDelivery } from '../notification.types';
import { IDeliveryResult, IProviderSendResult } from './email.provider';
import { UserNotificationModel } from '../../profile/profile.model';

export class EmployeeAppNotificationProvider {
  channel = NotificationChannel.EMPLOYEE_APP;

  async send(
    notification: INotification,
    deliveries?: IRecipientDelivery[]
  ): Promise<IProviderSendResult> {
    const targets = deliveries && deliveries.length > 0 ? deliveries : notification.recipientDeliveries || [];
    const results: IDeliveryResult[] = [];

    for (let i = 0; i < targets.length; i++) {
      const recipient = targets[i];
      const messageId = `app_notif_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        // Also feed into UserNotificationModel so the authenticated user bell icon picks it up
        await UserNotificationModel.create({
          userId: recipient.recipientId || 'default',
          title: notification.subject || 'New App Notification',
          message: notification.message,
          type: 'info',
          isRead: false,
          link: '/employee-app/notifications',
        }).catch(() => null); // non-blocking if UserNotificationModel fails

        results.push({
          recipientId: recipient.recipientId,
          status: DeliveryStatus.DELIVERED,
          messageId,
        });
      } catch (err: any) {
        results.push({
          recipientId: recipient.recipientId,
          status: DeliveryStatus.FAILED,
          error: err?.message || 'Failed to dispatch in-app notification',
        });
      }
    }

    return {
      success: true,
      results,
      providerResponse: {
        channel: this.channel,
        totalAttempted: targets.length,
        delivered: results.filter((r) => r.status === DeliveryStatus.DELIVERED).length,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
