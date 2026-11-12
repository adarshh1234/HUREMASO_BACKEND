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

describe('Employee Management Submodules Integration Tests', () => {
  let testEmployeeId: string;

  beforeAll(async () => {
    const emp = await EmployeeModel.create({
      employeeId: 'EMP500001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      email: 'sarah.johnson.submodules@company.com',
      department: 'Software Engineering',
      jobTitle: 'Senior Full Stack Engineer',
      location: 'Kochi',
      employmentStatus: 'Full-Time Permanent',
      category: 'staff',
    });
    testEmployeeId = emp._id.toString();
  });

  // 1. LEAVE MANAGEMENT
  describe('Leave Management APIs (/api/v1/leave)', () => {
    let createdLeaveId: string;
    let createdTypeId: string;
    let createdHolidayId: string;

    it('should get initial leave period config', async () => {
      const res = await request(app).get('/api/v1/leave/config/period');
      expect(res.status).toBe(200);
      expect(res.body.data.currentPeriod).toBeDefined();
    });

    it('should save leave period config', async () => {
      const res = await request(app)
        .post('/api/v1/leave/config/period')
        .send({
          startMonth: 'January',
          startDate: '01',
          endDate: '31',
          currentPeriod: '2026-01-01 - 2026-12-31',
        });
      expect(res.status).toBe(200);
    });

    it('should get leave types and create a custom leave type', async () => {
      const getRes = await request(app).get('/api/v1/leave/config/types');
      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body.data)).toBe(true);

      const createRes = await request(app)
        .post('/api/v1/leave/config/types')
        .send({ name: 'Paternity Leave', daysPerYear: 14 });
      expect(createRes.status).toBe(201);
      createdTypeId = createRes.body.data.id || createRes.body.data._id;
    });

    it('should add leave entitlement', async () => {
      const res = await request(app)
        .post('/api/v1/leave/entitlements')
        .send({
          targetType: 'individual',
          employeeName: 'Sarah Johnson',
          leaveType: 'Casual Leave',
          leavePeriod: '2026-01-01 - 2026-12-31',
          entitlement: 15,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.days).toBe(15);
    });

    it('should calculate leave balances dynamically', async () => {
      const res = await request(app).get('/api/v1/leave/balances?employeeName=Sarah Johnson');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const casual = res.body.data.find((b: any) => b.leaveType === 'Casual Leave');
      expect(casual).toBeDefined();
      expect(casual.balance).toBeGreaterThanOrEqual(15);
    });

    it('should create a leave request with backend days calculation', async () => {
      const res = await request(app)
        .post('/api/v1/leave/requests')
        .send({
          employeeName: 'Sarah Johnson',
          leaveType: 'Casual Leave',
          fromDate: '2026-06-10',
          toDate: '2026-06-12',
          comments: 'Family vacation',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.numberOfDays).toBe(3);
      expect(res.body.data.status).toBe('Pending');
      createdLeaveId = res.body.data.id || res.body.data._id;
    });

    it('should prevent overlapping leave request', async () => {
      const res = await request(app)
        .post('/api/v1/leave/requests')
        .send({
          employeeName: 'Sarah Johnson',
          leaveType: 'Casual Leave',
          fromDate: '2026-06-11',
          toDate: '2026-06-13',
          comments: 'Overlap test',
        });
      expect(res.status).toBe(400);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toMatch(/overlaps/i);
    });

    it('should approve pending leave request', async () => {
      const res = await request(app)
        .patch(`/api/v1/leave/requests/${createdLeaveId}/status`)
        .send({ status: 'Approved' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
    });

    it('should assign leave directly as Approved', async () => {
      const res = await request(app)
        .post('/api/v1/leave/assign')
        .send({
          employeeName: 'Sarah Johnson',
          leaveType: 'Sick Leave',
          fromDate: '2026-07-01',
          toDate: '2026-07-02',
          comment: 'Doctor appointment',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.numberOfDays).toBe(2);
    });

    it('should create and list holidays', async () => {
      const createRes = await request(app)
        .post('/api/v1/leave/holidays')
        .send({
          name: 'National Innovation Day',
          date: '2026-11-15',
          dayType: 'Full Day',
          repeatsAnnually: true,
        });
      expect(createRes.status).toBe(201);
      createdHolidayId = createRes.body.data.id || createRes.body.data._id;

      const listRes = await request(app).get('/api/v1/leave/holidays');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 2. EMPLOYEE REQUESTS
  describe('Employee Requests APIs (/api/v1/employee-requests)', () => {
    let createdReqId: string;

    it('should create an employee finance request', async () => {
      const res = await request(app)
        .post('/api/v1/employee-requests')
        .send({
          empId: 'EMP500001',
          name: 'Sarah Johnson',
          type: 'Training Course Payment',
          department: 'Engineering',
          date: '2026-03-01',
          amount: '1,500',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('Pending');
      createdReqId = res.body.data.id || res.body.data._id;
    });

    it('should list employee requests with search filter', async () => {
      const res = await request(app).get('/api/v1/employee-requests?search=Sarah');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should approve employee request', async () => {
      const res = await request(app)
        .patch(`/api/v1/employee-requests/${createdReqId}/status`)
        .send({ status: 'Approved', approver: 'HR Manager' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.approver).toBe('HR Manager');
    });
  });

  // 3. EMPLOYEE DOCUMENTS
  describe('Employee Documents APIs (/api/v1/employee-documents)', () => {
    let createdFolderId: string;
    let createdDocId: string;

    it('should create and list document folders', async () => {
      const createRes = await request(app)
        .post('/api/v1/employee-documents/folders')
        .send({ name: 'Certifications & Awards' });
      expect(createRes.status).toBe(201);
      createdFolderId = createRes.body.data.id || createRes.body.data._id;

      const listRes = await request(app).get('/api/v1/employee-documents/folders');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should create document metadata', async () => {
      const res = await request(app)
        .post('/api/v1/employee-documents')
        .send({
          name: 'AWS Solutions Architect Certificate',
          category: 'Certifications & Awards',
          folderId: createdFolderId,
          employeeId: 'EMP500001',
          fileType: 'PDF',
          fileSize: 2048,
        });
      if (res.status !== 201) {
        console.error('DOCUMENT CREATE ERROR:', res.body);
      }
      expect(res.status).toBe(201);
      createdDocId = res.body.data.id || res.body.data._id;
    });

    it('should list and delete document', async () => {
      const listRes = await request(app).get('/api/v1/employee-documents?search=AWS');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);

      const delRes = await request(app).delete(`/api/v1/employee-documents/${createdDocId}`);
      expect(delRes.status).toBe(200);
    });
  });

  // 4. HR LETTERS & MEMOS
  describe('HR Letters & Memos APIs (/api/v1/hr-letters)', () => {
    it('should get templates and dynamically generate letter replacing variables', async () => {
      const templatesRes = await request(app).get('/api/v1/hr-letters/templates');
      expect(templatesRes.status).toBe(200);
      expect(templatesRes.body.data.length).toBeGreaterThanOrEqual(1);

      const genRes = await request(app)
        .post('/api/v1/hr-letters/generate')
        .send({
          templateName: 'Employment Confirmation Letter',
          employeeName: 'Sarah Johnson',
          companyName: 'Huremaso Global',
        });
      expect(genRes.status).toBe(200);
      expect(genRes.body.data.subject).toContain('Sarah Johnson');
      expect(genRes.body.data.message).toContain('Huremaso Global');
      expect(genRes.body.data.message).toContain('Senior Full Stack Engineer');
    });

    it('should create and list communications (memos/notices)', async () => {
      const createRes = await request(app)
        .post('/api/v1/hr-letters/communications')
        .send({
          type: 'memo',
          title: 'Remote Work Q4 Guidelines',
          author: 'HR Dept',
          status: 'Published',
        });
      expect(createRes.status).toBe(201);

      const listRes = await request(app).get('/api/v1/hr-letters/communications?type=memo');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some((c: any) => c.title === 'Remote Work Q4 Guidelines')).toBe(true);
    });
  });

  // 5. PROJECTS
  describe('Projects APIs (/api/v1/projects)', () => {
    let createdCustId: string;
    let createdProjId: string;

    it('should create customer and project', async () => {
      const custRes = await request(app)
        .post('/api/v1/projects/customers')
        .send({ name: 'Nova Dynamics', desc: 'Robotics & Automation' });
      expect(custRes.status).toBe(201);
      createdCustId = custRes.body.data.id || custRes.body.data._id;

      const projRes = await request(app)
        .post('/api/v1/projects')
        .send({
          customerName: 'Nova Dynamics',
          project: 'Nova Vision AI',
          projectAdmins: 'Sarah Johnson',
        });
      expect(projRes.status).toBe(201);
      createdProjId = projRes.body.data.id || projRes.body.data._id;
    });

    it('should list projects with filter', async () => {
      const res = await request(app).get('/api/v1/projects?project=Nova');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].customerName).toBe('Nova Dynamics');
    });
  });

  // 6. LEGAL MANAGEMENT
  describe('Legal Management APIs (/api/v1/legal)', () => {
    it('should fetch legal overview score and audits', async () => {
      const res = await request(app).get('/api/v1/legal/overview');
      expect(res.status).toBe(200);
      expect(res.body.data.complianceScore).toBeGreaterThanOrEqual(95);
    });

    it('should process AI legal compliance queries', async () => {
      const res = await request(app)
        .post('/api/v1/legal/ai-query')
        .send({ query: 'Check contract non-compete clause compliance' });
      expect(res.status).toBe(200);
      expect(res.body.data.response).toContain('Contract Audit');
    });
  });

  // 7. EMPLOYEE CONFIGURATION
  describe('Employee Configuration APIs (/api/v1/employee-config)', () => {
    it('should fetch and update optional field settings', async () => {
      const getRes = await request(app).get('/api/v1/employee-config');
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.optionalFields).toBeDefined();

      const updateRes = await request(app)
        .put('/api/v1/employee-config/optional-fields')
        .send({ smoker: false });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.optionalFields.smoker).toBe(false);
    });

    it('should add custom field and reporting method', async () => {
      const customRes = await request(app)
        .post('/api/v1/employee-config/custom-fields')
        .send({ name: 'Emergency Contact Tier', screen: 'Personal Details', type: 'Text or Number' });
      expect(customRes.status).toBe(201);

      const reportRes = await request(app)
        .post('/api/v1/employee-config/reporting-methods')
        .send({ name: 'Matrix Lead' });
      expect(reportRes.status).toBe(201);
    });

    it('should import bulk employee records', async () => {
      const res = await request(app)
        .post('/api/v1/employee-config/import-data')
        .send({
          records: [
            {
              firstName: 'Daniel',
              lastName: 'Craig',
              email: 'daniel.craig@company.com',
              department: 'Operations',
              jobTitle: 'Operations Specialist',
            },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.data.importedCount).toBe(1);
    });
  });

  // 8. MASS MESSAGE
  describe('Mass Message APIs (/api/v1/mass-messages)', () => {
    it('should fetch recipient departments and employees', async () => {
      const res = await request(app).get('/api/v1/mass-messages/recipients');
      expect(res.status).toBe(200);
      expect(res.body.data.departments).toContain('All Departments');
      expect(Array.isArray(res.body.data.employees)).toBe(true);
    });

    it('should broadcast mass message via notification system and log history', async () => {
      const sendRes = await request(app)
        .post('/api/v1/mass-messages/send')
        .send({
          departments: ['Software Engineering'],
          subject: 'All-Hands Product Demo',
          message: 'Please join the virtual conference room at 4:00 PM.',
        });
      expect(sendRes.status).toBe(201);
      expect(sendRes.body.data.status).toBe('Send');

      const histRes = await request(app).get('/api/v1/mass-messages/history');
      expect(histRes.status).toBe(200);
      expect(histRes.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 9. PERFORMANCE
  describe('Performance APIs (/api/v1/performance)', () => {
    let createdReviewId: string;

    it('should create and list performance reviews', async () => {
      const createRes = await request(app)
        .post('/api/v1/performance/reviews')
        .send({
          employeeName: 'Sarah Johnson',
          jobTitle: 'Senior Full Stack Engineer',
          reviewPeriod: '2026-01-01 - 2026-06-30',
          dueDate: '2026-07-15',
          reviewer: 'Engineering Director',
          reviewStatus: 'Pending',
        });
      expect(createRes.status).toBe(201);
      createdReviewId = createRes.body.data.id || createRes.body.data._id;

      const listRes = await request(app).get('/api/v1/performance/reviews?employeeName=Sarah');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should get appraisal AI summary metrics', async () => {
      const res = await request(app).get('/api/v1/performance/appraisal/summary');
      expect(res.status).toBe(200);
      expect(res.body.data.evaluationScore).toBeDefined();
      expect(res.body.data.skillGaps.length).toBeGreaterThan(0);
    });
  });

  // 10. REPORTS & ANALYTICS
  describe('Reports & Analytics APIs (/api/v1/employee-reports)', () => {
    it('should get real-time headcount & turnover stats from MongoDB aggregations', async () => {
      const res = await request(app).get('/api/v1/employee-reports/headcount-turnover');
      expect(res.status).toBe(200);
      expect(res.body.data.totalActive).toBeGreaterThanOrEqual(1);
      expect(res.body.data.retentionRate).toBeDefined();
    });

    it('should get department distribution aggregation', async () => {
      const res = await request(app).get('/api/v1/employee-reports/department-distribution');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get predictive analytics', async () => {
      const res = await request(app).get('/api/v1/employee-reports/predictive-analytics');
      expect(res.status).toBe(200);
      expect(res.body.data.flightRiskTier).toBeDefined();
    });
  });
});
