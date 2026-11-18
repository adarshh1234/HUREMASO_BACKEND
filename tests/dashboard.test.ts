import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { BuzzPostModel } from '../src/modules/dashboard/buzz/buzzPost.model';
import { EmployeeModel } from '../src/modules/employee/employee.model';
import { AttendanceModel } from '../src/modules/time/attendance/attendance.model';
import { LeaveRequestModel } from '../src/modules/employee/leave/leave.model';
import { CandidateModel } from '../src/modules/recruitment/candidate/candidate.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Promise.all([
    BuzzPostModel.deleteMany({}),
    EmployeeModel.deleteMany({}),
    AttendanceModel.deleteMany({}),
    LeaveRequestModel.deleteMany({}),
    CandidateModel.deleteMany({}),
  ]);
});

afterAll(async () => {
  await Promise.all([
    BuzzPostModel.deleteMany({}),
    EmployeeModel.deleteMany({}),
    AttendanceModel.deleteMany({}),
    LeaveRequestModel.deleteMany({}),
    CandidateModel.deleteMany({}),
  ]);
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('HUREMASO HRMS - Dashboard Module Integration Tests', () => {
  let createdBuzzId: string;

  // ─── 1. SEED DATA ──────────────────────────────────────────────────────────
  describe('Setup Test Entities', () => {
    it('should seed test employees with various departments and locations', async () => {
      await EmployeeModel.create([
        {
          employeeId: 'EMP001',
          firstName: 'Sarah',
          lastName: 'Joseph',
          name: 'Sarah Joseph',
          email: 'sarah.joseph@huremaso.com',
          workEmail: 'sarah.joseph@huremaso.com',
          department: 'Engineering',
          subUnit: 'Texas R&D',
          jobTitle: 'VP of Technology',
          employmentStatus: 'Full-Time',
          location: 'Texas HQ',
        },
        {
          employeeId: 'EMP002',
          firstName: 'Michael',
          lastName: 'Chen',
          name: 'Michael Chen',
          email: 'michael.chen@huremaso.com',
          workEmail: 'michael.chen@huremaso.com',
          department: 'Engineering',
          subUnit: 'Texas R&D',
          jobTitle: 'Senior Designer',
          employmentStatus: 'Full-Time',
          location: 'California Branch',
        },
        {
          employeeId: 'EMP003',
          firstName: 'Emily',
          lastName: 'Davis',
          name: 'Emily Davis',
          email: 'emily.davis@huremaso.com',
          workEmail: 'emily.davis@huremaso.com',
          department: 'Human Resources',
          subUnit: 'HR Operations',
          jobTitle: 'HR Director',
          employmentStatus: 'Full-Time',
          location: 'Texas HQ',
        },
      ]);

      const count = await EmployeeModel.countDocuments();
      expect(count).toBe(3);
    });

    it('should seed an active approved leave for today', async () => {
      const today = new Date();
      const fromDate = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const toDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await LeaveRequestModel.create({
        employeeName: 'Michael Chen',
        department: 'Engineering',
        leaveType: 'Vacation',
        fromDate,
        toDate,
        numberOfDays: 3,
        status: 'Approved',
        comments: 'Family trip',
      });

      const count = await LeaveRequestModel.countDocuments();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should seed candidate records for recruitment pipeline actions', async () => {
      await CandidateModel.create({
        firstName: 'Alex',
        lastName: 'Taylor',
        name: 'Alex Taylor',
        email: 'alex.taylor@example.com',
        phone: '1234567890',
        status: 'Interview Scheduled',
        vacancy: 'Senior React Developer',
      });

      const count = await CandidateModel.countDocuments();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 2. TIME AT WORK WIDGET & CLOCK IN / OUT ───────────────────────────────
  describe('2. Time at Work Widget & Attendance Actions', () => {
    it('should retrieve time at work metrics for an employee', async () => {
      const res = await request(app).get('/api/v1/dashboard/time-at-work?employeeId=EMP001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('todayFormattedTime');
      expect(res.body.data).toHaveProperty('statusText');
      expect(res.body.data).toHaveProperty('weeklyHours');
      expect(Array.isArray(res.body.data.weeklyHours)).toBe(true);
      expect(res.body.data.weeklyHours.length).toBe(7);
    });

    it('should clock in successfully and transition status to Punched In', async () => {
      const res = await request(app)
        .post('/api/v1/dashboard/time-at-work/clock-in')
        .send({
          employeeId: 'EMP001',
          employeeName: 'Sarah Joseph',
          note: 'Morning shift start',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('statusText');
      expect(res.body.data.statusText).toBe('Punched In');

      // Verify widget reflects Punched In
      const widgetRes = await request(app).get('/api/v1/dashboard/time-at-work?employeeId=EMP001');
      expect(widgetRes.status).toBe(200);
      expect(widgetRes.body.data.statusText).toBe('Punched In');
    });

    it('should clock out successfully and transition status to Punched Out', async () => {
      const res = await request(app)
        .post('/api/v1/dashboard/time-at-work/clock-out')
        .send({
          employeeId: 'EMP001',
          note: 'End of work day',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('statusText');
      expect(res.body.data.statusText).toBe('Punched Out');

      // Verify widget reflects Punched Out
      const widgetRes = await request(app).get('/api/v1/dashboard/time-at-work?employeeId=EMP001');
      expect(widgetRes.status).toBe(200);
      expect(widgetRes.body.data.statusText).toBe('Punched Out');
    });
  });

  // ─── 3. WORKFORCE DISTRIBUTIONS ───────────────────────────────────────────
  describe('3. Employee Distributions by Sub Unit & Location', () => {
    it('should aggregate employee distribution by sub unit (department)', async () => {
      const res = await request(app).get('/api/v1/dashboard/employee-distribution/sub-unit');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const subUnitItem = res.body.data.find((item: any) => item.name.includes('Texas') || item.name.includes('HR'));
      expect(subUnitItem).toBeDefined();
    });

    it('should aggregate employee distribution by location', async () => {
      const res = await request(app).get('/api/v1/dashboard/employee-distribution/location');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const locationItem = res.body.data.find((item: any) => item.name.includes('Texas') || item.name.includes('California'));
      expect(locationItem).toBeDefined();
    });
  });

  // ─── 4. EMPLOYEES ON LEAVE TODAY ──────────────────────────────────────────
  describe('4. Employees on Leave Today', () => {
    it('should return approved employees on leave covering current day', async () => {
      const res = await request(app).get('/api/v1/dashboard/employees-on-leave');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const michael = res.body.data.find((item: any) => item.name === 'Michael Chen' || item.employeeName === 'Michael Chen');
      expect(michael).toBeDefined();
    });
  });

  // ─── 5. BUZZ LATEST POSTS CRUD ─────────────────────────────────────────────
  describe('5. Buzz Latest Posts CRUD Operations', () => {
    it('should create a new buzz post', async () => {
      const res = await request(app)
        .post('/api/v1/dashboard/buzz')
        .send({
          title: 'Welcome New Team Members!',
          content: 'Hello everyone! Please welcome our new engineers joining the platform team this sprint.',
          type: 'announcement',
          author: 'Sarah Joseph',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Welcome New Team Members!');
      expect(res.body.data.author).toBe('Sarah Joseph');

      createdBuzzId = res.body.data.id;
    });

    it('should retrieve all buzz posts including the newly created post', async () => {
      const res = await request(app).get('/api/v1/dashboard/buzz');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.find((p: any) => p.id === createdBuzzId || p.title === 'Welcome New Team Members!');
      expect(found).toBeDefined();
    });

    it('should update an existing buzz post', async () => {
      const res = await request(app)
        .patch(`/api/v1/dashboard/buzz/${createdBuzzId}`)
        .send({
          title: 'Welcome New Engineers & Designers!',
          content: 'Updated post: Welcome both new engineers and designers joining our engineering team!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Welcome New Engineers & Designers!');
    });

    it('should delete a buzz post', async () => {
      const res = await request(app).delete(`/api/v1/dashboard/buzz/${createdBuzzId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const checkRes = await request(app).get('/api/v1/dashboard/buzz');
      const found = checkRes.body.data.find((p: any) => p.id === createdBuzzId);
      expect(found).toBeUndefined();
    });
  });

  // ─── 6. MY ACTIONS DYNAMIC METRICS ─────────────────────────────────────────
  describe('6. My Actions Dynamic Metrics', () => {
    it('should calculate pending self reviews, candidates to interview, and timesheets to approve', async () => {
      const res = await request(app).get('/api/v1/dashboard/my-actions');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pendingSelfReviews');
      expect(res.body.data).toHaveProperty('candidatesToInterview');
      expect(res.body.data).toHaveProperty('timesheetsToApprove');
      expect(res.body.data.candidatesToInterview).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 7. RECENT ACTIVITY FEED ───────────────────────────────────────────────
  describe('7. Recent Activity Feed', () => {
    it('should aggregate recent activities across leaves, candidates, and company posts', async () => {
      const res = await request(app).get('/api/v1/dashboard/recent-activity');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const firstItem = res.body.data[0];
      expect(firstItem).toHaveProperty('title');
      expect(firstItem).toHaveProperty('description');
      expect(firstItem).toHaveProperty('timeAgo');
    });
  });

  // ─── 8. DASHBOARD OVERVIEW & SUMMARY ───────────────────────────────────────
  describe('8. Comprehensive Dashboard Overview & Summary', () => {
    it('should return aggregated overview data for the entire dashboard', async () => {
      const res = await request(app).get('/api/v1/dashboard/overview');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('timeAtWork');
      expect(res.body.data).toHaveProperty('workforce');
      expect(res.body.data.workforce).toHaveProperty('subUnitDistribution');
      expect(res.body.data.workforce).toHaveProperty('locationDistribution');
      expect(res.body.data).toHaveProperty('attendanceLeave');
      expect(res.body.data).toHaveProperty('buzzPosts');
      expect(res.body.data).toHaveProperty('myActions');
      expect(res.body.data).toHaveProperty('recentActivities');
    });

    it('should return summary metrics across all HRMS domains', async () => {
      const res = await request(app).get('/api/v1/dashboard/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalEmployees');
      expect(res.body.data).toHaveProperty('todayPresents');
      expect(res.body.data).toHaveProperty('todayAbsence');
      expect(res.body.data).toHaveProperty('onLeaveToday');
      expect(res.body.data).toHaveProperty('pendingActionsTotal');
    });
  });
});
