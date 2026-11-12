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

// 4. Workforce & Employee Statistics
router.get('/workforce', dashboardController.getWorkforceMetrics);

// 5. Attendance & Leave Summary
router.get('/attendance', dashboardController.getAttendanceMetrics);

// 6. Payroll Summary
router.get('/payroll', dashboardController.getPayrollMetrics);

// 7. Recruitment & Onboarding Metrics
router.get('/recruitment', dashboardController.getRecruitmentMetrics);

// 8. Performance Insights
router.get('/performance', dashboardController.getPerformanceMetrics);

// 9. My Actions / Pending Tasks
router.get('/actions', dashboardController.getMyActions);

// 10. Buzz Latest Posts & Announcements
router.get('/buzz', dashboardController.getBuzzPosts);

// 11. Recent Activity Feed
router.get('/activities', dashboardController.getRecentActivities);

export default router;
