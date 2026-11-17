import { Router } from 'express';
import { performanceAppraisalController } from './performanceAppraisal.controller';

const router = Router();

// Summary reports
router.get('/reports/summary', performanceAppraisalController.getReportsSummary);
router.get('/summary', performanceAppraisalController.getReportsSummary);

// Cycles Management endpoints (Must come before generic :id)
router.get('/cycles', performanceAppraisalController.getAllCycles);
router.post('/cycles', performanceAppraisalController.createCycle);
router.get('/cycles/:id', performanceAppraisalController.getCycleById);
router.patch('/cycles/:id', performanceAppraisalController.updateCycle);
router.put('/cycles/:id', performanceAppraisalController.updateCycle);
router.delete('/cycles/:id', performanceAppraisalController.deleteCycle);

// Special Action Endpoints
router.post('/:id/generate-ai-report', performanceAppraisalController.generateAiReport);
router.post('/:id/attendance-sync', performanceAppraisalController.syncAttendanceAndTasks);
router.get('/:id/export', performanceAppraisalController.getExportData);

// Section specific updates
router.patch('/:id/reports-ai', performanceAppraisalController.updateReportsAi);
router.put('/:id/reports-ai', performanceAppraisalController.updateReportsAi);
router.patch('/:id/attendance-time', performanceAppraisalController.updateAttendanceTime);
router.put('/:id/attendance-time', performanceAppraisalController.updateAttendanceTime);
router.patch('/:id/smart-work', performanceAppraisalController.updateSmartWork);
router.put('/:id/smart-work', performanceAppraisalController.updateSmartWork);
router.patch('/:id/psychometric', performanceAppraisalController.updatePsychometric);
router.put('/:id/psychometric', performanceAppraisalController.updatePsychometric);
router.patch('/:id/e-sops', performanceAppraisalController.updateEsops);
router.put('/:id/e-sops', performanceAppraisalController.updateEsops);
router.patch('/:id/review', performanceAppraisalController.updateReview);
router.put('/:id/review', performanceAppraisalController.updateReview);
router.post('/:id/feedback-360', performanceAppraisalController.add360Feedback);
router.post('/:id/endorsements', performanceAppraisalController.addEndorsement);
router.post('/:id/endorsement', performanceAppraisalController.addEndorsement);
router.patch('/:id/strategy', performanceAppraisalController.updateStrategy);
router.put('/:id/strategy', performanceAppraisalController.updateStrategy);
router.patch('/:id/analytics-ai', performanceAppraisalController.updateAnalyticsAi);
router.put('/:id/analytics-ai', performanceAppraisalController.updateAnalyticsAi);

// General CRUD
router.get('/', performanceAppraisalController.getAll);
router.post('/', performanceAppraisalController.create);
router.get('/:id', performanceAppraisalController.getById);
router.patch('/:id', performanceAppraisalController.update);
router.put('/:id', performanceAppraisalController.update);
router.delete('/:id', performanceAppraisalController.delete);

export default router;
