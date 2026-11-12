import { Router } from 'express';
import { employeeAppController } from './employeeApp.controller';
import { validateRequest } from '../../common/middlewares/validateRequest';
import {
  createAppUserSchema,
  updateAppUserSchema,
  toggleUserStatusSchema,
  updatePermissionsSchema,
  resetDeviceSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  createAppEmployeeRequestSchema,
  updateAppEmployeeRequestStatusSchema,
  updateAppSettingsSchema,
} from './employeeApp.validator';

const router = Router();

// ================= 1. STATS & OVERVIEW =================
router.get('/stats', (req, res) => employeeAppController.getStats(req, res));

// ================= 2. APP SETTINGS & CONFIG =================
router.get('/settings', (req, res) => employeeAppController.getSettings(req, res));
router.put('/settings', validateRequest(updateAppSettingsSchema), (req, res) =>
  employeeAppController.updateSettings(req, res)
);

// ================= 3. ACTIVITY & AUDIT LOGS =================
router.get('/activity-logs', (req, res) => employeeAppController.getActivityLogs(req, res));

// ================= 4. ANNOUNCEMENTS & NOTIFICATIONS =================
router.get('/announcements', (req, res) => employeeAppController.getAllAnnouncements(req, res));
router.post('/announcements', validateRequest(createAnnouncementSchema), (req, res) =>
  employeeAppController.createAnnouncement(req, res)
);
router.get('/announcements/:id', (req, res) => employeeAppController.getAnnouncementById(req, res));
router.put('/announcements/:id', validateRequest(updateAnnouncementSchema), (req, res) =>
  employeeAppController.updateAnnouncement(req, res)
);
router.delete('/announcements/:id', (req, res) => employeeAppController.deleteAnnouncement(req, res));

// ================= 5. EMPLOYEE APP REQUESTS =================
router.get('/requests', (req, res) => employeeAppController.getAllRequests(req, res));
router.post('/requests', validateRequest(createAppEmployeeRequestSchema), (req, res) =>
  employeeAppController.createRequest(req, res)
);
router.get('/requests/:id', (req, res) => employeeAppController.getRequestById(req, res));
router.patch('/requests/:id/status', validateRequest(updateAppEmployeeRequestStatusSchema), (req, res) =>
  employeeAppController.updateRequestStatus(req, res)
);

// ================= 6. APP USERS & PROFILES =================
router.get('/users', (req, res) => employeeAppController.getAllUsers(req, res));
router.post('/users', validateRequest(createAppUserSchema), (req, res) =>
  employeeAppController.createUser(req, res)
);
router.get('/users/:id', (req, res) => employeeAppController.getUserById(req, res));
router.put('/users/:id', validateRequest(updateAppUserSchema), (req, res) =>
  employeeAppController.updateUser(req, res)
);
router.patch('/users/:id/status', validateRequest(toggleUserStatusSchema), (req, res) =>
  employeeAppController.toggleUserStatus(req, res)
);
router.patch('/users/:id/permissions', validateRequest(updatePermissionsSchema), (req, res) =>
  employeeAppController.updatePermissions(req, res)
);
router.post('/users/:id/reset-device', validateRequest(resetDeviceSchema), (req, res) =>
  employeeAppController.resetDevice(req, res)
);
router.delete('/users/:id', (req, res) => employeeAppController.deleteUser(req, res));

// Default root route alias to users
router.get('/', (req, res) => employeeAppController.getAllUsers(req, res));

export const employeeAppRoutes = router;
export default router;
