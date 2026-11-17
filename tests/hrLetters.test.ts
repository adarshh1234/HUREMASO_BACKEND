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

  // ==========================================
  // 7. AI-ASSISTED DOCUMENT DRAFTING
  // ==========================================
  describe('AI-Assisted Document Drafting (/api/v1/hr-letters/ai/draft)', () => {
    it('should generate an AI draft for a corporate memo', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/ai/draft')
        .send({
          category: 'memo',
          subject: 'Office Energy Conservation & Sustainability Policy',
          department: 'Facilities & Operations',
          instructions: 'Include instructions on turning off monitors and HVAC optimization.',
          priority: 'Medium',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.category).toBe('memo');
      expect(res.body.data.subject).toBe('Office Energy Conservation & Sustainability Policy');
      expect(res.body.data.content).toBeDefined();
      expect(res.body.data.content.length).toBeGreaterThan(100);
      expect(res.body.data.suggestedReferenceNumber).toMatch(/^MEMO-\d{4}-\d+/);
      expect(res.body.data.model).toBeDefined();
    });

    it('should generate an AI draft for an official notice', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/ai/draft')
        .send({
          category: 'notice',
          subject: 'Town Hall Meeting Schedule',
          department: 'Executive',
          targetAudience: 'All Employees',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.category).toBe('notice');
      expect(res.body.data.content).toContain('Town Hall');
      expect(res.body.data.suggestedReferenceNumber).toMatch(/^NOT-\d{4}-\d+/);
    });

    it('should generate an AI draft for a department circular', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/ai/draft')
        .send({
          category: 'circular',
          subject: 'Annual Asset Audit Guidelines',
          department: 'Finance & IT',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.category).toBe('circular');
      expect(res.body.data.content.length).toBeGreaterThan(50);
      expect(res.body.data.suggestedReferenceNumber).toMatch(/^CIR-\d{4}-\d+/);
    });

    it('should generate an AI draft for an employee letter with resolved employee context', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/ai/draft')
        .send({
          category: 'letter',
          subject: 'Employment Verification & Good Conduct',
          employeeId: 'EMP2024001',
          instructions: 'Include mention of their stellar engineering contributions.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.category).toBe('letter');
      expect(res.body.data.content).toContain('Sarah Johnson');
      expect(res.body.data.suggestedReferenceNumber).toMatch(/^LTR-\d{4}-\d+/);
    });
  });

  // ==========================================
  // 8. PDF GENERATION & DOWNLOADS
  // ==========================================
  describe('PDF Generation & Document Downloads', () => {
    let testPdfCommId: string;
    let testPdfRecordId: string;

    beforeAll(async () => {
      // Create a test communication for PDF export
      const commRes = await request(app)
        .post('/api/v1/hr-letters/communications')
        .send({
          type: 'memo',
          title: 'Official Executive PDF Export Test',
          content: 'This document tests genuine binary PDF generation with corporate header, metadata table, and authorized signature.',
          department: 'Executive Office',
          status: 'Published',
        });
      testPdfCommId = commRes.body.data.id || commRes.body.data._id;

      // Create a test issued letter for PDF export
      const recRes = await request(app)
        .post('/api/v1/hr-letters/records')
        .send({
          employeeId: 'EMP2024001',
          letterType: 'Experience Certificate',
          subject: 'Experience Certificate – Sarah Johnson',
          content: 'This certifies that Sarah Johnson served as Senior Full Stack Engineer with outstanding diligence and professionalism.',
          status: 'Issued',
        });
      testPdfRecordId = recRes.body.data.id || recRes.body.data._id;
    });

    it('should download communication document as genuine PDF binary', async () => {
      const res = await request(app)
        .get(`/api/v1/hr-letters/communications/${testPdfCommId}/pdf`)
        .responseType('blob');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');

      const buffer = Buffer.from(res.body);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString('utf-8', 0, 8)).toContain('%PDF-1.4');
    });

    it('should download issued letter as genuine PDF binary', async () => {
      const res = await request(app)
        .get(`/api/v1/hr-letters/records/${testPdfRecordId}/pdf`)
        .responseType('blob');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('HUREMASO_LETTER_');

      const buffer = Buffer.from(res.body);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString('utf-8', 0, 8)).toContain('%PDF-1.4');
    });

    it('should generate dynamic on-the-fly PDF from custom draft payload', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/generate-pdf')
        .send({
          title: 'Custom Preview Document',
          documentType: 'notice',
          referenceNumber: 'PREVIEW-2026-99',
          date: 'November 17, 2026',
          department: 'Engineering',
          status: 'Draft',
          content: 'This is a dynamic preview test verifying PDF generation before saving to database.',
        })
        .responseType('blob');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      const buffer = Buffer.from(res.body);
      expect(buffer.toString('utf-8', 0, 8)).toContain('%PDF-1.4');
    });
  });

  // ==========================================
  // 9. STATS & AGGREGATION METRICS
  // ==========================================
  describe('Document Stats & Aggregations (/api/v1/hr-letters/stats)', () => {
    it('should return aggregated counts across memos, notices, circulars, letters and statuses', async () => {
      const res = await request(app).get('/api/v1/hr-letters/stats');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.total).toBe('number');
      expect(typeof res.body.data.memos).toBe('number');
      expect(typeof res.body.data.notices).toBe('number');
      expect(typeof res.body.data.circulars).toBe('number');
      expect(typeof res.body.data.letters).toBe('number');
      expect(typeof res.body.data.published).toBe('number');
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 10. LIFECYCLE & STATUS TRANSITIONS
  // ==========================================
  describe('Document Lifecycle & Status Transitions', () => {
    let lifecycleDocId: string;

    it('should create document in Draft state', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/communications')
        .send({
          type: 'memo',
          title: 'Lifecycle Workflow Verification Memo',
          content: 'Testing transition from Draft -> Approved -> Published.',
          status: 'Draft',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('Draft');
      lifecycleDocId = res.body.data.id || res.body.data._id;
    });

    it('should transition document to Approved status with approval metadata', async () => {
      const res = await request(app)
        .patch(`/api/v1/hr-letters/communications/${lifecycleDocId}/status`)
        .send({
          status: 'Approved',
          approvedBy: 'HR Vice President',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
    });

    it('should transition document to Published status with publication metadata', async () => {
      const res = await request(app)
        .post(`/api/v1/hr-letters/communications/${lifecycleDocId}/publish`)
        .send({
          status: 'Published',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Published');
    });
  });

  // ==========================================
  // 11. VALIDATION & ERROR HANDLING
  // ==========================================
  describe('Validation & Error Handling', () => {
    it('should reject creation with empty title (400)', async () => {
      const res = await request(app)
        .post('/api/v1/hr-letters/communications')
        .send({
          type: 'memo',
          title: '   ',
          content: 'Missing valid title.',
        });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent document ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/hr-letters/communications/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid mongo ID format', async () => {
      const res = await request(app).get('/api/v1/hr-letters/communications/invalid-id-123');
      expect(res.status).toBe(400);
    });
  });
});
