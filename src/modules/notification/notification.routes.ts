import { Router } from 'express';
import { notificationController } from './notification.controller';
import { sendRateLimiter } from '../../common/middlewares/rateLimiter';

const router = Router();

// Recipient management with channel validation
router.get('/recipients', notificationController.getRecipients);

// In-app employee notifications
router.get('/my-notifications/unread-count', notificationController.getUnreadCount);
router.patch('/my-notifications/read-all', notificationController.markAllRead);
router.patch('/my-notifications/:id/read', notificationController.markRead);
router.get('/my-notifications', notificationController.getMyNotifications);

// Notification draft & send endpoints
router
  .route('/')
  .post(notificationController.createNotification)
  .get(notificationController.getNotifications);

router
  .route('/:id/send')
  .post(sendRateLimiter, notificationController.sendNotification);

router
  .route('/:id/retry')
  .post(sendRateLimiter, notificationController.retryNotification);

// By ID routes
router
  .route('/:id')
  .get(notificationController.getNotificationById)
  .patch(notificationController.updateNotification)
  .delete(notificationController.deleteNotification);

export default router;
