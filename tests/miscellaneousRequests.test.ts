import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';

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

describe('Miscellaneous Requests API Tests (/api/v1/support/miscellaneous & /api/v1/miscellaneous-requests)', () => {
  let createdReqId: string;
  let customReqId: string;
  let workflowReqId: string;

  // ================= 1. CREATE REQUEST =================
  describe('POST /api/v1/support/miscellaneous', () => {
    it('should create a miscellaneous request with all required fields', async () => {
      const payload = {
        employee: 'Alex Morgan',
        email: 'alex.m@company.com',
        department: 'Engineering',
        requestType: 'Office Equipment',
        description: 'Need an ergonomic standing desk converter and anti-fatigue mat.',
        priority: 'High',
        status: 'Pending',
        date: '2026-09-22',
        createdBy: 'Alex Morgan',
      };

      const res = await request(app)
        .post('/api/v1/support/miscellaneous')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.employee).toBe('Alex Morgan');
      expect(res.body.data.name).toBe('Alex Morgan');
      expect(res.body.data.department).toBe('Engineering');
      expect(res.body.data.requestType).toBe('Office Equipment');
      expect(res.body.data.description).toBe('Need an ergonomic standing desk converter and anti-fatigue mat.');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.status).toBe('Pending');
      expect(res.body.data.requestId).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
      expect(res.body.data.auditHistory).toBeDefined();
      expect(res.body.data.auditHistory.length).toBeGreaterThanOrEqual(1);

      createdReqId = res.body.data.id || res.body.data._id;
      customReqId = res.body.data.requestId;
    });

    it('should create a request via alias endpoint /api/v1/miscellaneous-requests', async () => {
      const res = await request(app)
        .post('/api/v1/miscellaneous-requests/miscellaneous')
        .send({
          name: 'David Beckham',
          email: 'david.b@company.com',
          dept: 'Marketing',
          type: 'Software License',
          description: 'Photoshop license subscription renewal for design work.',
          priority: 'Medium',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('David Beckham');
      expect(res.body.data.employee).toBe('David Beckham');
      expect(res.body.data.dept).toBe('Marketing');
      expect(res.body.data.type).toBe('Software License');
      expect(res.body.data.status).toBe('Pending');
    });

    it('should fail validation when employee name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/support/miscellaneous')
        .send({
          description: 'No employee specified',
        });

      expect(res.status).toBe(400);
    });

    it('should create a request specifically for workflow lifecycle testing', async () => {
      const res = await request(app)
        .post('/api/v1/support/miscellaneous')
        .send({
          employee: 'Marcus Rashford',
          email: 'marcus.r@company.com',
          department: 'Operations',
          requestType: 'Facility Repair',
          description: 'HVAC repair required in sector 4 office.',
          priority: 'High',
        });

      expect(res.status).toBe(201);
      workflowReqId = res.body.data.id || res.body.data._id;
    });
  });

  // ================= 2. SUMMARY COUNTS =================
  describe('GET /api/v1/support/miscellaneous/summary', () => {
    it('should return summary counts for Total, Pending, Approved, and Rejected', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous/summary');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.total).toBe('number');
      expect(typeof res.body.data.pending).toBe('number');
      expect(typeof res.body.data.approved).toBe('number');
      expect(typeof res.body.data.rejected).toBe('number');
      expect(typeof res.body.data.inReview).toBe('number');
      expect(typeof res.body.data.processed).toBe('number');
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pending).toBeGreaterThanOrEqual(2);
    });

    it('should also serve stats via /requests/stats alias', async () => {
      const res = await request(app).get('/api/v1/support/requests/stats');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.total).toBe('number');
    });
  });

  // ================= 3. LIST & FILTER =================
  describe('GET /api/v1/support/miscellaneous', () => {
    it('should list all requests', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter requests by status', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous?status=Pending');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((r: any) => {
        expect(r.status).toBe('Pending');
      });
    });

    it('should filter requests by priority', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous?priority=High');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((r: any) => {
        expect(r.priority).toBe('High');
      });
    });

    it('should filter requests by department', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous?department=Engineering');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((r: any) => {
        expect(['Engineering']).toContain(r.department || r.dept);
      });
    });

    it('should search requests by keyword', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous?search=standing desk');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].description).toContain('standing desk');
    });
  });

  // ================= 4. VIEW SINGLE REQUEST =================
  describe('GET /api/v1/support/miscellaneous/:id', () => {
    it('should view request by MongoDB ID', async () => {
      const res = await request(app).get(`/api/v1/support/miscellaneous/${createdReqId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employee).toBe('Alex Morgan');
      expect(res.body.data.requestId).toBe(customReqId);
    });

    it('should view request by custom requestId', async () => {
      const res = await request(app).get(`/api/v1/support/miscellaneous/${customReqId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employee).toBe('Alex Morgan');
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await request(app).get('/api/v1/support/miscellaneous/NON_EXISTENT_ID');
      expect(res.status).toBe(404);
    });
  });

  // ================= 5. UPDATE REQUEST =================
  describe('PUT /api/v1/support/miscellaneous/:id', () => {
    it('should update request fields', async () => {
      const res = await request(app)
        .put(`/api/v1/support/miscellaneous/${createdReqId}`)
        .send({
          description: 'Updated description: urgent dual monitor arm request.',
          priority: 'High',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated description: urgent dual monitor arm request.');
      expect(res.body.data.priority).toBe('High');
    });
  });

  // ================= 6. APPROVE / REJECT / WORKFLOW STATUS UPDATES =================
  describe('PATCH /api/v1/support/miscellaneous/:id/status', () => {
    it('should approve the request', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${createdReqId}/status`)
        .send({
          status: 'Approved',
          comments: 'Approved by HR Director for immediate procurement.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.comments).toBe('Approved by HR Director for immediate procurement.');
    });

    it('should reject the request with reason', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${createdReqId}/status`)
        .send({
          status: 'Rejected',
          rejectionReason: 'Exceeds equipment budget policy.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Rejected');
    });

    it('should fail when given an invalid status', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${createdReqId}/status`)
        .send({
          status: 'InvalidStatus',
        });

      expect(res.status).toBe(400);
    });
  });

  // ================= 7. DEDICATED WORKFLOW ENDPOINTS =================
  describe('Workflow Endpoints: /review, /approve, /reject, /process, /history', () => {
    it('should start review via /review endpoint', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${workflowReqId}/review`)
        .send({
          reviewerName: 'Admin Officer',
          remarks: 'Reviewing budget feasibility',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('In Review');
      expect(res.body.data.reviewerName).toBe('Admin Officer');
    });

    it('should reject without reason and fail with 400', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${workflowReqId}/reject`)
        .send({
          reviewerName: 'Admin Officer',
          rejectionReason: '',
        });

      expect(res.status).toBe(400);
    });

    it('should approve via /approve endpoint', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${workflowReqId}/approve`)
        .send({
          reviewerName: 'Operations Director',
          approvalRemarks: 'Budget approved for technician dispatch',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.approvalRemarks).toBe('Budget approved for technician dispatch');
    });

    it('should process and fulfill via /process endpoint', async () => {
      const res = await request(app)
        .patch(`/api/v1/support/miscellaneous/${workflowReqId}/process`)
        .send({
          processedBy: 'Facilities Desk',
          remarks: 'Technician dispatched and service completed',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Processed');
      expect(res.body.data.processedBy).toBe('Facilities Desk');
      expect(res.body.data.processedAt).toBeDefined();
    });

    it('should retrieve chronological audit history via /history endpoint', async () => {
      const res = await request(app).get(`/api/v1/support/miscellaneous/${workflowReqId}/history`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4); // SUBMITTED, IN_REVIEW, APPROVED, PROCESSED

      const actions = res.body.data.map((e: any) => e.action);
      expect(actions).toContain('SUBMITTED');
      expect(actions).toContain('IN_REVIEW');
      expect(actions).toContain('APPROVED');
      expect(actions).toContain('PROCESSED');
    });
  });

  // ================= 8. DELETE REQUEST =================
  describe('DELETE /api/v1/support/miscellaneous/:id', () => {
    it('should delete request', async () => {
      const res = await request(app).delete(`/api/v1/support/miscellaneous/${createdReqId}`);
      expect(res.status).toBe(200);

      const getRes = await request(app).get(`/api/v1/support/miscellaneous/${createdReqId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
