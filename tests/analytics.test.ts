import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { EmployeeModel } from '../src/modules/employee/employee.model';
import { AttendanceModel } from '../src/modules/time/attendance/attendance.model';
import { LeaveRequestModel } from '../src/modules/employee/leave/leave.model';
import { PayrollRecordModel } from '../src/modules/payroll/record/payrollRecord.model';
import { CandidateModel } from '../src/modules/recruitment/candidate/candidate.model';
import { OnboardingCandidateModel } from '../src/modules/onboarding/candidate/onboardingCandidate.model';
import { OffboardingRecordModel } from '../src/modules/offboarding/record/offboardingRecord.model';
import { PerformanceAppraisalModel } from '../src/modules/performance/performanceAppraisal.model';
import { TaskModel } from '../src/modules/tasks/tasks.model';
import { EmployeeAppUserModel } from '../src/modules/employeeApp/employeeApp.model';
import { FinancialIncentiveModel } from '../src/modules/wellness/wellness.model';
import { CompanyEventModel } from '../src/modules/events/event.model';
import { NotificationModel } from '../src/modules/notification/notification.model';
import { EmployeeRecognitionModel } from '../src/modules/analytics/recognition.model';

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

describe('Reporting & Analytics Comprehensive Test Suite', () => {
  beforeAll(async () => {
    // 1. Seed Employees
    const [emp1, emp2, emp3, emp4] = await EmployeeModel.create([
      {
        employeeId: 'EMP-1001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        department: 'Engineering',
        jobTitle: 'Lead Cloud Architect',
        employmentStatus: 'Full-Time',
        category: 'staff',
        isTerminated: false,
      },
      {
        employeeId: 'EMP-1002',
        firstName: 'Michael',
        lastName: 'Torres',
        name: 'Michael Torres',
        email: 'michael.t@company.com',
        department: 'Operations',
        jobTitle: 'Principal Systems Engineer',
        employmentStatus: 'Full-Time',
        category: 'staff',
        isTerminated: false,
      },
      {
        employeeId: 'EMP-1003',
        firstName: 'Priya',
        lastName: 'Nair',
        name: 'Priya Nair',
        email: 'priya.n@company.com',
        department: 'Executive Leadership',
        jobTitle: 'VP of Engineering',
        employmentStatus: 'Full-Time',
        category: 'staff',
        isTerminated: false,
      },
      {
        employeeId: 'EMP-1004',
        firstName: 'David',
        lastName: 'Kim',
        name: 'David Kim',
        email: 'david.k@company.com',
        department: 'Product & Design',
        jobTitle: 'Lead Product Designer',
        employmentStatus: 'Contract',
        category: 'probation',
        isTerminated: false,
      },
    ]);

    // 2. Seed Attendance
    await AttendanceModel.create([
      { employeeId: emp1._id, employeeName: 'Sarah Johnson', date: '2026-06-01', status: 'Present' },
      { employeeId: emp1._id, employeeName: 'Sarah Johnson', date: '2026-06-02', status: 'Present' },
      { employeeId: emp2._id, employeeName: 'Michael Torres', date: '2026-06-01', status: 'Present' },
      { employeeId: emp2._id, employeeName: 'Michael Torres', date: '2026-06-02', status: 'Late' },
      { employeeId: emp3._id, employeeName: 'Priya Nair', date: '2026-06-01', status: 'Present' },
      { employeeId: emp4._id, employeeName: 'David Kim', date: '2026-06-01', status: 'Half-Day' },
    ]);

    // 3. Seed Leave Requests
    await LeaveRequestModel.create([
      {
        employeeId: 'EMP-1001',
        employeeRef: emp1._id,
        employeeName: 'Sarah Johnson',
        department: 'Engineering',
        leaveType: 'Annual Vacation',
        fromDate: '2026-07-01',
        toDate: '2026-07-05',
        numberOfDays: 5,
        status: 'Approved',
        comments: 'Family summer holiday',
      },
      {
        employeeId: 'EMP-1004',
        employeeRef: emp4._id,
        employeeName: 'David Kim',
        department: 'Product & Design',
        leaveType: 'Medical Sick Leave',
        fromDate: '2026-06-15',
        toDate: '2026-06-16',
        numberOfDays: 2,
        status: 'Pending',
        comments: 'Dental surgery',
      },
    ]);

    // 4. Seed Payroll Records
    await PayrollRecordModel.create([
      {
        employeeId: 'EMP-1001',
        employeeName: 'Sarah Johnson',
        department: 'Engineering',
        period: 'June 2026',
        date: 'June 30, 2026',
        amount: 14500,
        paidAmount: 11200,
        status: 'Paid',
        category: 'statement',
      },
      {
        employeeId: 'EMP-1002',
        employeeName: 'Michael Torres',
        department: 'Operations',
        period: 'June 2026',
        date: 'June 30, 2026',
        amount: 13800,
        paidAmount: 10600,
        status: 'Paid',
        category: 'statement',
      },
      {
        employeeId: 'EMP-1003',
        employeeName: 'Priya Nair',
        department: 'Executive Leadership',
        period: 'June 2026',
        date: 'June 30, 2026',
        amount: 22000,
        paidAmount: 0,
        status: 'Pending',
        category: 'upcoming',
      },
    ]);

    // 5. Seed Recruitment Candidates
    await CandidateModel.create([
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@gmail.com',
        vacancy: 'Senior Staff Engineer',
        status: 'Interview Scheduled',
      },
      {
        name: 'Jessica Vance',
        email: 'jessica.v@gmail.com',
        vacancy: 'Product Operations Manager',
        status: 'Hired',
      },
    ]);

    // 6. Seed Onboarding Candidates
    await OnboardingCandidateModel.create([
      {
        candidateId: 'ONB-201',
        name: 'Emily Chen',
        email: 'emily.chen@company.com',
        department: 'Engineering',
        role: 'Cloud Engineer',
        startDate: '2026-07-01',
        status: 'In Progress',
      },
      {
        candidateId: 'ONB-202',
        name: 'Marcus Bell',
        email: 'marcus.bell@company.com',
        department: 'Sales',
        role: 'Enterprise Account Exec',
        startDate: '2026-06-15',
        status: 'Completed',
      },
    ]);

    // 7. Seed Offboarding Records
    await OffboardingRecordModel.create([
      {
        recordId: 'OFF-101',
        employeeName: 'Robert Vance',
        employeeId: 'EMP-909',
        department: 'Sales',
        role: 'Sales Representative',
        exitDate: '2026-06-30',
        status: 'Completed',
      },
    ]);

    // 8. Seed Performance Appraisals
    await PerformanceAppraisalModel.create([
      {
        recordId: 'APP-2026-01',
        employeeId: 'EMP-1001',
        employeeName: 'Sarah Johnson',
        department: 'Engineering',
        role: 'Lead Cloud Architect',
        cycle: 'Q2 2026',
        status: 'Approved',
        reportsAi: { overallAiScore: 4.95 },
      },
      {
        recordId: 'APP-2026-02',
        employeeId: 'EMP-1002',
        employeeName: 'Michael Torres',
        department: 'Operations',
        role: 'Principal Systems Engineer',
        cycle: 'Q2 2026',
        status: 'Approved',
        reportsAi: { overallAiScore: 4.92 },
      },
      {
        recordId: 'APP-2026-03',
        employeeId: 'EMP-1003',
        employeeName: 'Priya Nair',
        department: 'Executive Leadership',
        role: 'VP of Engineering',
        cycle: 'Annual 2025/2026',
        status: 'Approved',
        reportsAi: { overallAiScore: 4.98 },
      },
    ]);

    // 9. Seed Tasks
    await TaskModel.create([
      {
        title: 'Kubernetes Cluster Zero-Downtime Upgrade',
        column: 'completed',
        priority: 'High',
        type: 'infrastructure',
        assigneeName: 'Sarah Johnson',
        dueDate: '2026-06-25',
        completedAt: new Date('2026-06-24'),
      },
      {
        title: 'Cloud Cost Optimization Audit',
        column: 'completed',
        priority: 'Medium',
        type: 'devops',
        assigneeName: 'Michael Torres',
        dueDate: '2026-06-28',
        completedAt: new Date('2026-06-27'),
      },
      {
        title: 'Architecture Review for Multi-Region DR',
        column: 'in-progress',
        priority: 'High',
        type: 'architecture',
        assigneeName: 'Sarah Johnson',
        dueDate: '2026-07-15',
      },
    ]);

    // 10. Seed Employee App Users
    await EmployeeAppUserModel.create([
      {
        employeeId: 'EMP-1001',
        appUserId: 'APP-USR-01',
        fullName: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        department: 'Engineering',
        designation: 'Lead Cloud Architect',
        deviceType: 'iOS',
        status: 'Active',
      },
      {
        employeeId: 'EMP-1002',
        appUserId: 'APP-USR-02',
        fullName: 'Michael Torres',
        email: 'michael.t@company.com',
        department: 'Operations',
        designation: 'Principal Systems Engineer',
        deviceType: 'Android',
        status: 'Active',
      },
    ]);

    // 11. Seed Financial Incentives (Wellness)
    await FinancialIncentiveModel.create([
      {
        employeeId: 'EMP-1001',
        employeeName: 'Sarah Johnson',
        department: 'Engineering',
        estimatedBonusAmount: 3500,
        bonusStatus: 'Approved',
      },
      {
        employeeId: 'EMP-1002',
        employeeName: 'Michael Torres',
        department: 'Operations',
        estimatedBonusAmount: 2500,
        bonusStatus: 'Approved',
      },
    ]);

    // 12. Seed Company Events
    await CompanyEventModel.create([
      {
        title: 'H1 Global Engineering All-Hands & Technical Showcase',
        eventType: 'Town Hall',
        startDate: '2026-07-10',
        startTime: '10:00 AM',
        venue: 'Main Auditorium & Virtual Streaming',
        attendeeCount: 185,
        status: 'Up coming',
      },
      {
        title: 'Security Compliance & SOC2 Training Bootcamp',
        eventType: 'Training Session',
        startDate: '2026-06-12',
        startTime: '02:00 PM',
        venue: 'Conference Hall A',
        attendeeCount: 45,
        status: 'Completed',
      },
    ]);

    // 13. Seed Notifications
    await NotificationModel.create([
      {
        channel: 'EMAIL',
        subject: 'Q2 Performance Appraisals Cycle Now Live',
        message: 'All employees please complete peer reviews',
        recipients: 'All Active Staff',
        recipientType: 'ALL_EMPLOYEES',
        status: 'SENT',
      },
      {
        channel: 'SMS',
        subject: 'Reminder: Submit Timesheets by Friday 5PM',
        message: 'Weekly timesheet submission deadline reminder',
        recipients: 'All Active Staff',
        recipientType: 'ALL_EMPLOYEES',
        status: 'SENT',
      },
    ]);
  });

  // ========================================================
  // 1. ALL 12 OPERATIONAL REPORT ENDPOINTS
  // ========================================================
  describe('Operational Report Endpoints (/api/v1/reports/*)', () => {
    it('1. GET /api/v1/reports/employees should return active employee directory and metrics', async () => {
      const res = await request(app).get('/api/v1/reports/employees').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalEmployees).toBeGreaterThanOrEqual(4);
      expect(res.body.data.records).toBeInstanceOf(Array);
      expect(res.body.data.records[0]).toHaveProperty('employeeId');
      expect(res.body.data.records[0]).toHaveProperty('name');
    });

    it('2. GET /api/v1/reports/attendance-time should return attendance and punctuality metrics', async () => {
      const res = await request(app).get('/api/v1/reports/attendance-time').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalAttendanceRecords).toBeGreaterThanOrEqual(6);
      expect(res.body.data.summary.presentCount).toBeGreaterThanOrEqual(4);
      expect(res.body.data.records).toBeInstanceOf(Array);
    });

    it('3. GET /api/v1/reports/leave should return leave request balance telemetry', async () => {
      const res = await request(app).get('/api/v1/reports/leave').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalRequests).toBeGreaterThanOrEqual(2);
      expect(res.body.data.records[0]).toHaveProperty('leaveType');
    });

    it('4. GET /api/v1/reports/payroll should return compensation disbursal records', async () => {
      const res = await request(app).get('/api/v1/reports/payroll').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalPayrollRecords).toBeGreaterThanOrEqual(3);
      expect(res.body.data.summary.totalGrossDisbursed).toBeGreaterThan(0);
    });

    it('5. GET /api/v1/reports/recruitment should return candidate pipeline analytics', async () => {
      const res = await request(app).get('/api/v1/reports/recruitment').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalCandidates).toBeGreaterThanOrEqual(2);
      expect(res.body.data.records[0]).toHaveProperty('vacancy');
    });

    it('6. GET /api/v1/reports/onboarding should return onboarding checklist progress', async () => {
      const res = await request(app).get('/api/v1/reports/onboarding').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalOnboarding).toBeGreaterThanOrEqual(2);
      expect(res.body.data.records[0]).toHaveProperty('progress');
    });

    it('7. GET /api/v1/reports/offboarding should return clearance records', async () => {
      const res = await request(app).get('/api/v1/reports/offboarding').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalOffboarding).toBeGreaterThanOrEqual(1);
      expect(res.body.data.records[0]).toHaveProperty('exitDate');
    });

    it('8. GET /api/v1/reports/performance should return appraisal ratings', async () => {
      const res = await request(app).get('/api/v1/reports/performance').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalAppraisals).toBeGreaterThanOrEqual(3);
      expect(res.body.data.records[0]).toHaveProperty('overallAiScore');
    });

    it('9. GET /api/v1/reports/tasks should return sprint tasks and completion rates', async () => {
      const res = await request(app).get('/api/v1/reports/tasks').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalTasks).toBeGreaterThanOrEqual(3);
      expect(res.body.data.summary.completedTasks).toBeGreaterThanOrEqual(2);
      expect(res.body.data.records[0]).toHaveProperty('priority');
    });

    it('10. GET /api/v1/reports/employee-app should return mobile application usage', async () => {
      const res = await request(app).get('/api/v1/reports/employee-app').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalAppUsers).toBeGreaterThanOrEqual(2);
      expect(res.body.data.records[0]).toHaveProperty('deviceType');
    });

    it('11. GET /api/v1/reports/wellness should return health and incentive benefits', async () => {
      const res = await request(app).get('/api/v1/reports/wellness').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.records).toBeInstanceOf(Array);
      expect(res.body.data.records[0]).toHaveProperty('amount');
    });

    it('12. GET /api/v1/reports/events should return company training sessions', async () => {
      const res = await request(app).get('/api/v1/reports/events').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalEvents).toBeGreaterThanOrEqual(2);
      expect(res.body.data.records[0]).toHaveProperty('eventType');
    });
  });

  // ========================================================
  // 2. REPORT FILTERING & SEARCH
  // ========================================================
  describe('Report Filtering Telemetry', () => {
    it('should filter employees by department', async () => {
      const res = await request(app).get('/api/v1/reports/employees?department=Engineering').expect(200);
      expect(res.body.success).toBe(true);
      res.body.data.records.forEach((r: any) => {
        expect(r.department).toBe('Engineering');
      });
    });

    it('should filter tasks by column status', async () => {
      const res = await request(app).get('/api/v1/reports/tasks?status=completed').expect(200);
      expect(res.body.success).toBe(true);
      res.body.data.records.forEach((r: any) => {
        expect(r.column).toBe('completed');
      });
    });

    it('should search tasks by title keyword', async () => {
      const res = await request(app).get('/api/v1/reports/tasks?search=Kubernetes').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.records.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.records[0].title).toContain('Kubernetes');
    });
  });

  // ========================================================
  // 3. UNIFIED EXPORT ENGINE (PDF, CSV, EXCEL)
  // ========================================================
  describe('Report Export Engine (/api/v1/reports/:reportType/export)', () => {
    it('should export employee report as RFC 4180 CSV with BOM', async () => {
      const res = await request(app)
        .get('/api/v1/reports/employees/export?format=csv')
        .expect(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.text).toContain('HUREMASO GLOBAL HRMS - EMPLOYEE MASTER DIRECTORY');
      expect(res.text).toContain('"Sarah Johnson"');
    });

    it('should export tasks report as binary PDF (ISO 32000-1 / PDF-1.4)', async () => {
      const res = await request(app)
        .get('/api/v1/reports/tasks/export?format=pdf')
        .expect(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain('.pdf');
      // Verify PDF binary signature in body
      const isPdf = res.body.toString().startsWith('%PDF-1.4') || res.text.startsWith('%PDF-1.4');
      expect(isPdf).toBe(true);
    });

    it('should export payroll report as Excel-compatible CSV', async () => {
      const res = await request(app)
        .get('/api/v1/reports/payroll/export?format=excel')
        .expect(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('PAYROLL DISBURSAL');
    });

    it('should reject invalid report type with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/v1/reports/nonexistent-report-type/export')
        .expect(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toContain('Unknown report type');
    });
  });

  // ========================================================
  // 4. RECOGNITION STUDIO & APPROVAL WORKFLOW
  // ========================================================
  describe('Recognition Studio & Approvals (/api/v1/analytics/recognition/*)', () => {
    it('GET /api/v1/analytics/recognition/candidates should return candidates with 5-factor scoring breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/recognition/candidates?periodType=month')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);

      const topCandidate = res.body.data[0];
      expect(topCandidate).toHaveProperty('rank');
      expect(topCandidate).toHaveProperty('employeeName');
      expect(topCandidate).toHaveProperty('totalScore');
      expect(topCandidate.scoringBreakdown).toHaveProperty('appraisalScore');
      expect(topCandidate.scoringBreakdown).toHaveProperty('goalScore');
      expect(topCandidate.scoringBreakdown).toHaveProperty('taskScore');
      expect(topCandidate.scoringBreakdown).toHaveProperty('attendanceScore');
      expect(topCandidate.scoringBreakdown).toHaveProperty('contributionScore');
      expect(topCandidate.rank).toBe(1);
    });

    it('POST /api/v1/analytics/recognition/approve should approve and persist a winner to MongoDB', async () => {
      // Get candidates first
      const candRes = await request(app).get('/api/v1/analytics/recognition/candidates?periodType=month');
      const candidate = candRes.body.data[0];

      const approvePayload = {
        periodType: 'month',
        periodLabel: 'June 2026',
        employeeId: candidate.employeeId,
        remarks: 'Exceptional cross-functional execution and zero downtime deployment mastery.',
        approvedBy: 'HR Operations Directorate',
      };

      const res = await request(app)
        .post('/api/v1/analytics/recognition/approve')
        .send(approvePayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.employeeId).toBe(candidate.employeeId);
      expect(res.body.data.periodType).toBe('month');

      // Verify in MongoDB
      const dbRecord = await EmployeeRecognitionModel.findOne({
        periodType: 'month',
        periodLabel: 'June 2026',
      });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.status).toBe('Approved');
    });

    it('POST /api/v1/analytics/recognition/approve should prevent duplicate winner approvals for same period', async () => {
      const candRes = await request(app).get('/api/v1/analytics/recognition/candidates?periodType=month');
      const candidate = candRes.body.data[0];

      const duplicatePayload = {
        periodType: 'month',
        periodLabel: 'June 2026',
        employeeId: candidate.employeeId,
      };

      const res = await request(app)
        .post('/api/v1/analytics/recognition/approve')
        .send(duplicatePayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toContain('already been approved');
    });

    it('GET /api/v1/analytics/recognition/winners should return the persisted winner archive', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/recognition/winners?periodType=month')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].status).toBe('Approved');
    });

    it('GET /api/v1/analytics/employee-of-period should reflect the approved winner', async () => {
      const res = await request(app).get('/api/v1/analytics/employee-of-period').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeOfMonth.status).toBe('Approved');
      expect(res.body.data.hallOfFame).toBeInstanceOf(Array);
    });

    it('GET /api/v1/analytics/employee-of-the-month should return the active month honoree', async () => {
      const res = await request(app).get('/api/v1/analytics/employee-of-the-month').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('employeeName');
      expect(res.body.data).toHaveProperty('ratingScore');
    });

    it('GET /api/v1/analytics/dashboard should return executive dashboard KPIs', async () => {
      const res = await request(app).get('/api/v1/analytics/dashboard').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('kpiCards');
      expect(res.body.data).toHaveProperty('headcountTrend');
    });
  });
});
