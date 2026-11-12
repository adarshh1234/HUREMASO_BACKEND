import { Router } from 'express';
import { timeReportController } from './timeReport.controller';

const router = Router();

router.get('/project', (req, res) => timeReportController.getProjectReport(req, res));
router.get('/employee', (req, res) => timeReportController.getEmployeeReport(req, res));
router.get('/attendance-summary', (req, res) => timeReportController.getAttendanceSummary(req, res));

export const timeReportRoutes = router;
