import { Router } from 'express';
import { aiController } from './ai.controller';
import { authMiddleware } from '../../common/middlewares/authMiddleware';

const router = Router();

// Protect all AI routes with standard auth middleware
router.use(authMiddleware);

// ================= 1. PREDICTIVE WORKFORCE ANALYTICS & FLIGHT RISK =================
router.get('/workforce/analytics', aiController.getWorkforceAnalytics);
router.get('/workforce/flight-risks', aiController.listFlightRisks);
router.post('/workforce/flight-risks', aiController.createFlightRisk);
router.get('/workforce/flight-risks/:id', aiController.getFlightRiskById);
router.put('/workforce/flight-risks/:id', aiController.updateFlightRisk);
router.patch('/workforce/flight-risks/:id/resolve', aiController.resolveFlightRisk);
router.post('/workforce/predict-risk', aiController.predictFlightRisk);

// ================= 2. AUTONOMOUS PERFORMANCE & SKILL MANAGEMENT =================
router.get('/performance/skills', aiController.listSkillGaps);
router.post('/performance/skills', aiController.createSkillGap);
router.get('/performance/skills/:id', aiController.getSkillGapById);
router.put('/performance/skills/:id', aiController.updateSkillGap);
router.get('/performance/recommendations', aiController.listDevelopmentRecommendations);
router.post('/performance/recommendations', aiController.createDevelopmentRecommendation);
router.put('/performance/recommendations/:id', aiController.updateDevelopmentRecommendation);

// ================= 3. CONVERSATIONAL HR & EMPLOYEE EXPERIENCE (EX) =================
router.get('/chat/conversation', aiController.getConversation);
router.post('/chat/message', aiController.sendChatMessage);
router.post('/chat/clear', aiController.clearConversation);
router.get('/ex/sentiment', aiController.getSentimentMetrics);
router.post('/knowledge-base/sync', aiController.syncKnowledgeBase);

// ================= 4. AUTOMATED COMPLIANCE & AUDIT READINESS =================
router.get('/compliance', aiController.listComplianceRecords);
router.post('/compliance', aiController.createComplianceRecord);
router.get('/compliance/:id', aiController.getComplianceById);
router.put('/compliance/:id', aiController.updateComplianceRecord);
router.delete('/compliance/:id', aiController.deleteComplianceRecord);
router.post('/compliance/scan', aiController.runComplianceScan);

export default router;
