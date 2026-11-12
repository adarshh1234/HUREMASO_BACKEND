import { Request, Response, NextFunction } from 'express';
import { profileService, ProfileService } from './profile.service';
import { sendResponse } from '../../common/utils/apiResponse';
import {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  updateSecuritySchema,
  notifIdParamSchema,
} from './profile.validator';

// Resolve userId from request – when auth middleware is wired, use req.user?.id; otherwise 'default'
const resolveUserId = (req: Request): string =>
  (req as any).user?.id || (req as any).user?.userId || 'default';

export class ProfileController {
  constructor(private service: ProfileService = profileService) {}

  // ─── Profile ─────────────────────────────────────────────────────────────

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const profile = await this.service.getProfile(userId);
      sendResponse({ res, statusCode: 200, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const updates = updateProfileSchema.parse(req.body) as import('./profile.types').IUpdateProfileDto;
      const profile = await this.service.updateProfile(userId, updates);
      sendResponse({ res, statusCode: 200, message: 'Profile updated successfully', data: profile });
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const result = await this.service.changePassword(userId, currentPassword, newPassword);
      sendResponse({ res, statusCode: 200, message: result.message });
    } catch (err) {
      next(err);
    }
  };

  // ─── Storage ──────────────────────────────────────────────────────────────

  getStorage = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getStorageUsage();
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  // ─── Security ─────────────────────────────────────────────────────────────

  getSecuritySettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const data = await this.service.getSecuritySettings(userId);
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  updateSecuritySettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const updates = updateSecuritySchema.parse(req.body);
      const data = await this.service.updateSecuritySettings(userId, updates);
      sendResponse({ res, statusCode: 200, message: 'Security settings updated', data });
    } catch (err) {
      next(err);
    }
  };

  // ─── Preferences ─────────────────────────────────────────────────────────

  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const data = await this.service.getPreferences(userId);
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const updates = updatePreferencesSchema.parse(req.body);
      const data = await this.service.updatePreferences(userId, updates);
      sendResponse({ res, statusCode: 200, message: 'Preferences updated', data });
    } catch (err) {
      next(err);
    }
  };

  // ─── Contacts ─────────────────────────────────────────────────────────────

  getContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const data = await this.service.getContacts(userId);
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  // ─── Subscriptions ────────────────────────────────────────────────────────

  getSubscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const data = await this.service.getSubscriptions(userId);
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  // ─── Help ─────────────────────────────────────────────────────────────────

  getHelpArticles = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getHelpArticles();
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  // ─── User Bell Notifications ──────────────────────────────────────────────

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const result = await this.service.getNotifications(userId);
      sendResponse({ res, statusCode: 200, data: result.notifications, pagination: { unreadCount: result.unreadCount } });
    } catch (err) {
      next(err);
    }
  };

  markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const { id } = notifIdParamSchema.parse(req.params);
      const updated = await this.service.markNotificationRead(userId, id);
      sendResponse({ res, statusCode: 200, message: 'Notification marked as read', data: updated });
    } catch (err) {
      next(err);
    }
  };

  markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = resolveUserId(req);
      const data = await this.service.markAllNotificationsRead(userId);
      sendResponse({ res, statusCode: 200, message: 'All notifications marked as read', data });
    } catch (err) {
      next(err);
    }
  };
}

export const profileController = new ProfileController();
