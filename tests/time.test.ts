import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';

import { EmployeeModel } from '../src/modules/employee/employee.model';

let mongoServer: MongoMemoryServer;
let testEmployeeId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const emp = await EmployeeModel.create({
    employeeId: 'EMP-001',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    department: 'Engineering',
    jobTitle: 'Senior Software Engineer',
    employmentStatus: 'Full-Time',
    attendanceStatus: 'Present',
    category: 'staff',
    isTerminated: false,
  });
  testEmployeeId = emp._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Time & Attendance Module Integration Tests', () => {
  let createdAttendanceId: string;
  let createdTimesheetId: string;
  let createdOvertimeId: string;
  let createdReplacementId: string;
  let createdLeaveSalaryId: string;
  let createdTimePayrollId: string;

  // 1. ATTENDANCE
  describe('Attendance API (/api/v1/time/attendance)', () => {
    it('should punch in for today', async () => {
      const res = await request(app)
        .post('/api/v1/time/attendance/punch-in')
        .send({
          employeeName: 'Sarah Jenkins',
          department: 'Engineering',
          note: 'Started morning shift',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.punches).toBeDefined();
      expect(res.body.data.status).toBe('Present');
      createdAttendanceId = res.body.data._id || res.body.data.id;
    });

    it('should get current punch status', async () => {
      const res = await request(app).get('/api/v1/time/attendance/punch-status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.punchedIn).toBe(true);
    });

    it('should punch out for today', async () => {
      const res = await request(app)
        .post('/api/v1/time/attendance/punch-out')
        .send({
          note: 'Leaving work',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.punches[0].punchOutTime).toBeDefined();
    });

    it('should get all attendance records', async () => {
      const res = await request(app).get('/api/v1/time/attendance/records');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get and update attendance config', async () => {
      const getRes = await request(app).get('/api/v1/time/attendance/config');
      expect(getRes.status).toBe(200);

      const updateRes = await request(app)
        .put('/api/v1/time/attendance/config')
        .send({
          standardHours: 8,
          breakDuration: 45,
          gracePeriodMinutes: 15,
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.breakDuration).toBe(45);
    });
  });

  // 2. TIMESHEETS
  describe('Timesheet API (/api/v1/time/timesheets)', () => {
    it('should create a timesheet with weekly day hours', async () => {
      const res = await request(app)
        .post('/api/v1/time/timesheets')
        .send({
          periodStartDate: '2026-09-14',
          periodEndDate: '2026-09-20',
          status: 'Submitted',
          rows: [
            {
              projectName: 'ERP Core Migration',
              activity: 'Backend Development',
              monHours: 8,
              tueHours: 8,
              wedHours: 8,
              thuHours: 8,
              friHours: 8,
              satHours: 0,
              sunHours: 0,
              totalHours: 40,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPeriodHours).toBe(40);
      expect(res.body.data.status).toBe('Submitted');
      createdTimesheetId = res.body.data._id || res.body.data.id;
    });

    it('should get all timesheets', async () => {
      const res = await request(app).get('/api/v1/time/timesheets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get timesheet by id', async () => {
      const res = await request(app).get(`/api/v1/time/timesheets/${createdTimesheetId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.rows[0].projectName).toBe('ERP Core Migration');
    });

    it('should approve timesheet status', async () => {
      const res = await request(app)
        .patch(`/api/v1/time/timesheets/${createdTimesheetId}/status`)
        .send({
          status: 'Approved',
          comment: 'All 40 hours verified',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
    });
  });

  // 3. OVERTIME (OT)
  describe('Overtime API (/api/v1/time/overtime)', () => {
    it('should calculate overtime preview', async () => {
      const res = await request(app)
        .post('/api/v1/time/overtime/calculate')
        .send({
          hours: 4,
          multiplier: 1.5,
          baseRate: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.calculatedPayout).toBe(120);
    });

    it('should create overtime request', async () => {
      const res = await request(app)
        .post('/api/v1/time/overtime')
        .send({
          employeeName: 'Alex Rivera',
          department: 'Operations',
          date: '2026-09-18',
          hours: 4,
          multiplier: '1.5x (Weekday OT)',
          hourlyRate: 20,
          reason: 'Emergency server patching',
          status: 'Pending Approval',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(120);
      expect(res.body.data.status).toBe('Pending Approval');
      createdOvertimeId = res.body.data._id || res.body.data.id;
    });

    it('should get overtime metrics', async () => {
      const res = await request(app).get('/api/v1/time/overtime/metrics');
      expect(res.status).toBe(200);
      expect(res.body.data.totalOtHours).toBeGreaterThanOrEqual(4);
    });

    it('should update overtime request status', async () => {
      const res = await request(app)
        .patch(`/api/v1/time/overtime/${createdOvertimeId}/status`)
        .send({
          status: 'Approved',
          approverNotes: 'Approved for payroll',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
    });
  });

  // 4. REPLACEMENT
  describe('Replacement API (/api/v1/time/replacement)', () => {
    it('should create a replacement leave claim', async () => {
      const res = await request(app)
        .post('/api/v1/time/replacement')
        .send({
          employeeName: 'Marcus Chen',
          department: 'Product Design',
          workDate: '2026-09-13',
          claimDate: '2026-09-14',
          hoursWorked: 8,
          daysEarned: 1,
          expiryDate: '2026-12-31',
          reason: 'Weekend deployment coverage',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.daysEarned).toBe(1);
      expect(res.body.data.status).toBe('Approved');
      createdReplacementId = res.body.data._id || res.body.data.id;
    });

    it('should get replacement claims and metrics', async () => {
      const listRes = await request(app).get('/api/v1/time/replacement');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);

      const metricRes = await request(app).get('/api/v1/time/replacement/metrics');
      expect(metricRes.status).toBe(200);
      expect(metricRes.body.data).toBeDefined();
    });
  });

  // 5. LEAVE SALARY
  describe('Leave Salary API (/api/v1/time/leave-salary)', () => {
    it('should calculate leave encashment valuation', async () => {
      const res = await request(app)
        .post('/api/v1/time/leave-salary/calculate')
        .send({
          daysEncashing: 10,
          leaveType: 'Annual Leave',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.daysEncashing).toBe(10);
      expect(res.body.data.totalValuation).toBeGreaterThan(0);
    });

    it('should create a leave salary encashment record', async () => {
      const res = await request(app)
        .post('/api/v1/time/leave-salary')
        .send({
          employeeName: 'Sarah Jenkins',
          department: 'Engineering',
          leaveType: 'Earned Leave (EL)',
          availableBalance: 24,
          daysEncashing: 5,
          dailyRate: 180,
          reason: 'Annual Leave Encashment',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.daysEncashing).toBe(5);
      expect(res.body.data.totalValuation).toBe(900);
      createdLeaveSalaryId = res.body.data._id || res.body.data.id;
    });

    it('should get leave salary metrics and update status', async () => {
      const metricsRes = await request(app).get('/api/v1/time/leave-salary/metrics');
      expect(metricsRes.status).toBe(200);

      const updateRes = await request(app)
        .patch(`/api/v1/time/leave-salary/${createdLeaveSalaryId}/status`)
        .send({
          status: 'Disbursed',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('Disbursed');
    });
  });

  // 6. TIME PAYROLL
  describe('Time Payroll API (/api/v1/time/payroll)', () => {
    it('should get time payroll summary and records', async () => {
      const summaryRes = await request(app).get('/api/v1/time/payroll/summary');
      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.data.totalPayableHoursLogged).toBeDefined();

      const listRes = await request(app).get('/api/v1/time/payroll');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);
    });

    it('should create and export time payroll records', async () => {
      const createRes = await request(app)
        .post('/api/v1/time/payroll')
        .send({
          name: 'Emily Watson',
          dept: 'Quality Assurance',
          daysPresent: 23,
          paidLeave: 0,
          shiftAllowance: '$320',
          shiftAllowanceAmount: 320,
          netAdjustment: '+$4,150',
          status: 'Processed',
        });

      expect(createRes.status).toBe(201);
      createdTimePayrollId = createRes.body.data._id || createRes.body.data.id;

      const exportRes = await request(app).get('/api/v1/time/payroll/export');
      expect(exportRes.status).toBe(200);
      expect(Array.isArray(exportRes.body.data)).toBe(true);
    });
  });

  // 7. TIME REPORTS
  describe('Time Reports API (/api/v1/time/reports)', () => {
    it('should generate project report', async () => {
      const res = await request(app).get('/api/v1/time/reports/project');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projects).toBeDefined();
    });

    it('should generate employee report', async () => {
      const res = await request(app).get('/api/v1/time/reports/employee');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employees).toBeDefined();
    });

    it('should generate attendance summary report', async () => {
      const res = await request(app).get('/api/v1/time/reports/attendance-summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
    });
  });
});
