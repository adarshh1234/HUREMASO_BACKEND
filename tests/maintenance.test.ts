import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { MaintenanceTicketModel, HuremasoMaintenanceLogModel, SystemDiagnosticModel } from '../src/modules/maintenance/maintenance.model';

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

describe('Maintenance Module Integration Tests (/api/v1/maintenance)', () => {
  let createdTicketId: string;
  let createdTicketNumber: string;
  let workflowTicketId: string;
  let createdScheduleId: string;
  let diagnosticId: string;

  // ================= 1. EMPTY STATE & INITIALIZATION =================
  describe('1. Empty State & Zero-Record Verification', () => {
    it('should return empty ticket list when database contains no tickets', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return empty maintenance schedules list when database contains no schedules', async () => {
      const res = await request(app).get('/api/v1/maintenance/huremaso/logs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  // ================= 2. ACTIVE SUPPORT TICKET CREATION & VALIDATION =================
  describe('2. Active Support Ticket Creation & Validation', () => {
    it('should fail with 400 when title is missing or empty', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/tickets')
        .send({
          title: '',
          description: 'Valid issue description describing system failure',
        });
      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toBeDefined();
    });

    it('should fail with 400 when description is shorter than 5 characters', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/tickets')
        .send({
          title: 'Database connection issue',
          description: 'Fail',
        });
      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toBeDefined();
    });

    it('should create a new support ticket with all valid fields', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/tickets')
        .send({
          title: 'Not able to add new candidates',
          description: 'System error when attempting to add new candidate profiles. Error occurs during the submission process.',
          priority: 'High',
          category: 'System Error',
          requesterName: 'Sarah Joseph',
          requesterEmail: 'sarah.j@company.com',
          department: 'Recruitment',
          assignedAgent: 'Unassigned',
          tags: ['recruitment', 'candidate-form'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('Not able to add new candidates');
      expect(res.body.data.status).toBe('Open');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.category).toBe('System Error');
      expect(res.body.data.ticketNumber).toBeDefined();
      expect(res.body.data.history.length).toBe(1);
      expect(res.body.data.history[0].action).toBe('Ticket Created');
      expect(res.body.data.comments.length).toBe(1);

      createdTicketId = res.body.data.id || res.body.data._id;
      createdTicketNumber = res.body.data.ticketNumber;
    });

    it('should prevent duplicate open ticket submission with identical title for the same employee', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/tickets')
        .send({
          title: 'Not able to add new candidates',
          description: 'Attempting to open duplicate ticket with same title for Sarah Joseph',
          requesterName: 'Sarah Joseph',
        });

      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toContain('already open');
    });

    it('should create a second ticket for workflow lifecycle testing', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/tickets')
        .send({
          title: 'Candidate profile synchronization latency',
          description: 'Replication lag observed across read replicas in EU cluster during peak hours.',
          priority: 'Medium',
          category: 'Database',
          requesterName: 'Michael Torres',
          requesterEmail: 'michael.t@company.com',
          department: 'Engineering',
        });

      expect(res.status).toBe(201);
      workflowTicketId = res.body.data.id || res.body.data._id;
    });
  });

  // ================= 3. TICKET RETRIEVAL & FILTERING =================
  describe('3. Ticket Retrieval & Filtering', () => {
    it('should list all support tickets with pagination', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('should retrieve an individual ticket by MongoDB ID', async () => {
      const res = await request(app).get(`/api/v1/maintenance/tickets/${createdTicketId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Not able to add new candidates');
    });

    it('should retrieve an individual ticket by custom ticketNumber (#MTK-XXXX)', async () => {
      const res = await request(app).get(`/api/v1/maintenance/tickets/${encodeURIComponent(createdTicketNumber)}`);
      expect(res.status).toBe(200);
      expect(res.body.data.ticketNumber).toBe(createdTicketNumber);
    });

    it('should return 404 for a non-existent ticket ID', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets/NON_EXISTENT_ID');
      expect(res.status).toBe(404);
    });

    it('should search tickets by keyword', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets?search=synchronization latency');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Candidate profile');
    });

    it('should filter tickets by status', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets?status=Open');
      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.status === 'Open')).toBe(true);
    });

    it('should filter tickets by priority', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets?priority=High');
      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.priority === 'High')).toBe(true);
    });

    it('should filter tickets by category', async () => {
      const res = await request(app).get('/api/v1/maintenance/tickets?category=Database');
      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.category === 'Database')).toBe(true);
    });
  });

  // ================= 4. TICKET LIFECYCLE WORKFLOWS =================
  describe('4. Ticket Lifecycle Workflows (Assign, Priority, Comments, Resolve, Reopen)', () => {
    it('should assign a ticket to an agent and transition status to In Progress', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/tickets/${workflowTicketId}/assign`)
        .send({
          assignedAgent: 'Alex Morgan (DevOps)',
          assignedAgentId: 'EMP-9921',
          performedBy: 'Lead Infrastructure Engineer',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedAgent).toBe('Alex Morgan (DevOps)');
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.history.length).toBeGreaterThanOrEqual(2);
    });

    it('should update ticket priority via PUT /tickets/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/maintenance/tickets/${workflowTicketId}`)
        .send({
          priority: 'Critical',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('Critical');
    });

    it('should add a comment to the support ticket', async () => {
      const res = await request(app)
        .post(`/api/v1/maintenance/tickets/${workflowTicketId}/comments`)
        .send({
          author: 'Alex Morgan',
          authorEmail: 'alex.m@company.com',
          role: 'Support Agent',
          text: 'Investigating replica lag. Index rebuild scheduled during low-traffic window.',
          isStaff: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.comments.length).toBeGreaterThanOrEqual(2);
      const lastComment = res.body.data.comments[res.body.data.comments.length - 1];
      expect(lastComment.text).toContain('Investigating replica lag');
    });

    it('should resolve a ticket and record resolvedDate and resolution details', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/tickets/${workflowTicketId}/status`)
        .send({
          status: 'Resolved',
          resolutionNotes: 'Replication lag cleared after index optimization. Verified query latency < 5ms.',
          performedBy: 'Alex Morgan',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Resolved');
      expect(res.body.data.resolvedDate).toBeDefined();
      expect(res.body.data.resolutionDetails).toContain('Replication lag cleared');
    });

    it('should reopen a resolved ticket when necessary', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/tickets/${workflowTicketId}/status`)
        .send({
          status: 'Reopened',
          resolutionNotes: 'Intermittent spike resurfaced during evening batch processing.',
          performedBy: 'Michael Torres',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Reopened');
      expect(res.body.data.resolvedDate).toBeFalsy();
    });

    it('should retrieve full chronological activity history of ticket', async () => {
      const res = await request(app).get(`/api/v1/maintenance/tickets/${workflowTicketId}/history`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });

    it('should close a ticket and record closedDate', async () => {
      const res = await request(app)
        .patch(`/api/v1/maintenance/tickets/${workflowTicketId}/status`)
        .send({
          status: 'Closed',
          resolutionNotes: 'Closed after confirmation from requester.',
          performedBy: 'Lead Infrastructure Engineer',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Closed');
      expect(res.body.data.closedDate).toBeDefined();
    });
  });

  // ================= 5. HUREMASO INFRASTRUCTURE TELEMETRY & DIAGNOSTICS =================
  describe('5. Huremaso Infrastructure Telemetry & Diagnostics', () => {
    it('should retrieve real infrastructure overview telemetry', async () => {
      const res = await request(app).get('/api/v1/maintenance/huremaso');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.systemHealth).toBeDefined();
      expect(res.body.data.systemHealth.systemName).toBe('Huremaso Cloud Infrastructure');
      expect(res.body.data.systemHealth.activeNodesCount).toBe(1); // Genuine single server node
      expect(res.body.data.serverDetails).toBeDefined();
      expect(res.body.data.serverDetails.status).toBe('Healthy');
      expect(res.body.data.databaseDetails).toBeDefined();
      expect(res.body.data.databaseDetails.status).toBe('Connected');
      expect(res.body.data.cacheDetails).toBeDefined();
      expect(res.body.data.cacheDetails.status).toBe('Not Configured'); // Accurately reports unconfigured cache
    });

    it('should retrieve server health directly via /huremaso/health/server', async () => {
      const res = await request(app).get('/api/v1/maintenance/huremaso/health/server');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Healthy');
      expect(res.body.data.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(res.body.data.memoryUsageMb).toBeGreaterThan(0);
      expect(res.body.data.activeNodes).toBe(1);
    });

    it('should retrieve database health directly via /huremaso/health/database', async () => {
      const res = await request(app).get('/api/v1/maintenance/huremaso/health/database');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Connected');
      expect(res.body.data.pingLatencyMs).toBeGreaterThanOrEqual(0);
      expect(res.body.data.integrityStatus).toBe('Optimal');
    });

    it('should retrieve cache health directly via /huremaso/health/cache', async () => {
      const res = await request(app).get('/api/v1/maintenance/huremaso/health/cache');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Not Configured');
      expect(res.body.data.redisConfigured).toBe(false);
    });

    it('should execute non-destructive system diagnostics and generate a diagnostic report', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/huremaso/diagnostics')
        .send({ performedBy: 'DevOps Lead' });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.diagnosticId).toBeDefined();
      expect(res.body.data.overallStatus).toBe('Healthy');
      expect(res.body.data.isReadonly).toBe(true);
      expect(res.body.data.serverHealth.status).toBe('Healthy');
      expect(res.body.data.databaseHealth.status).toBe('Connected');
      expect(res.body.data.cacheHealth.status).toBe('Not Configured');
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);

      diagnosticId = res.body.data.diagnosticId;
    });

    it('should retrieve diagnostic history via /huremaso/diagnostics/history', async () => {
      const res = await request(app).get('/api/v1/maintenance/huremaso/diagnostics/history');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve individual diagnostic report by ID', async () => {
      const res = await request(app).get(`/api/v1/maintenance/huremaso/diagnostics/${diagnosticId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.diagnosticId).toBe(diagnosticId);
      expect(res.body.data.overallStatus).toBe('Healthy');
    });
  });

  // ================= 6. SCHEDULED MAINTENANCE LOGS =================
  describe('6. Scheduled Maintenance Logs (Create, Conflict Check, Update, Status, Cancel)', () => {
    it('should fail with 400 when schedule title or date is missing', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/huremaso/logs')
        .send({
          description: 'Missing title and date',
        });
      expect(res.status).toBe(400);
    });

    it('should schedule a new maintenance activity', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/huremaso/logs')
        .send({
          title: 'Database Index Rebuild & Vacuuming',
          description: 'Quarterly optimization of high-write collection indices and disk defragmentation.',
          category: 'Database',
          scheduledDate: '2026-11-20',
          scheduledTime: '02:00 AM',
          duration: '15 mins',
          priority: 'High',
          affectedServices: ['Huremaso Core DB', 'Analytics Cluster'],
          responsibleAdmin: 'Lead Database Architect',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Database Index Rebuild & Vacuuming');
      expect(res.body.data.status).toBe('Scheduled');
      expect(res.body.data.executionHistory.length).toBe(1);

      createdScheduleId = res.body.data.id || res.body.data._id;
    });

    it('should prevent conflicting maintenance schedules for the exact same date and time window', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance/huremaso/logs')
        .send({
          title: 'Conflicting Security Patch Deployment',
          scheduledDate: '2026-11-20',
          scheduledTime: '02:00 AM',
        });

      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toContain('already scheduled');
    });

    it('should update scheduled maintenance details via PUT /huremaso/logs/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/maintenance/huremaso/logs/${createdScheduleId}`)
        .send({
          duration: '20 mins',
          notes: 'Extended window to cover full index rebuild on historical audit logs.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.duration).toBe('20 mins');
      expect(res.body.data.executionHistory.length).toBe(2);
    });

    it('should update maintenance status to In Progress and Completed', async () => {
      const inProgressRes = await request(app)
        .patch(`/api/v1/maintenance/huremaso/logs/${createdScheduleId}/status`)
        .send({
          status: 'In Progress',
          notes: 'Maintenance window started.',
        });
      expect(inProgressRes.status).toBe(200);
      expect(inProgressRes.body.data.status).toBe('In Progress');

      const completedRes = await request(app)
        .patch(`/api/v1/maintenance/huremaso/logs/${createdScheduleId}/status`)
        .send({
          status: 'Completed',
          notes: 'Index rebuild completed successfully across all collections. Fragmentations = 0.',
        });
      expect(completedRes.status).toBe(200);
      expect(completedRes.body.data.status).toBe('Completed');
      expect(completedRes.body.data.resolutionNotes).toContain('Fragmentations = 0');
    });

    it('should schedule another maintenance and cancel it with a recorded reason', async () => {
      const createRes = await request(app)
        .post('/api/v1/maintenance/huremaso/logs')
        .send({
          title: 'SSL Certificate Early Rotation',
          scheduledDate: '2026-12-01',
          scheduledTime: '04:00 AM',
          duration: '10 mins',
        });
      expect(createRes.status).toBe(201);
      const cancelId = createRes.body.data.id || createRes.body.data._id;

      const cancelRes = await request(app)
        .patch(`/api/v1/maintenance/huremaso/logs/${cancelId}/cancel`)
        .send({
          reason: 'Certificate issuer auto-renewed wildcard SAN; manual maintenance no longer required.',
          performedBy: 'SecOps Team',
        });
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('Cancelled');
      expect(cancelRes.body.data.executionHistory.some((e: any) => e.notes.includes('auto-renewed'))).toBe(true);
    });

    it('should also support aliases under /api/v1/maintenance/schedules', async () => {
      const res = await request(app).get('/api/v1/maintenance/schedules');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ================= 7. RECORD DELETION & CLEANUP =================
  describe('7. Maintenance Record Deletion', () => {
    it('should delete a support ticket cleanly via DELETE /tickets/:id', async () => {
      const res = await request(app).delete(`/api/v1/maintenance/tickets/${createdTicketId}`);
      expect(res.status).toBe(200);

      const checkRes = await request(app).get(`/api/v1/maintenance/tickets/${createdTicketId}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent ticket', async () => {
      const res = await request(app).delete('/api/v1/maintenance/tickets/NON_EXISTENT_ID');
      expect(res.status).toBe(404);
    });

    it('should delete a maintenance schedule cleanly via DELETE /huremaso/logs/:id', async () => {
      const res = await request(app).delete(`/api/v1/maintenance/huremaso/logs/${createdScheduleId}`);
      expect(res.status).toBe(200);

      const checkRes = await request(app).get(`/api/v1/maintenance/huremaso/logs/${createdScheduleId}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent maintenance log', async () => {
      const res = await request(app).delete('/api/v1/maintenance/huremaso/logs/NON_EXISTENT_ID');
      expect(res.status).toBe(404);
    });
  });
});