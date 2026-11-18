import { Router } from 'express';
import { payrollAIController } from './payrollAI.controller';

const router = Router();

router.post('/chat', payrollAIController.chat);
router.get('/workforce-analytics', payrollAIController.getWorkforceAnalytics);
router.get('/performance-skills', payrollAIController.getPerformanceSkills);
router.get('/employee-experience', payrollAIController.getEmployeeExperience);
router.get('/compliance-check', payrollAIController.getComplianceCheck);
router.post('/sync-knowledge', payrollAIController.syncKnowledge);

export default router;
