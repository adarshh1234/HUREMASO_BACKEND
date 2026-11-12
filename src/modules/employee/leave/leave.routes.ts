import { Router } from 'express';
import { leaveController } from './leave.controller';

const router = Router();

// Requests
router
  .route('/requests')
  .post(leaveController.createRequest)
  .get(leaveController.getRequests);

router
  .route('/requests/:id/status')
  .patch(leaveController.updateRequestStatus);

router
  .route('/assign')
  .post(leaveController.assignLeave);

// Balances
router
  .route('/balances')
  .get(leaveController.getBalances);

// Entitlements
router
  .route('/entitlements')
  .post(leaveController.addEntitlement)
  .get(leaveController.getEntitlements);

// Reports
router
  .route('/reports/usage')
  .get(leaveController.getLeaveUsageReport);

// Configuration - Period
router
  .route('/config/period')
  .get(leaveController.getLeavePeriod)
  .post(leaveController.saveLeavePeriod)
  .put(leaveController.saveLeavePeriod);

router
  .route('/period')
  .get(leaveController.getLeavePeriod)
  .post(leaveController.saveLeavePeriod)
  .put(leaveController.saveLeavePeriod);

// Configuration - Leave Types
router
  .route('/config/types')
  .get(leaveController.getLeaveTypes)
  .post(leaveController.createLeaveType);

router
  .route('/types')
  .get(leaveController.getLeaveTypes)
  .post(leaveController.createLeaveType);

router
  .route('/config/types/:id')
  .put(leaveController.updateLeaveType)
  .delete(leaveController.deleteLeaveType);

router
  .route('/types/:id')
  .put(leaveController.updateLeaveType)
  .delete(leaveController.deleteLeaveType);

// Configuration - Work Week
router
  .route('/config/work-week')
  .get(leaveController.getWorkWeek)
  .post(leaveController.saveWorkWeek)
  .put(leaveController.saveWorkWeek);

router
  .route('/work-week')
  .get(leaveController.getWorkWeek)
  .post(leaveController.saveWorkWeek)
  .put(leaveController.saveWorkWeek);

// Holidays
router
  .route('/holidays')
  .get(leaveController.getHolidays)
  .post(leaveController.createHoliday);

router
  .route('/config/holidays')
  .get(leaveController.getHolidays)
  .post(leaveController.createHoliday);

router
  .route('/holidays/:id')
  .put(leaveController.updateHoliday)
  .delete(leaveController.deleteHoliday);

router
  .route('/config/holidays/:id')
  .put(leaveController.updateHoliday)
  .delete(leaveController.deleteHoliday);

export default router;
