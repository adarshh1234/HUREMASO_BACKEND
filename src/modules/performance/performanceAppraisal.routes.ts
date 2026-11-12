import { Router } from 'express';
import { performanceAppraisalController } from './performanceAppraisal.controller';

const router = Router();

// Summary reports
router.get('/reports/summary', performanceAppraisalController.getReportsSummary);
router.get('/summary', performanceAppraisalController.getReportsSummary);

// CRUD
router.get('/', performanceAppraisalController.getAll);
router.post('/', performanceAppraisalController.create);
router.get('/:id', performanceAppraisalController.getById);
router.patch('/:id', performanceAppraisalController.update);
router.delete('/:id', performanceAppraisalController.delete);

// Section specific updates
router.patch('/:id/reports-ai', performanceAppraisalController.updateReportsAi);
router.patch('/:id/attendance-time', performanceAppraisalController.updateAttendanceTime);
router.patch('/:id/smart-work', performanceAppraisalController.updateSmartWork);
router.patch('/:id/psychometric', performanceAppraisalController.updatePsychometric);
router.patch('/:id/e-sops', performanceAppraisalController.updateEsops);
router.patch('/:id/review', performanceAppraisalController.updateReview);
router.post('/:id/endorsements', performanceAppraisalController.addEndorsement);
router.patch('/:id/strategy', performanceAppraisalController.updateStrategy);
router.patch('/:id/analytics-ai', performanceAppraisalController.updateAnalyticsAi);

export default router;
