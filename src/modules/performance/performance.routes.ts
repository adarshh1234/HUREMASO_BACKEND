import { Router } from 'express';
import performanceAppraisalRoutes from './performanceAppraisal.routes';
import { performanceAppraisalController } from './performanceAppraisal.controller';
import legacyPerformanceRoutes from '../employee/performance/performance.routes';

const router = Router();

// Appraisal routes
router.use('/appraisal', performanceAppraisalRoutes);
router.use('/appraisals', performanceAppraisalRoutes);
router.get('/reports/summary', performanceAppraisalController.getReportsSummary);

// Mount appraisal endpoints at root level of /performance as well for direct API access
router.use('/records', performanceAppraisalRoutes);

// Legacy performance routes (reviews, trackers)
router.use('/', legacyPerformanceRoutes);

export const performanceMasterRoutes = router;
export default router;
