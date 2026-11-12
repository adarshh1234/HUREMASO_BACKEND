import { Router } from 'express';
import { profileController } from './profile.controller';

const router = Router();

// ─── Profile ──────────────────────────────────────────────────────────────
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.post('/password', profileController.changePassword);

// ─── Storage ──────────────────────────────────────────────────────────────
router.get('/storage', profileController.getStorage);

// ─── Security ─────────────────────────────────────────────────────────────
router.get('/security', profileController.getSecuritySettings);
router.patch('/security', profileController.updateSecuritySettings);

// ─── Preferences ──────────────────────────────────────────────────────────
router.get('/preferences', profileController.getPreferences);
router.patch('/preferences', profileController.updatePreferences);

// ─── Contacts ─────────────────────────────────────────────────────────────
router.get('/contacts', profileController.getContacts);

// ─── Subscriptions ────────────────────────────────────────────────────────
router.get('/subscriptions', profileController.getSubscriptions);

// ─── Help ─────────────────────────────────────────────────────────────────
router.get('/help', profileController.getHelpArticles);

// ─── User Bell Notifications ──────────────────────────────────────────────
// IMPORTANT: read-all must come before /:id to avoid "read-all" being treated as a param
router.get('/notifications', profileController.getNotifications);
router.patch('/notifications/read-all', profileController.markAllNotificationsRead);
router.patch('/notifications/:id/read', profileController.markNotificationRead);

export default router;
