import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { EmployeeModel } from '../src/modules/employee/employee.model';

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

describe('HR Letters & Memos Backend Tests (/api/v1/hr-letters)', () => {
  let createdMemoId: string;
  let createdNoticeId: string;
  let createdCircularId: string;
  let createdLetterId: string;
  let createdTemplateId: string;
  let createdRecordId: string;

  beforeAll(async () => {
    await EmployeeModel.create({
      employeeId: 'EMP2024001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Software Engineering',
      jobTitle: 'Senior Full Stack Engineer',
      location: 'New York',
      employmentStatus: 'Full-Time Permanent',
      category: 'staff',
    });
  });

  // ==========================================
  // 1. MEMO CRUD
  // ==========================================
  describe('Memo CRUD', () => {
    it('should create a memo with Draft status and required fields', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/communications')
        .send({
          type: 'memo',
          title: 'Remote Work Q4 Guidelines',
          content: 'Detailed guidelines regarding hybrid and remote schedules for Q4.',
          department: 'Engineering',
          targetAudience: 'Engineering Staff',
          author: 'HR Lead',
          status: 'Draft',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('Remote Work Q4 Guidelines');
      expect(res.body.data.type).toBe('memo');
      expect(res.body.data.status).toBe('Draft');
      expect(res.body.data.department).toBe('Engineering');
      expect(res.body.data.author).toBe('HR Lead');
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
      createdMemoId = res.body.data.id || res.body.data._id;
    });

    it('should list memos with filter', async () => {
      const res = await request(app).get('/api/v1/hr-letters/communications?type=memo');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((m: any) => (m.id || m._id) === createdMemoId);
      expect(found).toBeDefined();
      expect(found.title).toBe('Remote Work Q4 Guidelines');
    });

    it('should view a single memo by id', async () => {
      const res = await request(app).get(`/api/v1/hr-letters/communications/${createdMemoId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Remote Work Q4 Guidelines');
      expect(res.body.data.type).toBe('memo');
    });

    it('should update memo content and details', async () => {
      const res = await request(app)
        .put(`/api/v1/hr-letters/communications/${createdMemoId}`)
        .send({
          title: 'Updated Remote Work Q4 Guidelines',
          content: 'Updated guidelines for all remote personnel.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Remote Work Q4 Guidelines');
      expect(res.body.data.content).toBe('Updated guidelines for all remote personnel.');
    });

    it('should publish memo via status update', async () => {
      const res = await request(app)
        .patch(`/api/v1/hr-letters/communications/${createdMemoId}/status`)
        .send({ status: 'Published' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Published');
    });

    it('should delete a memo', async () => {
      const res = await request(app).delete(`/api/v1/hr-letters/communications/${createdMemoId}`);
      expect(res.status).toBe(200);

      const getRes = await request(app).get(`/api/v1/hr-letters/communications/${createdMemoId}`);
      expect(getRes.status).toBe(404);
    });
  });

  // ==========================================
  // 2. NOTICE CRUD
  // ==========================================
  describe('Notice CRUD', () => {
    it('should create a notice via /notices route', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/notices')
        .send({
          title: 'Company Annual Day Announcement',
          content: 'Please mark your calendars for December 15th for the Annual Day celebration.',
          targetAudience: 'All Employees',
          author: 'Events Committee',
          status: 'Published',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('notice');
      expect(res.body.data.title).toBe('Company Annual Day Announcement');
      expect(res.body.data.status).toBe('Published');
      createdNoticeId = res.body.data.id || res.body.data._id;
    });

    it('should list notices via /notices', async () => {
      const res = await request(app).get('/api/v1/hr-letters/notices');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((n: any) => (n.id || n._id) === createdNoticeId);
      expect(found).toBeDefined();
    });

    it('should view a notice by ID', async () => {
      const res = await request(app).get(`/api/v1/hr-letters/notices/${createdNoticeId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Company Annual Day Announcement');
    });

    it('should update notice', async () => {
      const res = await request(app)
        .put(`/api/v1/hr-letters/notices/${createdNoticeId}`)
        .send({
          title: 'Company Annual Day Gala Announcement',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Company Annual Day Gala Announcement');
    });

    it('should delete notice', async () => {
      const res = await request(app).delete(`/api/v1/hr-letters/notices/${createdNoticeId}`);
      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // 3. CIRCULAR CRUD
  // ==========================================
  describe('Circular CRUD', () => {
    it('should create a circular via /circulars route', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/circulars')
        .send({
          title: 'IT Security & Phishing Awareness Circular',
          content: 'All staff must complete the mandatory security quiz by Friday.',
          department: 'Information Technology',
          author: 'CISO Office',
          status: 'Published',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('circular');
      expect(res.body.data.department).toBe('Information Technology');
      createdCircularId = res.body.data.id || res.body.data._id;
    });

    it('should list circulars', async () => {
      const res = await request(app).get('/api/v1/hr-letters/circulars');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((c: any) => (c.id || c._id) === createdCircularId);
      expect(found).toBeDefined();
    });

    it('should update circular', async () => {
      const res = await request(app)
        .put(`/api/v1/hr-letters/circulars/${createdCircularId}`)
        .send({
          status: 'Archived',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Archived');
    });

    it('should delete circular', async () => {
      const res = await request(app).delete(`/api/v1/hr-letters/circulars/${createdCircularId}`);
      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // 4. HR LETTER / NOTE CRUD
  // ==========================================
  describe('HR Letter / Note CRUD', () => {
    it('should create an HR letter/note communication', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/letters')
        .send({
          title: 'Performance Appreciation Note',
          content: 'Special recognition for outstanding Q3 deliverables.',
          recipient: 'Sarah Johnson',
          employeeTarget: 'EMP2024001',
          employeeId: 'EMP2024001',
          author: 'HR Operations',
          status: 'Published',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('letter');
      expect(res.body.data.recipient).toBe('Sarah Johnson');
      createdLetterId = res.body.data.id || res.body.data._id;
    });

    it('should list letters/notes', async () => {
      const res = await request(app).get('/api/v1/hr-letters/letters');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((l: any) => (l.id || l._id) === createdLetterId);
      expect(found).toBeDefined();
    });

    it('should update letter/note', async () => {
      const res = await request(app)
        .put(`/api/v1/hr-letters/letters/${createdLetterId}`)
        .send({
          content: 'Updated special recognition note for Sarah Johnson.',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Updated special recognition note for Sarah Johnson.');
    });

    it('should delete letter/note', async () => {
      const res = await request(app).delete(`/api/v1/hr-letters/letters/${createdLetterId}`);
      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // 5. TEMPLATES & DYNAMIC LETTER GENERATION
  // ==========================================
  describe('Letter Templates & Dynamic Generation', () => {
    it('should fetch default letter templates', async () => {
      const res = await request(app).get('/api/v1/hr-letters/templates');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });

    it('should create a custom letter template', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/templates')
        .send({
          name: 'Promotion Letter Template',
          category: 'Promotion',
          subject: 'Promotion Confirmation – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nCongratulations on your promotion to {{jobTitle}} at {{companyName}}.',
          variables: ['{{employeeName}}', '{{jobTitle}}', '{{companyName}}'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Promotion Letter Template');
      createdTemplateId = res.body.data.id || res.body.data._id;
    });

    it('should generate dynamic letter with employee data substitution', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/records/generate')
        .send({
          templateId: createdTemplateId,
          employeeId: 'EMP2024001',
          employeeName: 'Sarah Johnson',
          companyName: 'Huremaso Global',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subject).toContain('Sarah Johnson');
      expect(res.body.data.message).toContain('Sarah Johnson');
      expect(res.body.data.message).toContain('Huremaso Global');
    });

    it('should update a template', async () => {
      const res = await request(app)
        .put(`/api/v1/hr-letters/templates/${createdTemplateId}`)
        .send({
          name: 'Executive Promotion Letter Template',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Executive Promotion Letter Template');
    });

    it('should delete a template', async () => {
      const res = await request(app).delete(`/api/v1/hr-letters/templates/${createdTemplateId}`);
      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // 6. ISSUED LETTER RECORDS CRUD
  // ==========================================
  describe('Issued Letter Records CRUD', () => {
    it('should create an issued letter record', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/records')
        .send({
          employeeId: 'EMP2024001',
          letterType: 'Appraisal & Increment Letter',
          subject: 'Annual Appraisal – Sarah Johnson',
          content: 'We are pleased to notify you of your annual increment effective next month.',
          status: 'Issued',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.employeeId).toBe('EMP2024001');
      expect(res.body.data.letterType).toBe('Appraisal & Increment Letter');
      createdRecordId = res.body.data.id || res.body.data._id;
    });

    it('should get issued records filtered by employeeId', async () => {
      const res = await request(app).get('/api/v1/hr-letters/records?employeeId=EMP2024001');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((r: any) => (r.id || r._id) === createdRecordId);
      expect(found).toBeDefined();
    });

    it('should update issued record status', async () => {
      const res = await request(app)
        .put(`/api/v1/hr-letters/records/${createdRecordId}`)
        .send({
          status: 'Signed',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Signed');
    });

    it('should delete issued record', async () => {
      const res = await request(app).delete(`/api/v1/hr-letters/records/${createdRecordId}`);
      expect(res.status).toBe(200);
    });
  });
});
