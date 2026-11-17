import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { generateAIToken } from '../src/modules/ai/ai.auth';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('HUREMASO + AI Module Integration Tests', () => {
  let createdFlightRiskId: string;
  let createdSkillGapId: string;
  let createdDevRecId: string;
  let createdComplianceId: string;

  // ================= 1. KNOWLEDGE BASE SYNCHRONIZATION & RAG =================
  describe('Knowledge Base & RAG Pipeline (/api/v1/ai/knowledge-base)', () => {
    it('should synchronize the AI knowledge base and return indexed documents & chunk counts', async () => {
      const res = await request(app)
        .post('/api/v1/ai/knowledge-base/sync')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Knowledge Base Synced');
      expect(res.body.data.syncedEntities).toBeGreaterThanOrEqual(4);
      expect(res.body.data.chunksCount).toBeGreaterThanOrEqual(16);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories).toContain('Leave & Attendance');
    });

    it('should list all synced knowledge documents with metadata', async () => {
      const res = await request(app)
        .get('/api/v1/ai/knowledge-base/documents');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      const leaveDoc = res.body.data.find((d: any) => d.documentId === 'DOC-POL-01');
      expect(leaveDoc).toBeDefined();
      expect(leaveDoc.title).toContain('Leave & Attendance Policy');
    });

    it('should list granular knowledge chunks', async () => {
      const res = await request(app)
        .get('/api/v1/ai/knowledge-base/chunks?documentId=DOC-POL-01');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      expect(res.body.data[0].keywords.length).toBeGreaterThan(0);
    });

    it('should execute semantic RAG search across knowledge chunks with source citations', async () => {
      const res = await request(app)
        .get('/api/v1/ai/knowledge-base/search?q=maternity leave benefits');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const topResult = res.body.data[0];
      expect(topResult.citation).toContain('Leave & Attendance Policy');
      expect(topResult.chunk.content).toContain('26 weeks');
    });
  });

  // ================= 2. PREDICTIVE WORKFORCE ANALYTICS & FLIGHT RISK =================
  describe('Predictive Workforce Analytics & Flight Risk (/api/v1/ai/workforce)', () => {
    it('should retrieve workforce turnover analytics and retention score', async () => {
      const res = await request(app)
        .get('/api/v1/ai/workforce/analytics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('projectedTurnoverRate');
      expect(res.body.data).toHaveProperty('retentionScore');
      expect(res.body.data).toHaveProperty('workforceHealthIndex');
      expect(res.body.data).toHaveProperty('departmentRiskDistribution');
      expect(res.body.data.highRiskCount).toBeGreaterThanOrEqual(0);
    });

    it('should list flight risk employees with default seeded data', async () => {
      const res = await request(app)
        .get('/api/v1/ai/workforce/flight-risks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      const first = res.body.data[0];
      expect(first).toHaveProperty('employeeName');
      expect(first).toHaveProperty('riskScore');
      expect(first).toHaveProperty('indicators');
    });

    it('should create a new employee flight risk assessment record', async () => {
      const res = await request(app)
        .post('/api/v1/ai/workforce/flight-risks')
        .send({
          employeeId: 'EMP-9021',
          employeeName: 'Rohan Sharma',
          department: 'Engineering',
          jobTitle: 'Backend Platform Engineer',
          riskLevel: 'Medium',
          riskScore: 58,
          indicators: [
            { factor: 'Stagnant Compensation Band', weight: 30, description: '24 months in same grade' },
          ],
          recommendedActions: ['Conduct quarterly salary adjustment review'],
          status: 'Open',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('Rohan Sharma');
      expect(res.body.data.riskScore).toBe(58);
      createdFlightRiskId = res.body.data.id || res.body.data._id;
    });

    it('should get flight risk record by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/ai/workforce/flight-risks/${createdFlightRiskId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('Rohan Sharma');
    });

    it('should update flight risk record', async () => {
      const res = await request(app)
        .put(`/api/v1/ai/workforce/flight-risks/${createdFlightRiskId}`)
        .send({
          status: 'Mitigating',
          notes: 'Retention discussion scheduled with VP of Engineering',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Mitigating');
      expect(res.body.data.notes).toContain('Retention discussion');
    });

    it('should mark flight risk as Resolved with mitigation record', async () => {
      const res = await request(app)
        .patch(`/api/v1/ai/workforce/flight-risks/${createdFlightRiskId}/resolve`)
        .send({
          resolvedBy: 'HR Partner',
          notes: 'Promoted to Staff Engineer band with compensation increase',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Resolved');
      expect(res.body.data.resolvedBy).toBe('HR Partner');
    });

    it('should evaluate and predict employee flight risk algorithmically', async () => {
      const res = await request(app)
        .post('/api/v1/ai/workforce/predict-risk')
        .send({
          tenureMonths: 36,
          appraisalScore: 2.8,
          overtimeHours: 48,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.riskLevel).toBe('High');
      expect(res.body.data.riskScore).toBeGreaterThanOrEqual(70);
      expect(res.body.data.indicators.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.recommendedActions.length).toBeGreaterThan(0);
    });

    it('should delete a flight risk record', async () => {
      const res = await request(app)
        .delete(`/api/v1/ai/workforce/flight-risks/${createdFlightRiskId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ================= 3. AUTONOMOUS PERFORMANCE & SKILL MANAGEMENT =================
  describe('Autonomous Performance & Skill Management (/api/v1/ai/performance)', () => {
    it('should list skill gap items with team readiness levels', async () => {
      const res = await request(app)
        .get('/api/v1/ai/performance/skills');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data[0]).toHaveProperty('readinessLevel');
      expect(res.body.data[0]).toHaveProperty('upskillingRecommended');
    });

    it('should create a new team skill gap entry and automatically compute gap percentage', async () => {
      const res = await request(app)
        .post('/api/v1/ai/performance/skills')
        .send({
          department: 'Security & DevOps',
          skillName: 'Kubernetes & Zero-Trust Architecture',
          category: 'Technical',
          targetCompetencyScore: 95,
          currentTeamScore: 70,
          requiredStaffCount: 8,
          qualifiedStaffCount: 4,
          notes: 'Crucial for upcoming SOC-2 Type II audit',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gapPercentage).toBe(25);
      expect(res.body.data.upskillingRecommended).toBe(true);
      createdSkillGapId = res.body.data.id || res.body.data._id;
    });

    it('should get skill gap record by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/ai/performance/skills/${createdSkillGapId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skillName).toContain('Kubernetes');
    });

    it('should update skill gap record and recalculate readiness level', async () => {
      const res = await request(app)
        .put(`/api/v1/ai/performance/skills/${createdSkillGapId}`)
        .send({
          currentTeamScore: 88,
          qualifiedStaffCount: 7,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentTeamScore).toBe(88);
      expect(res.body.data.gapPercentage).toBe(7);
      expect(res.body.data.upskillingRecommended).toBe(false);
    });

    it('should list development recommendations', async () => {
      const res = await request(app)
        .get('/api/v1/ai/performance/recommendations');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should create a personalized development recommendation', async () => {
      const res = await request(app)
        .post('/api/v1/ai/performance/recommendations')
        .send({
          employeeId: 'EMP-1042',
          employeeName: 'Sarah Joseph',
          department: 'Engineering',
          skillName: 'Kubernetes & Zero-Trust Architecture',
          recommendationTitle: 'Certified Kubernetes Administrator (CKA) Certification',
          recommendationType: 'Certification',
          priority: 'High',
          status: 'Suggested',
          targetCompletionDate: '2026-12-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendationTitle).toContain('CKA');
      createdDevRecId = res.body.data.id || res.body.data._id;
    });

    it('should update development recommendation progress', async () => {
      const res = await request(app)
        .put(`/api/v1/ai/performance/recommendations/${createdDevRecId}`)
        .send({
          status: 'In Progress',
          completionProgress: 60,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.completionProgress).toBe(60);
    });
  });

  // ================= 4. CONVERSATIONAL HR & MULTI-TURN CHAT (RAG) =================
  describe('Conversational HR Assistant (/api/v1/ai/chat)', () => {
    it('should retrieve initial conversation history with welcome prompt', async () => {
      const res = await request(app)
        .get('/api/v1/ai/chat/conversation?conversationId=test-chat-thread');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.messages[0].sender).toBe('ai');
    });

    it('should answer maternity & paternity leave queries using official RAG citations', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/message')
        .send({
          message: 'Summarize our current statutory maternity and paternity leave policies',
          conversationId: 'test-chat-thread',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse.category).toBe('Leave');
      expect(res.body.data.aiResponse.text).toContain('26 weeks');
      expect(res.body.data.aiResponse.text).toContain('Source:');
      expect(Array.isArray(res.body.data.aiResponse.suggestedActions)).toBe(true);
      expect(res.body.data.aiResponse.suggestedActions.length).toBeGreaterThan(0);
    });

    it('should generate an institutional HR Leave Approval draft template', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/message')
        .send({
          message: 'Draft a professional leave approval email template for managers',
          conversationId: 'test-chat-thread',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse.isDraftTemplate).toBe(true);
      expect(res.body.data.aiResponse.text).toContain('Subject:');
      expect(res.body.data.aiResponse.text).toContain('[Employee Name]');
      expect(res.body.data.aiResponse.suggestedActions).toContain('Copy Template');
    });

    it('should explain annual bonus eligibility criteria accurately', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/message')
        .send({
          message: 'What are the performance bonus eligibility rules?',
          conversationId: 'test-chat-thread',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse.category).toBe('Payroll');
      expect(res.body.data.aiResponse.text).toContain('6 consecutive months');
      expect(res.body.data.aiResponse.text).toContain('4.0');
    });

    it('should generate an engineer onboarding checklist', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/message')
        .send({
          message: 'Generate a 5-step onboarding checklist for a new Senior Software Engineer',
          conversationId: 'test-chat-thread',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse.category).toBe('Onboarding');
      expect(res.body.data.aiResponse.isDraftTemplate).toBe(true);
      expect(res.body.data.aiResponse.text).toContain('Step 1');
      expect(res.body.data.aiResponse.text).toContain('GitHub Enterprise');
    });

    it('should provide working hours, attendance grace period, and hybrid work policy', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/message')
        .send({
          message: 'What are the official working hours and hybrid attendance policy?',
          conversationId: 'test-chat-thread',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse.text).toContain('09:30 AM');
      expect(res.body.data.aiResponse.text).toContain('15-minute grace period');
      expect(res.body.data.aiResponse.text.toLowerCase()).toContain('hybrid');
    });

    it('should retain multi-turn conversation context across sequential messages', async () => {
      const res = await request(app)
        .get('/api/v1/ai/chat/conversation?conversationId=test-chat-thread');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // We sent 5 messages, so thread should have 1 welcome + 5 user + 5 ai = 11 messages
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(11);
    });

    it('should clear conversation history cleanly', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/clear')
        .send({ conversationId: 'test-chat-thread' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messages.length).toBe(1);
      expect(res.body.data.messages[0].text).toContain('cleared');
    });
  });

  // ================= 5. EMPLOYEE EXPERIENCE (EX) & SENTIMENT =================
  describe('Employee Experience (EX) & Sentiment Radar (/api/v1/ai/ex)', () => {
    it('should retrieve employee sentiment pulse and key drivers', async () => {
      const res = await request(app)
        .get('/api/v1/ai/ex/sentiment');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sentimentScore');
      expect(res.body.data).toHaveProperty('sentimentRating');
      expect(res.body.data).toHaveProperty('engagementIndex');
      expect(Array.isArray(res.body.data.topDrivers)).toBe(true);
      expect(Array.isArray(res.body.data.keyRiskAreas)).toBe(true);
    });
  });

  // ================= 6. AUTOMATED COMPLIANCE & LIVE AUDIT SCAN =================
  describe('Automated Compliance & Audit Readiness (/api/v1/ai/compliance)', () => {
    it('should list statutory compliance records with default seeded regulations', async () => {
      const res = await request(app)
        .get('/api/v1/ai/compliance');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      const posh = res.body.data.find((c: any) => c.complianceCode === 'CMP-IND-03');
      expect(posh).toBeDefined();
      expect(posh.title).toContain('POSH');
    });

    it('should create a new borderless statutory compliance record', async () => {
      const res = await request(app)
        .post('/api/v1/ai/compliance')
        .send({
          complianceCode: 'CMP-UAE-01',
          title: 'UAE Labour Law & Wage Protection System (WPS)',
          category: 'Statutory',
          jurisdiction: 'United Arab Emirates',
          status: 'Compliant',
          auditScore: 98,
          discrepanciesCount: 0,
          nextDeadline: 'Monthly WPS Disbursal',
          description: 'Electronic payroll transfer verification under UAE Federal Decree-Law No. 33 of 2021',
          autoScanEnabled: true,
          affectedEmployeesCount: 28,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complianceCode).toBe('CMP-UAE-01');
      createdComplianceId = res.body.data.id || res.body.data._id;
    });

    it('should get compliance record by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/ai/compliance/${createdComplianceId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complianceCode).toBe('CMP-UAE-01');
    });

    it('should update compliance record', async () => {
      const res = await request(app)
        .put(`/api/v1/ai/compliance/${createdComplianceId}`)
        .send({
          status: 'Audit Ready',
          auditScore: 100,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Audit Ready');
      expect(res.body.data.auditScore).toBe(100);
    });

    it('should execute automated live compliance audit scan across employee registers', async () => {
      const res = await request(app)
        .post('/api/v1/ai/compliance/scan')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('scanTimestamp');
      expect(res.body.data).toHaveProperty('totalRecordsScanned');
      expect(res.body.data).toHaveProperty('auditReadinessScore');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.auditReadinessScore).toBeGreaterThanOrEqual(80);
    });

    it('should delete compliance record', async () => {
      const res = await request(app)
        .delete(`/api/v1/ai/compliance/${createdComplianceId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ================= 7. VALIDATION & ERROR HANDLING =================
  describe('Input Validation & Error Handling', () => {
    it('should return 400 Bad Request when sending chat message without message body', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/message')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 Not Found for non-existent flight risk ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/ai/workforce/flight-risks/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 Not Found for non-existent compliance record ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/ai/compliance/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ================= 8. SECURITY, RBAC & CROSS-USER ISOLATION =================
  describe('Security, RBAC & Cross-User Privacy Guardrails', () => {
    it('should reject non-admin/non-HR users (Employee role) from accessing flight-risk endpoints with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/ai/workforce/flight-risks')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'emp-101');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      const errMsg = res.body.error?.message || res.body.message || '';
      expect(errMsg).toContain('Forbidden');
    });

    it('should reject non-admin/non-HR users (Employee role) from running compliance scans with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/ai/compliance/scan')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'emp-101');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      const errMsg = res.body.error?.message || res.body.message || '';
      expect(errMsg).toContain('Forbidden');
    });

    it('should reject non-manager users (Employee role) from running predictive risk calculations with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/ai/workforce/predict-risk')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'emp-101')
        .send({ employeeId: 'EMP-001' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      const errMsg = res.body.error?.message || res.body.message || '';
      expect(errMsg).toContain('Forbidden');
    });

    it('should enforce cross-user conversation isolation: User B cannot read User A conversation (403 Forbidden)', async () => {
      const convId = `user-a-private-chat-${Date.now()}`;

      // User A initiates conversation
      const sendRes = await request(app)
        .post('/api/v1/ai/chat/message')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'user-alpha-99')
        .send({
          conversationId: convId,
          message: 'Confidential HR question about my appraisal',
        });

      expect(sendRes.status).toBe(200);

      // User B attempts to read User A's conversation
      const peekRes = await request(app)
        .get(`/api/v1/ai/chat/conversation?conversationId=${convId}`)
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'user-beta-88');

      expect(peekRes.status).toBe(403);
      expect(peekRes.body.success).toBe(false);
      const errMsg = peekRes.body.error?.message || peekRes.body.message || '';
      expect(errMsg).toContain('Access denied');
    });

    it('should enforce cross-user conversation isolation: User B cannot clear User A conversation (403 Forbidden)', async () => {
      const convId = `user-a-clear-test-${Date.now()}`;

      // User A initiates conversation
      await request(app)
        .post('/api/v1/ai/chat/message')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'user-alpha-99')
        .send({
          conversationId: convId,
          message: 'My private notes',
        });

      // User B attempts to clear User A's conversation
      const clearRes = await request(app)
        .post('/api/v1/ai/chat/clear')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'user-beta-88')
        .send({
          conversationId: convId,
        });

      expect(clearRes.status).toBe(403);
      expect(clearRes.body.success).toBe(false);
    });

    it('should allow System Admin to view any user conversation for audit purposes', async () => {
      const convId = `user-audit-chat-${Date.now()}`;

      // User A creates conversation
      await request(app)
        .post('/api/v1/ai/chat/message')
        .set('x-user-role', 'Employee')
        .set('x-user-id', 'user-employee-1')
        .send({
          conversationId: convId,
          message: 'Audit message from employee',
        });

      // Admin accesses the conversation
      const adminRes = await request(app)
        .get(`/api/v1/ai/chat/conversation?conversationId=${convId}`)
        .set('x-user-role', 'Admin')
        .set('x-user-id', 'admin-super');

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.success).toBe(true);
      expect(adminRes.body.data.conversationId).toBe(convId);
    });

    it('should authenticate requests using cryptographically signed Bearer token', async () => {
      const token = generateAIToken({
        userId: 'admin-sec-1',
        name: 'Chief Security Officer',
        role: 'Admin',
      });

      const res = await request(app)
        .get('/api/v1/ai/workforce/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('projectedTurnoverRate');
    });
  });
});
