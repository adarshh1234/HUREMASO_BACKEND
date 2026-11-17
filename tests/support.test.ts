import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import {
  SupportTicketModel,
  SupportMaintenanceModel,
  SupportHelpArticleModel,
  SupportContactRequestModel,
  SupportAgentModel,
} from '../src/modules/support/support.model';

let mongoServer: MongoMemoryServer | null = null;
const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/hr_module_support_test';

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (_e) {
    // Fallback to local MongoDB instance
    await mongoose.connect(TEST_DB_URI);
  }
  // Clear any existing test data
  await SupportTicketModel.deleteMany({});
  await SupportMaintenanceModel.deleteMany({});
  await SupportHelpArticleModel.deleteMany({});
  await SupportContactRequestModel.deleteMany({});
  await SupportAgentModel.deleteMany({});
});

afterAll(async () => {
  try {
    await SupportTicketModel.deleteMany({});
    await SupportMaintenanceModel.deleteMany({});
    await SupportHelpArticleModel.deleteMany({});
    await SupportContactRequestModel.deleteMany({});
    await SupportAgentModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      if (!mongoServer && mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
      }
      await mongoose.disconnect();
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});

describe('Support Module Complete Integration Tests (/api/v1/support)', () => {
  let createdTicketId: string;
  let createdTicketNumber: string;
  let workflowTicketId: string;
  let createdMaintId: string;
  let createdArticleId: string;
  let createdContactId: string;

  // ================= 1. EMPTY STATE & CLEAN ZERO-METRICS =================
  describe('1. Empty State & Clean Metrics Verification', () => {
    it('should return clean zero metrics on empty database', async () => {
      const res = await request(app).get('/api/v1/support/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTickets).toBe(0);
      expect(res.body.data.openTickets).toBe(0);
      expect(res.body.data.pendingTickets).toBe(0);
      expect(res.body.data.resolvedTickets).toBe(0);
      expect(res.body.data.closedTickets).toBe(0);
      expect(res.body.data.reopenedTickets).toBe(0);
      expect(res.body.data.unassignedTickets).toBe(0);
      expect(res.body.data.averageResponseTimeHours).toBe(0);
      expect(res.body.data.averageResolutionTimeHours).toBe(0);
      expect(res.body.data.slaAdherenceRate).toBe(100);
      expect(res.body.data.categoryBreakdown).toEqual([]);
      expect(res.body.data.priorityBreakdown).toEqual([]);
      expect(res.body.data.recentTickets).toEqual([]);
    });

    it('should return empty ticket list on empty database', async () => {
      const res = await request(app).get('/api/v1/support/tickets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return empty maintenance list on empty database', async () => {
      const res = await request(app).get('/api/v1/support/maintenance');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('should return empty help articles list on empty database', async () => {
      const res = await request(app).get('/api/v1/support/help');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('should return empty contact inquiries list on empty database', async () => {
      const res = await request(app).get('/api/v1/support/contact');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });

  // ================= 2. TICKET CREATION & VALIDATION =================
  describe('2. Support Ticket Creation & Validation', () => {
    it('should fail with 400 when subject is missing or empty', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: '',
        description: 'Need password reset for corporate account',
        requesterName: 'Sarah Joseph',
        requesterEmail: 'sarah.j@company.com',
      });
      expect(res.status).toBe(400);
    });

    it('should fail with 400 when description is shorter than 5 characters', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: 'Cannot login',
        description: 'Help',
        requesterName: 'Sarah Joseph',
        requesterEmail: 'sarah.j@company.com',
      });
      expect(res.status).toBe(400);
    });

    it('should fail with 400 when requester email is invalid', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: 'VPN Connection Failure',
        description: 'Unable to connect to staging cluster VPN gateway',
        requesterName: 'Sarah Joseph',
        requesterEmail: 'not-an-email',
      });
      expect(res.status).toBe(400);
    });

    it('should successfully create a new ticket with valid payload', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: 'Cannot access Google Workspace Admin Console',
        description: 'Received error 403 when trying to access user provision delegation.',
        requesterName: 'Sarah Joseph',
        requesterEmail: 'sarah.j@company.com',
        department: 'Marketing',
        category: 'Access / Permissions',
        priority: 'High',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketNumber).toMatch(/^#TCK-\d+$/);
      expect(res.body.data.status).toBe('Open');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.category).toBe('Access / Permissions');
      expect(res.body.data.slaDueAt).toBeDefined();
      expect(res.body.data.comments.length).toBe(1);
      expect(res.body.data.history.length).toBe(1);
      expect(res.body.data.history[0].action).toBe('CREATED');

      createdTicketId = res.body.data._id || res.body.data.id;
      createdTicketNumber = res.body.data.ticketNumber;
    });

    it('should prevent duplicate active ticket for same requester and subject', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: 'Cannot access Google Workspace Admin Console',
        description: 'Another identical request for access',
        requesterName: 'Sarah Joseph',
        requesterEmail: 'sarah.j@company.com',
        category: 'Access / Permissions',
        priority: 'High',
      });
      expect(res.status).toBe(409);
    });

    it('should create additional tickets for workflow and metrics testing', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: 'Request for Docker Enterprise license key renewal',
        description: 'Development cluster license expires in 5 days. Need PO signoff.',
        requesterName: 'Michael Torres',
        requesterEmail: 'michael.t@company.com',
        department: 'Engineering',
        category: 'Software',
        priority: 'Medium',
      });
      expect(res.status).toBe(201);
      workflowTicketId = res.body.data._id || res.body.data.id;
    });

    it('should create a third urgent ticket', async () => {
      const res = await request(app).post('/api/v1/support/tickets').send({
        subject: 'Main board room AV system audio feedback loop',
        description: 'Executive board meeting scheduled for today. Urgent AV fix needed.',
        requesterName: 'Aisha Patel',
        requesterEmail: 'aisha.p@company.com',
        department: 'Operations',
        category: 'Facilities',
        priority: 'Urgent',
      });
      expect(res.status).toBe(201);
    });
  });

  // ================= 3. TICKET RETRIEVAL & FILTERING =================
  describe('3. Ticket Retrieval & Filtering', () => {
    it('should list all tickets with pagination', async () => {
      const res = await request(app).get('/api/v1/support/tickets?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.pagination.total).toBe(3);
    });

    it('should retrieve individual ticket by MongoDB ObjectId', async () => {
      const res = await request(app).get(`/api/v1/support/tickets/${createdTicketId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketNumber).toBe(createdTicketNumber);
    });

    it('should retrieve individual ticket by #TCK-XXXX number', async () => {
      const res = await request(app).get(`/api/v1/support/tickets/${encodeURIComponent(createdTicketNumber)}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBe('Cannot access Google Workspace Admin Console');
    });

    it('should return 404 for non-existent ticket ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/support/tickets/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should search tickets by subject keyword', async () => {
      const res = await request(app).get('/api/v1/support/tickets?search=Docker');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].requesterName).toBe('Michael Torres');
    });

    it('should filter tickets by status', async () => {
      const res = await request(app).get('/api/v1/support/tickets?status=Open');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter tickets by priority', async () => {
      const res = await request(app).get('/api/v1/support/tickets?priority=Urgent');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].subject).toContain('AV system');
    });

    it('should filter tickets by category', async () => {
      const res = await request(app).get('/api/v1/support/tickets?category=Software');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter tickets by department', async () => {
      const res = await request(app).get('/api/v1/support/tickets?department=Marketing');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  // ================= 4. TICKET LIFECYCLE WORKFLOWS =================
  describe('4. Ticket Lifecycle Workflows (Assign, Notes, Comments, Resolve, Reopen)', () => {
    it('should assign a ticket to an agent and transition status to In Progress', async () => {
      const res = await request(app)
        .post(`/api/v1/support/tickets/${workflowTicketId}/assign`)
        .send({
          assignedAgent: 'Alex Morgan',
          assignedAgentEmail: 'alex.m@company.com',
          assignedBy: 'Lead Architect',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.assignedAgent).toBe('Alex Morgan');
      expect(res.body.data.status).toBe('In Progress');
    });

    it('should update ticket priority via PUT /tickets/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/support/tickets/${workflowTicketId}`)
        .send({ priority: 'High' });
      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('High');
    });

    it('should add a requester comment to the ticket', async () => {
      const res = await request(app)
        .post(`/api/v1/support/tickets/${workflowTicketId}/comments`)
        .send({
          author: 'Michael Torres',
          authorEmail: 'michael.t@company.com',
          role: 'Requester',
          text: 'Attached signed purchase PO-8924 for enterprise license.',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.comments.length).toBe(2);
    });

    it('should add a staff comment and record firstResponseAt', async () => {
      const res = await request(app)
        .post(`/api/v1/support/tickets/${workflowTicketId}/comments`)
        .send({
          author: 'Alex Morgan',
          authorEmail: 'alex.m@company.com',
          role: 'Support Agent',
          text: 'Applied new license key to staging cluster. Verifying production pipeline.',
          isStaff: true,
        });
      expect(res.status).toBe(200);
      expect(res.body.data.firstResponseAt).toBeDefined();
    });

    it('should add an internal note for support staff', async () => {
      const res = await request(app)
        .post(`/api/v1/support/tickets/${workflowTicketId}/internal-notes`)
        .send({
          author: 'David Vance',
          authorEmail: 'david.v@company.com',
          text: 'PO budget approved by VP Engineering. License key valid through 2028.',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.internalNotes.length).toBe(1);
    });

    it('should resolve a ticket and record resolvedAt and resolution details', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/tickets/${workflowTicketId}/status`)
        .send({
          status: 'Resolved',
          resolutionDetails: 'Enterprise license renewed and validated across all cluster nodes.',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Resolved');
      expect(res.body.data.resolvedAt).toBeDefined();
      expect(res.body.data.resolutionDetails).toContain('Enterprise license renewed');
    });

    it('should reopen a resolved ticket when necessary', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/tickets/${workflowTicketId}/status`)
        .send({
          status: 'Reopened',
          notes: 'Node 4 in worker pool reporting license checksum mismatch.',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Reopened');
      expect(res.body.data.reopenedAt).toBeDefined();
    });

    it('should retrieve chronological activity history of ticket', async () => {
      const res = await request(app).get(`/api/v1/support/tickets/${workflowTicketId}/history`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      const actions = res.body.data.map((h: any) => h.action);
      expect(actions).toContain('CREATED');
      expect(actions).toContain('ASSIGNED');
      expect(actions).toContain('RESOLVED');
      expect(actions).toContain('REOPENED');
    });

    it('should re-resolve and close a ticket recording closedAt', async () => {
      await request(app)
        .patch(`/api/v1/support/tickets/${workflowTicketId}/status`)
        .send({ status: 'Resolved', resolutionDetails: 'Worker node re-registered.' });

      const res = await request(app)
        .patch(`/api/v1/support/tickets/${workflowTicketId}/status`)
        .send({ status: 'Closed' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Closed');
      expect(res.body.data.closedAt).toBeDefined();
    });
  });

  // ================= 5. DYNAMIC DASHBOARD METRICS =================
  describe('5. Real Dynamic Dashboard Metrics', () => {
    it('should return accurate computed metrics from MongoDB records', async () => {
      const res = await request(app).get('/api/v1/support/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalTickets).toBe(3);
      expect(res.body.data.openTickets).toBe(2); // 2 Open tickets
      expect(res.body.data.closedTickets).toBe(1); // 1 Closed ticket
      expect(res.body.data.unassignedTickets).toBe(2); // 2 Unassigned tickets
      expect(res.body.data.averageResponseTimeHours).toBeGreaterThanOrEqual(0);
      expect(res.body.data.averageResolutionTimeHours).toBeGreaterThanOrEqual(0);
      expect(res.body.data.slaAdherenceRate).toBeGreaterThan(0);
      expect(res.body.data.categoryBreakdown.length).toBeGreaterThan(0);
      expect(res.body.data.priorityBreakdown.length).toBeGreaterThan(0);
      expect(res.body.data.recentTickets.length).toBe(3);
    });
  });

  // ================= 6. SYSTEM MAINTENANCE =================
  describe('6. System Maintenance & Issue Reporting Integration', () => {
    it('should create a maintenance issue and automatically generate a linked support ticket', async () => {
      const res = await request(app).post('/api/v1/support/maintenance').send({
        system: 'Primary Cloud Infrastructure (US-East)',
        title: 'Scheduled Database Index Rebuild',
        description: 'Quarterly optimization of high-throughput indices.',
        category: 'Infrastructure',
        priority: 'High',
        requestedBy: 'Cloud Ops Team',
        requestedByEmail: 'cloud-ops@company.com',
        targetUptime: '99.98%',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.system).toBe('Primary Cloud Infrastructure (US-East)');
      createdMaintId = res.body.data._id || res.body.data.id;

      // Verify that a linked support ticket was automatically generated
      const ticketRes = await request(app).get('/api/v1/support/tickets?search=Database Index Rebuild');
      expect(ticketRes.status).toBe(200);
      expect(ticketRes.body.data.length).toBe(1);
      expect(ticketRes.body.data[0].linkedMaintenanceId).toBe(createdMaintId);
    });

    it('should list maintenance items with pagination', async () => {
      const res = await request(app).get('/api/v1/support/maintenance');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should retrieve single maintenance record by ID', async () => {
      const res = await request(app).get(`/api/v1/support/maintenance/${createdMaintId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.system).toBe('Primary Cloud Infrastructure (US-East)');
    });

    it('should update maintenance request status', async () => {
      const res = await request(app)
        .put(`/api/v1/support/maintenance/${createdMaintId}`)
        .send({ status: 'In Progress', resolutionNotes: 'Index rebuild started at 02:00 UTC' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('In Progress');
    });
  });

  // ================= 7. KNOWLEDGE BASE & HELPFUL VOTING =================
  describe('7. Knowledge Base / Help Articles & Helpful Voting', () => {
    it('should create a new knowledge base article', async () => {
      const res = await request(app).post('/api/v1/support/help').send({
        title: 'MFA Device Reset Procedure',
        category: 'IT & Access',
        question: 'How do I reset my multi-factor authentication (MFA) device?',
        answer: 'Navigate to your Employee Profile > Security Settings, or submit an Access/Permissions ticket.',
        tags: ['mfa', 'security', 'okta', 'auth'],
      });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('MFA Device Reset Procedure');
      expect(res.body.data.helpfulVotes).toBe(0);
      createdArticleId = res.body.data._id || res.body.data.id;
    });

    it('should list help articles with category filter and search', async () => {
      const res = await request(app).get('/api/v1/support/help?category=IT %26 Access&search=mfa');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('MFA Device Reset Procedure');
    });

    it('should retrieve help article by ID and increment view count', async () => {
      const res = await request(app).get(`/api/v1/support/help/${createdArticleId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.viewCount).toBe(1);
    });

    it('should vote article as helpful', async () => {
      const res = await request(app)
        .post(`/api/v1/support/help/${createdArticleId}/vote`)
        .send({ isHelpful: true });
      expect(res.status).toBe(200);
      expect(res.body.data.helpfulVotes).toBe(1);
    });

    it('should vote article as unhelpful', async () => {
      const res = await request(app)
        .post(`/api/v1/support/help/${createdArticleId}/vote`)
        .send({ isHelpful: false });
      expect(res.status).toBe(200);
      expect(res.body.data.unhelpfulVotes).toBe(1);
    });

    it('should update help article content', async () => {
      const res = await request(app)
        .put(`/api/v1/support/help/${createdArticleId}`)
        .send({ answer: 'Updated MFA guide with Okta Verify biometric instructions.' });
      expect(res.status).toBe(200);
      expect(res.body.data.answer).toContain('Okta Verify');
    });
  });

  // ================= 8. SUPPORT AGENTS & WORKLOAD =================
  describe('8. Support Agents Directory & Dynamic Workload', () => {
    it('should list support agents with dynamic assigned ticket workload', async () => {
      const res = await request(app).get('/api/v1/support/agents');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      // Verify that agents have dynamic workload properties
      const alex = res.body.data.find((a: any) => a.name === 'Alex Morgan');
      expect(alex).toBeDefined();
      expect(typeof alex.assignedTicketCount).toBe('number');
      expect(typeof alex.resolvedTicketCount).toBe('number');
    });

    it('should create a custom support agent', async () => {
      const res = await request(app).post('/api/v1/support/agents').send({
        name: 'Sophia Chang',
        role: 'Network Operations Specialist',
        department: 'Infrastructure',
        email: 'sophia.c@company.com',
        phone: '+1 (555) 019-9988',
        status: 'Online',
        specialties: 'Cisco, SD-WAN, Subnets, DNS',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Sophia Chang');
    });

    it('should prevent duplicate agent email', async () => {
      const res = await request(app).post('/api/v1/support/agents').send({
        name: 'Sophia Chang Duplicate',
        role: 'Network Tech',
        department: 'Infrastructure',
        email: 'sophia.c@company.com',
      });
      expect(res.status).toBe(409);
    });
  });

  // ================= 9. CONTACT SUPPORT INQUIRIES =================
  describe('9. Contact Support Inquiries', () => {
    it('should submit a contact inquiry', async () => {
      const res = await request(app).post('/api/v1/support/contact').send({
        requesterName: 'Jonathan Bell',
        requesterEmail: 'jonathan.b@company.com',
        phone: '+1 (555) 019-7788',
        targetAgent: 'David Vance',
        subject: 'Inquiry regarding SSO migration timeline',
        message: 'When will the marketing department be switched over to the new identity provider?',
        priority: 'Medium',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.subject).toContain('SSO migration');
      expect(res.body.data.status).toBe('New');
      createdContactId = res.body.data._id || res.body.data.id;
    });

    it('should list contact inquiries', async () => {
      const res = await request(app).get('/api/v1/support/contact');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should update inquiry status to Replied with response message', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/contact/${createdContactId}/status`)
        .send({
          status: 'Replied',
          responseMessage: 'Marketing squad is scheduled for Phase 2 SSO migration on August 15.',
          respondedBy: 'David Vance',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Replied');
      expect(res.body.data.respondedAt).toBeDefined();
    });

    it('should delete contact inquiry', async () => {
      const res = await request(app).delete(`/api/v1/support/contact/${createdContactId}`);
      expect(res.status).toBe(200);
    });
  });

  // ================= 10. RECORD DELETION =================
  describe('10. Record Deletion & Cleanup', () => {
    it('should delete support ticket cleanly via DELETE /tickets/:id', async () => {
      const res = await request(app).delete(`/api/v1/support/tickets/${createdTicketId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting a non-existent ticket', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/support/tickets/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should delete maintenance record cleanly', async () => {
      const res = await request(app).delete(`/api/v1/support/maintenance/${createdMaintId}`);
      expect(res.status).toBe(200);
    });

    it('should delete help article cleanly', async () => {
      const res = await request(app).delete(`/api/v1/support/help/${createdArticleId}`);
      expect(res.status).toBe(200);
    });
  });
});
