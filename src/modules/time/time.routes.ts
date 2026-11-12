import { Router } from 'express';
import { attendanceRoutes } from './attendance/attendance.routes';
import { timesheetRoutes } from './timesheet/timesheet.routes';
import { overtimeRoutes } from './overtime/overtime.routes';
import { replacementRoutes } from './replacement/replacement.routes';
import { leaveSalaryRoutes } from './leaveSalary/leaveSalary.routes';
import { timePayrollRoutes } from './payroll/timePayroll.routes';
import { timeReportRoutes } from './reports/timeReport.routes';

const router = Router();

router.use('/attendance', attendanceRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/overtime', overtimeRoutes);
router.use('/replacement', replacementRoutes);
router.use('/leave-salary', leaveSalaryRoutes);
router.use('/payroll', timePayrollRoutes);
router.use('/reports', timeReportRoutes);

export default router;
