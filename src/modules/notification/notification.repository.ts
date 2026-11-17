import { FilterQuery } from 'mongoose';
import { NotificationModel, INotificationDocument } from './notification.model';
import {
  INotification,
  INotificationQuery,
  IPaginatedResult,
  NotificationStatus,
  DeliveryStatus,
} from './notification.types';
import { escapeRegex } from '../../common/utils/regex';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotificationDocument> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  async findById(id: string): Promise<INotificationDocument | null> {
    return await NotificationModel.findById(id).exec();
  }

  async updateById(id: string, updateData: Partial<INotification>): Promise<INotificationDocument | null> {
    return await NotificationModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async findAndMarkAsSent(id: string): Promise<INotificationDocument | null> {
    return await NotificationModel.findOneAndUpdate(
      { _id: id, status: { $ne: NotificationStatus.SENT } },
      { status: NotificationStatus.SENT },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findWithPagination(query: INotificationQuery): Promise<IPaginatedResult<INotificationDocument>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<INotificationDocument> = {};

    if (query.channel) {
      filter.channel = query.channel;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search && query.search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { subject: searchRegex },
        { message: searchRegex },
        { recipients: searchRegex },
        { 'recipientDeliveries.name': searchRegex },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const [data, totalItems] = await Promise.all([
      NotificationModel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      NotificationModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find notifications addressed to a specific employee for in-app viewing
   */
  async findEmployeeNotifications(
    employeeId: string,
    email?: string,
    page = 1,
    limit = 20
  ): Promise<{ data: INotificationDocument[]; total: number; unreadCount: number }> {
    const skip = (Math.max(1, page) - 1) * limit;

    const filter: FilterQuery<INotificationDocument> = {
      status: NotificationStatus.SENT,
      $or: [
        { recipientType: 'ALL_EMPLOYEES' },
        { 'recipientDeliveries.recipientId': employeeId },
        ...(email ? [{ 'recipientDeliveries.contactAddress': email }] : []),
      ],
    };

    const [data, total, allMatches] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      NotificationModel.countDocuments(filter).exec(),
      NotificationModel.find(filter).select('recipientDeliveries').exec(),
    ]);

    // Calculate unread count specifically for this employee
    let unreadCount = 0;
    for (const notif of allMatches) {
      const match = notif.recipientDeliveries?.find(
        (d) => d.recipientId === employeeId || (email && d.contactAddress === email)
      );
      if (!match || match.status !== DeliveryStatus.READ) {
        unreadCount++;
      }
    }

    return { data, total, unreadCount };
  }

  /**
   * Mark notification as read for a specific recipient
   */
  async markRecipientAsRead(notificationId: string, recipientId: string): Promise<boolean> {
    const notif = await NotificationModel.findById(notificationId);
    if (!notif) return false;

    let updated = false;
    const deliveries = notif.recipientDeliveries || [];
    for (const delivery of deliveries) {
      if (delivery.recipientId === recipientId && delivery.status !== DeliveryStatus.READ) {
        delivery.status = DeliveryStatus.READ;
        delivery.readAt = new Date();
        updated = true;
      }
    }

    if (updated) {
      notif.readCount = deliveries.filter((d) => d.status === DeliveryStatus.READ).length;
      await notif.save();
    }
    return updated;
  }

  /**
   * Mark all notifications as read for a recipient
   */
  async markAllRecipientsAsRead(recipientId: string): Promise<number> {
    const notifs = await NotificationModel.find({
      'recipientDeliveries.recipientId': recipientId,
      'recipientDeliveries.status': { $ne: DeliveryStatus.READ },
    });

    let count = 0;
    for (const notif of notifs) {
      let changed = false;
      const deliveries = notif.recipientDeliveries || [];
      for (const delivery of deliveries) {
        if (delivery.recipientId === recipientId && delivery.status !== DeliveryStatus.READ) {
          delivery.status = DeliveryStatus.READ;
          delivery.readAt = new Date();
          changed = true;
          count++;
        }
      }
      if (changed) {
        notif.readCount = deliveries.filter((d) => d.status === DeliveryStatus.READ).length;
        await notif.save();
      }
    }

    return count;
  }
}

export const notificationRepository = new NotificationRepository();
