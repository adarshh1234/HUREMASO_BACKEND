import { Request, Response, NextFunction } from 'express';
import { notificationService, NotificationService } from './notification.service';
import { sendResponse } from '../../common/utils/apiResponse';
import {
  createNotificationSchema,
  updateNotificationSchema,
  queryNotificationSchema,
  notificationIdParamSchema,
  recipientsQuerySchema,
} from './notification.validator';
import { NotificationChannel } from './notification.types';

export class NotificationController {
  constructor(private service: NotificationService = notificationService) {}

  getRecipients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelParam = (req.query.channel as string) || 'EMAIL';
      const upper = channelParam.toUpperCase();
      let channel = NotificationChannel.EMAIL;
      if (Object.values(NotificationChannel).includes(upper as NotificationChannel)) {
        channel = upper as NotificationChannel;
      }

      const result = await this.service.getRecipients(channel);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createNotificationSchema.parse(req.body);
      const notification = await this.service.createNotification(validatedData, req.user);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      const notification = await this.service.sendNotification(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Notification sent successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  retryNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      const notification = await this.service.retryNotification(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Failed recipient deliveries retried successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryNotificationSchema.parse(req.query);
      const result = await this.service.getNotifications(query);
      sendResponse({
        res,
        statusCode: 200,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      const notification = await this.service.getNotificationById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  updateNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      const updateData = updateNotificationSchema.parse(req.body);
      const updated = await this.service.updateNotification(id, updateData);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Notification updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      await this.service.deleteNotification(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Notification draft deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // In-app Employee Notifications endpoints
  getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = (req.query.employeeId as string) || (req.user as any)?.employeeId || (req.user as any)?.id || 'default';
      const email = (req.query.email as string) || (req.user as any)?.email;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.service.getEmployeeInAppNotifications(employeeId, email, page, limit);
      sendResponse({
        res,
        statusCode: 200,
        data: result.data,
        pagination: {
          totalItems: result.total,
          unreadCount: result.unreadCount,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(result.total / limit) || 1,
          hasNextPage: page < (Math.ceil(result.total / limit) || 1),
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = (req.query.employeeId as string) || (req.user as any)?.employeeId || (req.user as any)?.id || 'default';
      const email = (req.query.email as string) || (req.user as any)?.email;
      const result = await this.service.getEmployeeInAppNotifications(employeeId, email, 1, 1);
      sendResponse({
        res,
        statusCode: 200,
        data: { unreadCount: result.unreadCount },
      });
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = notificationIdParamSchema.parse(req.params);
      const recipientId = (req.body.recipientId as string) || (req.user as any)?.employeeId || (req.user as any)?.id || 'default';
      const updated = await this.service.markNotificationAsRead(id, recipientId);
      sendResponse({
        res,
        statusCode: 200,
        message: updated ? 'Notification marked as read' : 'Notification already read or not found',
        data: { updated },
      });
    } catch (error) {
      next(error);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = (req.body.recipientId as string) || (req.user as any)?.employeeId || (req.user as any)?.id || 'default';
      const count = await this.service.markAllNotificationsAsRead(recipientId);
      sendResponse({
        res,
        statusCode: 200,
        message: `${count} notifications marked as read`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
