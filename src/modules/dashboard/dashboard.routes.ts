import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();

// 1. Full Dashboard Overview
router.get('/', dashboardController.getDashboardOverview);
router.get('/overview', dashboardController.getDashboardOverview);

// 2. High-level Summary Metrics
router.get('/summary', dashboardController.getSummaryMetrics);

// 3. Time at Work / Punch & Weekly Hours
router.get('/time-at-work', dashboardController.getTimeAtWork);
router.post('/time-at-work/clock-in', dashboardController.clockIn);
router.post('/time-at-work/clock-out', dashboardController.clockOut);

// 4. Workforce & Employee Statistics
router.get('/workforce', dashboardController.getWorkforceMetrics);
router.get('/employee-distribution/sub-unit', dashboardController.getSubUnitDistribution);
router.get('/employee-distribution/location', dashboardController.getLocationDistribution);

// 5. Attendance & Leave Summary
router.get('/attendance', dashboardController.getAttendanceMetrics);
router.get('/employees-on-leave', dashboardController.getEmployeesOnLeave);

// 6. Payroll Summary
router.get('/payroll', dashboardController.getPayrollMetrics);

// 7. Recruitment & Onboarding Metrics
router.get('/recruitment', dashboardController.getRecruitmentMetrics);

// 8. Performance Insights
router.get('/performance', dashboardController.getPerformanceMetrics);

// 9. My Actions / Pending Tasks
router.get('/actions', dashboardController.getMyActions);
router.get('/my-actions', dashboardController.getMyActions);

// 10. Buzz Latest Posts & Announcements
router.get('/buzz', dashboardController.getBuzzPosts);
router.post('/buzz', dashboardController.createBuzzPost);
router.patch('/buzz/:id', dashboardController.updateBuzzPost);
router.delete('/buzz/:id', dashboardController.deleteBuzzPost);

// 11. Recent Activity Feed
router.get('/activities', dashboardController.getRecentActivities);
router.get('/recent-activity', dashboardController.getRecentActivities);

export default router;
