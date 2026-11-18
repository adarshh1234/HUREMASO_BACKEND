import { Router } from 'express';
import { timesheetController } from './timesheet.controller';

const router = Router();

router.post('/', (req, res, next) => timesheetController.save(req, res, next));
router.post('/save', (req, res, next) => timesheetController.save(req, res, next));
router.get('/my', (req, res, next) => timesheetController.getMyTimesheets(req, res, next));
router.get('/pending-actions', (req, res, next) => timesheetController.getPendingActions(req, res, next));
router.get('/access-control/status', (req, res, next) => timesheetController.getAccessControlStatus(req, res, next));
router.get('/', (req, res, next) => timesheetController.getAll(req, res, next));

router.get('/:id', (req, res, next) => timesheetController.getById(req, res, next));
router.put('/:id', (req, res, next) => timesheetController.update(req, res, next));
router.patch('/:id', (req, res, next) => timesheetController.update(req, res, next));
router.post('/:id/submit', (req, res, next) => timesheetController.submit(req, res, next));
router.post('/:id/approve', (req, res, next) => timesheetController.approve(req, res, next));
router.post('/:id/reject', (req, res, next) => timesheetController.reject(req, res, next));
router.patch('/:id/status', (req, res, next) => timesheetController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => timesheetController.delete(req, res, next));

export const timesheetRoutes = router;
export default router;
