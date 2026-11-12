import { Router } from 'express';
import { analyticsController } from './analytics.controller';

// 1. Reports Router
export const reportsRouter = Router();

reportsRouter.get('/employees', analyticsController.getEmployeeReport);
reportsRouter.get('/attendance-time', analyticsController.getAttendanceReport);
reportsRouter.get('/leave', analyticsController.getLeaveReport);
reportsRouter.get('/payroll', analyticsController.getPayrollReport);
reportsRouter.get('/recruitment', analyticsController.getRecruitmentReport);
reportsRouter.get('/onboarding', analyticsController.getOnboardingReport);
reportsRouter.get('/offboarding', analyticsController.getOffboardingReport);
reportsRouter.get('/performance', analyticsController.getPerformanceReport);
reportsRouter.get('/employee-app', analyticsController.getEmployeeAppReport);
reportsRouter.get('/wellness', analyticsController.getWellnessReport);
reportsRouter.get('/events', analyticsController.getEventsReport);
reportsRouter.get('/notifications', analyticsController.getNotificationsReport);

// 2. Analytics Router
export const analyticsRouter = Router();

analyticsRouter.get('/overview', analyticsController.getEmployeeOverview);
analyticsRouter.get('/attendance-trends', analyticsController.getAttendanceTrends);
analyticsRouter.get('/leave-trends', analyticsController.getLeaveTrends);
analyticsRouter.get('/payroll-summary', analyticsController.getPayrollSummary);
analyticsRouter.get('/recruitment-metrics', analyticsController.getRecruitmentMetrics);
analyticsRouter.get('/performance-metrics', analyticsController.getPerformanceMetrics);
analyticsRouter.get('/employee-of-period', analyticsController.getEmployeeOfPeriod);
analyticsRouter.get('/employee-of-the-week', analyticsController.getEmployeeOfWeek);
analyticsRouter.get('/employee-of-the-month', analyticsController.getEmployeeOfMonth);
analyticsRouter.get('/employee-of-the-year', analyticsController.getEmployeeOfYear);
analyticsRouter.get('/dashboard', analyticsController.getExecutiveDashboard);

// Sub-mount reports inside analytics for convenience: /api/v1/analytics/reports/...
analyticsRouter.use('/reports', reportsRouter);

export default analyticsRouter;
