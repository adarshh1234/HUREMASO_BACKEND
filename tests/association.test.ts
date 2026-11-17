import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { AssociationModel } from '../src/modules/association/association.model';

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

describe('Monitoring Inhouse Assets / Association Module Integration Tests', () => {
  let createdRequestId: string;
  let createdRequestCode: string;
  let workflowRequestId: string;
  let existingAssociationId: string;

  beforeEach(async () => {
    // Keep clean state before tests if needed, or let test suites build state progressively
  });

  // ================= 1. EMPTY STATE VERIFICATION =================
  describe('1. Empty State & Initialization', () => {
    it('should return empty requests list when database contains no records', async () => {
      await AssociationModel.deleteMany({});
      const res = await request(app).get('/api/v1/association/requests');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return empty existing associations when database contains no records', async () => {
      const res = await request(app).get('/api/v1/association/existing');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return zero overview stats when no records exist', async () => {
      const res = await request(app).get('/api/v1/association/overview');

      expect(res.status).toBe(200);
      expect(res.body.data.totalRequests).toBe(0);
      expect(res.body.data.pendingRequests).toBe(0);
      expect(res.body.data.activeExisting).toBe(0);
    });
  });

  // ================= 2. REQUEST CREATION & VALIDATION =================
  describe('2. Request Creation & Field Validation', () => {
    it('should create a new association request with all valid fields', async () => {
      const payload = {
        employeeName: 'Elena Rostova',
        employeeId: 'EMP-2041',
        requesterEmail: 'elena.r@company.com',
        department: 'Product Design',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Brand & Creative Guild',
        associationType: 'Resource Sharing',
        durationMonths: 6,
        requestDetails: 'Cross-functional UI/UX resource sharing for the upcoming global rebrand campaign.',
        attachments: ['design-system-spec-v2'],
      };

      const res = await request(app)
        .post('/api/v1/association/requests')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.employeeName).toBe('Elena Rostova');
      expect(res.body.data.name).toBe('Elena Rostova');
      expect(res.body.data.department).toBe('Product Design');
      expect(res.body.data.targetDepartment).toBe('Marketing Department');
      expect(res.body.data.associationType).toBe('Resource Sharing');
      expect(res.body.data.status).toBe('Pending');
      expect(res.body.data.isExisting).toBe(false);
      expect(res.body.data.associationCode).toBeDefined();
      expect(res.body.data.history.length).toBe(1);
      expect(res.body.data.history[0].action).toBe('Association Request Submitted');

      createdRequestId = res.body.data.id || res.body.data._id;
      createdRequestCode = res.body.data.associationCode;
    });

    it('should create request using frontend alias fields (name, text, date)', async () => {
      const res = await request(app)
        .post('/api/v1/association/requests')
        .send({
          name: 'James Wilson',
          department: 'Engineering',
          targetDepartment: 'Data Science Division',
          associatedEntity: 'AI ML Core Group',
          text: 'Requesting access to data models and GPU clusters for analytics feature dev.',
          associationType: 'Project Collaboration',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.employeeName).toBe('James Wilson');
      expect(res.body.data.name).toBe('James Wilson');
      expect(res.body.data.requestDetails).toContain('GPU clusters');
      expect(res.body.data.status).toBe('Pending');

      workflowRequestId = res.body.data.id || res.body.data._id;
    });

    it('should fail validation when employee name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/association/requests')
        .send({
          requestDetails: 'Missing employee name',
        });

      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toBeDefined();
    });

    it('should fail validation when request details is shorter than 3 characters', async () => {
      const res = await request(app)
        .post('/api/v1/association/requests')
        .send({
          employeeName: 'Arthur Dent',
          requestDetails: 'No',
        });

      expect(res.status).toBe(400);
    });

    it('should prevent duplicate pending association requests for the same employee & target department', async () => {
      const duplicatePayload = {
        employeeName: 'Elena Rostova',
        targetDepartment: 'Marketing Department',
        requestDetails: 'Attempting to submit second identical pending request.',
      };

      const res = await request(app)
        .post('/api/v1/association/requests')
        .send(duplicatePayload);

      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toContain('already exists');
    });
  });

  // ================= 3. RETRIEVAL & FILTERING =================
  describe('3. Request Retrieval & Filtering', () => {
    it('should list all pending association requests', async () => {
      const res = await request(app).get('/api/v1/association/requests');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('should retrieve a single request by MongoDB ID', async () => {
      const res = await request(app).get(`/api/v1/association/requests/${createdRequestId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employeeName).toBe('Elena Rostova');
    });

    it('should retrieve a single request by custom associationCode', async () => {
      const res = await request(app).get(`/api/v1/association/requests/${encodeURIComponent(createdRequestCode)}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employeeName).toBe('Elena Rostova');
    });

    it('should return 404 for a non-existent request ID', async () => {
      const res = await request(app).get('/api/v1/association/requests/NON_EXISTENT_ID');

      expect(res.status).toBe(404);
    });

    it('should search requests by text keyword', async () => {
      const res = await request(app).get('/api/v1/association/requests?search=rebrand campaign');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].employeeName).toBe('Elena Rostova');
    });

    it('should filter requests by department', async () => {
      const res = await request(app).get('/api/v1/association/requests?department=Engineering');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].department).toBe('Engineering');
    });

    it('should filter requests by associationType', async () => {
      const res = await request(app).get('/api/v1/association/requests?associationType=Resource Sharing');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].associationType).toBe('Resource Sharing');
    });
  });

  // ================= 4. APPROVAL & REJECTION WORKFLOWS =================
  describe('4. Approval & Rejection Workflows', () => {
    it('should reject a request with rejection reason', async () => {
      const res = await request(app)
        .patch(`/api/v1/association/requests/${createdRequestId}/reject`)
        .send({
          performedBy: 'Lead Designer',
          rejectionReason: 'Capacity constraints in Q3 branding sprint.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Rejected');
      expect(res.body.data.isExisting).toBe(false);
      expect(res.body.data.approvalDetails.rejectionReason).toBe('Capacity constraints in Q3 branding sprint.');
      expect(res.body.data.history.length).toBe(2);
      expect(res.body.data.history[1].action).toBe('Request Rejected / Cancelled');
    });

    it('should approve a request and transition it to Active under Existing associations', async () => {
      const res = await request(app)
        .patch(`/api/v1/association/requests/${workflowRequestId}/approve`)
        .send({
          performedBy: 'Head of Engineering',
          notes: 'Approved for joint GPU analytics deployment.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Active');
      expect(res.body.data.isExisting).toBe(true);
      expect(res.body.data.effectiveDate).toBeDefined();
      expect(res.body.data.approvalDetails.approvedBy).toBe('Head of Engineering');
      expect(res.body.data.history.length).toBe(2);
      expect(res.body.data.history[1].action).toBe('Request Approved & Association Activated');

      existingAssociationId = res.body.data.id || res.body.data._id;
    });

    it('should verify approved request now appears under Existing associations', async () => {
      const res = await request(app).get('/api/v1/association/existing');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.find((item: any) => item.employeeName === 'James Wilson');
      expect(found).toBeDefined();
      expect(found.status).toBe('Active');
      expect(found.isExisting).toBe(true);
    });

    it('should verify rejected request does not appear under Existing associations', async () => {
      const res = await request(app).get('/api/v1/association/existing');

      expect(res.status).toBe(200);
      const rejectedFound = res.body.data.find((item: any) => item.employeeName === 'Elena Rostova');
      expect(rejectedFound).toBeUndefined();
    });
  });

  // ================= 5. EXISTING ASSOCIATION MANAGEMENT =================
  describe('5. Existing Association Management (Inspect, Edit, Renew, Deactivate)', () => {
    it('should inspect an individual existing association by ID', async () => {
      const res = await request(app).get(`/api/v1/association/existing/${existingAssociationId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employeeName).toBe('James Wilson');
      expect(res.body.data.isExisting).toBe(true);
    });

    it('should edit association details via PUT /existing/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/association/existing/${existingAssociationId}`)
        .send({
          notes: 'Updated scope: includes real-time telemetry streaming pipelines.',
          associatedEntity: 'Enterprise AI Lab',
          performedBy: 'Lead Architect',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toContain('telemetry streaming');
      expect(res.body.data.associatedEntity).toBe('Enterprise AI Lab');
      expect(res.body.data.history.length).toBe(3);
    });

    it('should renew and extend an association via PATCH /existing/:id/renew', async () => {
      const res = await request(app)
        .patch(`/api/v1/association/existing/${existingAssociationId}/renew`)
        .send({
          durationMonths: 12,
          notes: 'Extended for ongoing FY27 strategic joint initiative.',
          performedBy: 'VP Operations',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Active');
      expect(res.body.data.durationMonths).toBe(12);
      expect(res.body.data.history.length).toBe(4);
      expect(res.body.data.history[3].action).toBe('Association Renewed & Extended');
    });

    it('should cancel and deactivate an existing association via PATCH /existing/:id/deactivate', async () => {
      const res = await request(app)
        .patch(`/api/v1/association/existing/${existingAssociationId}/deactivate`)
        .send({
          reason: 'Project collaboration successfully completed and closed.',
          performedBy: 'Project Manager',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Inactive');
      expect(res.body.data.isExisting).toBe(false);
      expect(res.body.data.history.length).toBe(5);
      expect(res.body.data.history[4].action).toBe('Association Cancelled / Deactivated');
    });

    it('should verify deactivated association no longer appears in active existing list', async () => {
      const res = await request(app).get('/api/v1/association/existing');

      expect(res.status).toBe(200);
      const found = res.body.data.find((item: any) => item.id === existingAssociationId);
      expect(found).toBeUndefined();
    });
  });

  // ================= 6. DELETION & CLEANUP =================
  describe('6. Association Record Deletion', () => {
    it('should delete association record cleanly via DELETE /:id', async () => {
      const res = await request(app).delete(`/api/v1/association/${existingAssociationId}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app).get(`/api/v1/association/${existingAssociationId}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent association', async () => {
      const res = await request(app).delete('/api/v1/association/NON_EXISTENT_ID');

      expect(res.status).toBe(404);
    });
  });
});
