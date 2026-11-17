import { Router } from 'express';
import { aiController } from './ai.controller';
import { aiAuthMiddleware, aiRoleGuard, aiChatRateLimiter, aiSyncRateLimiter } from './ai.auth';

const router = Router();

// Protect all AI routes with verified cryptographic & database-backed authentication
router.use(aiAuthMiddleware);

// ================= 1. PREDICTIVE WORKFORCE ANALYTICS & FLIGHT RISK =================
// Sensitive workforce flight risk & turnover data protected by Role-Based Access Control
router.get('/workforce/analytics', aiRoleGuard(['Admin', 'HR_Manager']), aiController.getWorkforceAnalytics);
router.get('/workforce/flight-risks', aiRoleGuard(['Admin', 'HR_Manager']), aiController.listFlightRisks);
router.post('/workforce/flight-risks', aiRoleGuard(['Admin', 'HR_Manager']), aiController.createFlightRisk);
router.get('/workforce/flight-risks/:id', aiRoleGuard(['Admin', 'HR_Manager']), aiController.getFlightRiskById);
router.put('/workforce/flight-risks/:id', aiRoleGuard(['Admin', 'HR_Manager']), aiController.updateFlightRisk);
router.delete('/workforce/flight-risks/:id', aiRoleGuard(['Admin', 'HR_Manager']), aiController.deleteFlightRisk);
router.patch('/workforce/flight-risks/:id/resolve', aiRoleGuard(['Admin', 'HR_Manager']), aiController.resolveFlightRisk);
router.post('/workforce/predict-risk', aiRoleGuard(['Admin', 'HR_Manager', 'Manager']), aiController.predictFlightRisk);

// ================= 2. AUTONOMOUS PERFORMANCE & SKILL MANAGEMENT =================
router.get('/performance/skills', aiController.listSkillGaps);
router.post('/performance/skills', aiRoleGuard(['Admin', 'HR_Manager', 'Manager']), aiController.createSkillGap);
router.get('/performance/skills/:id', aiController.getSkillGapById);
router.put('/performance/skills/:id', aiRoleGuard(['Admin', 'HR_Manager', 'Manager']), aiController.updateSkillGap);
router.get('/performance/recommendations', aiController.listDevelopmentRecommendations);
router.post('/performance/recommendations', aiRoleGuard(['Admin', 'HR_Manager', 'Manager']), aiController.createDevelopmentRecommendation);
router.put('/performance/recommendations/:id', aiRoleGuard(['Admin', 'HR_Manager', 'Manager']), aiController.updateDevelopmentRecommendation);

// ================= 3. CONVERSATIONAL HR & EMPLOYEE EXPERIENCE (EX) =================
router.get('/chat/conversation', aiController.getConversation);
router.post('/chat/message', aiChatRateLimiter, aiController.sendChatMessage);
router.post('/chat/clear', aiController.clearConversation);
router.get('/ex/sentiment', aiController.getSentimentMetrics);
router.post('/knowledge-base/sync', aiSyncRateLimiter, aiRoleGuard(['Admin', 'HR_Manager']), aiController.syncKnowledgeBase);
router.get('/knowledge-base/documents', aiController.listKnowledgeDocuments);
router.get('/knowledge-base/chunks', aiController.listKnowledgeChunks);
router.get('/knowledge-base/search', aiController.searchKnowledgeBase);

// ================= 4. AUTOMATED COMPLIANCE & AUDIT READINESS =================
router.get('/compliance', aiController.listComplianceRecords);
router.post('/compliance', aiRoleGuard(['Admin', 'HR_Manager']), aiController.createComplianceRecord);
router.get('/compliance/:id', aiController.getComplianceById);
router.put('/compliance/:id', aiRoleGuard(['Admin', 'HR_Manager']), aiController.updateComplianceRecord);
router.delete('/compliance/:id', aiRoleGuard(['Admin', 'HR_Manager']), aiController.deleteComplianceRecord);
router.post('/compliance/scan', aiRoleGuard(['Admin', 'HR_Manager']), aiController.runComplianceScan);

export default router;
