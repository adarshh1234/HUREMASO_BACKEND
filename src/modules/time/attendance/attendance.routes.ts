import { Router } from 'express';
import { attendanceController } from './attendance.controller';

const router = Router();

router.post('/punch-in', (req, res, next) => attendanceController.punchIn(req, res, next));
router.post('/punch-out', (req, res, next) => attendanceController.punchOut(req, res, next));
router.get('/punch-status', (req, res, next) => attendanceController.getPunchStatus(req, res, next));
router.get('/records', (req, res, next) => attendanceController.getEmployeeRecords(req, res, next));
router.get('/my', (req, res, next) => attendanceController.getMyRecords(req, res, next));
router.get('/employee-records', (req, res, next) => attendanceController.getEmployeeRecords(req, res, next));
router.get('/config', (req, res, next) => attendanceController.getConfig(req, res, next));
router.post('/config', (req, res, next) => attendanceController.saveConfig(req, res, next));
router.put('/config', (req, res, next) => attendanceController.saveConfig(req, res, next));
router.get('/', (req, res, next) => attendanceController.getEmployeeRecords(req, res, next));

export const attendanceRoutes = router;
export default router;
