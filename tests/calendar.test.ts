import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { CalendarEventModel } from '../src/modules/calendar/calendar.model';
import { InterviewModel } from '../src/modules/recruitment/interview/interview.model';
import { HolidayModel } from '../src/modules/employee/leave/leave.model';
import { TaskModel } from '../src/modules/tasks/tasks.model';

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

describe('HUREMASO Calendar Module Complete Integration Tests', () => {
  let createdMeetingId: string;
  let createdInterviewId: string;
  let createdHolidayId: string;
  let createdDeadlineId: string;

  // ================= 1. ALL EVENTS & SEEDING =================
  describe('1. All Events Hub (/api/v1/calendar)', () => {
    it('should initialize and return default seeded corporate events on first load', async () => {
      const res = await request(app).get('/api/v1/calendar/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);

      const allHands = res.body.data.find((e: any) => e.title.includes('All-Hands'));
      expect(allHands).toBeDefined();
      expect(allHands.type).toBe('Meeting');
    });

    it('should search events by keyword across title, location and organizer', async () => {
      const res = await request(app).get('/api/v1/calendar/events?search=All-Hands');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('All-Hands');
    });

    it('should filter events by month (e.g. 2026-09)', async () => {
      const res = await request(app).get('/api/v1/calendar/events?month=2026-09');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ================= 2. MEETINGS MANAGEMENT =================
  describe('2. Meetings Lifecycle (/api/v1/calendar/meetings)', () => {
    it('should schedule a new corporate meeting with agenda and virtual meeting link', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Q4 Product Architecture Sync',
          date: '2026-09-23',
          startTime: '02:00 PM',
          endTime: '03:30 PM',
          type: 'Meeting',
          isOnline: true,
          meetingLink: 'https://zoom.us/j/1122334455',
          agenda: 'Review backend database migration and calendar indexing',
          organizer: 'Sarah Joseph (HR VP)',
          attendees: 12,
          description: 'Quarterly architecture review with technical leads',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Q4 Product Architecture Sync');
      expect(res.body.data.isOnline).toBe(true);
      expect(res.body.data.meetingLink).toContain('zoom.us');
      expect(res.body.data.attendees).toBe(12);

      createdMeetingId = res.body.data.id || res.body.data._id;
    });

    it('should retrieve meeting by specific ID', async () => {
      const res = await request(app).get(`/api/v1/calendar/${createdMeetingId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Q4 Product Architecture Sync');
      expect(res.body.data.agenda).toContain('Review backend database migration');
    });

    it('should reschedule meeting to a new date and time', async () => {
      const res = await request(app)
        .patch(`/api/v1/calendar/${createdMeetingId}/reschedule`)
        .send({
          date: '2026-09-25',
          startTime: '03:00 PM',
          endTime: '04:30 PM',
          notes: 'Rescheduled due to client board meeting conflict',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBe('2026-09-25');
      expect(res.body.data.status).toBe('Rescheduled');
      expect(res.body.data.notes).toContain('client board meeting conflict');
    });

    it('should update meeting status to Completed', async () => {
      const res = await request(app)
        .patch(`/api/v1/calendar/${createdMeetingId}/status`)
        .send({
          status: 'Completed',
          notes: 'Meeting concluded with action points assigned',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Completed');
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('should list all meetings through the /meetings endpoint', async () => {
      const res = await request(app).get('/api/v1/calendar/meetings');

      expect(res.status).toBe(200);
      expect(res.body.data.every((e: any) => e.type.toLowerCase() === 'meeting')).toBe(true);
    });
  });

  // ================= 3. RECRUITMENT INTERVIEWS INTEGRATION =================
  describe('3. Recruitment Interviews Integration (/api/v1/calendar/interviews)', () => {
    it('should schedule an interview directly via the Calendar API', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Senior DevOps Candidate Interview - Carlos Gomez',
          date: '2026-09-27',
          startTime: '11:00 AM',
          endTime: '12:00 PM',
          type: 'Interview',
          candidateName: 'Carlos Gomez',
          interviewerName: 'Michael Chang',
          jobPosition: 'Staff DevOps Engineer',
          roundName: 'Live Cloud Infrastructure Evaluation',
          interviewMode: 'Online',
          meetingLink: 'https://meet.google.com/abc-hure-maso',
          attendees: 3,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.candidateName).toBe('Carlos Gomez');
      expect(res.body.data.jobPosition).toBe('Staff DevOps Engineer');
      expect(res.body.data.interviewMode).toBe('Online');

      createdInterviewId = res.body.data.id || res.body.data._id;
    });

    it('should automatically adapt and display interviews from the Recruitment InterviewModel', async () => {
      // Seed a mock recruitment interview in InterviewModel
      const candidateId = new mongoose.Types.ObjectId();
      const vacancyId = new mongoose.Types.ObjectId();
      await InterviewModel.create({
        candidateId,
        vacancyId,
        roundName: 'Recruitment Deep Dive Panel',
        interviewDate: new Date('2026-09-29T10:00:00Z'),
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        interviewers: [{ name: 'Elena Rostova', email: 'elena@huremaso.com' }],
        interviewType: 'Technical',
        mode: 'Online',
        meetingLink: 'https://meet.google.com/rec-panel-2026',
        status: 'Scheduled',
        notes: 'Recruitment workflow candidate interview',
      });

      // Query calendar interviews
      const res = await request(app).get('/api/v1/calendar/interviews');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const found = res.body.data.find((i: any) => i.title.includes('Recruitment Deep Dive Panel'));
      expect(found).toBeDefined();
      expect(found.source).toBe('recruitment');
      expect(found.interviewerName).toContain('Elena Rostova');
    });
  });

  // ================= 4. HOLIDAYS MANAGEMENT =================
  describe('4. Statutory & Corporate Holidays (/api/v1/calendar/holidays)', () => {
    it('should create a statutory corporate holiday', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Gandhi Jayanti Public Holiday',
          date: '2026-10-02',
          type: 'Holiday',
          holidayType: 'Public',
          applicableScope: 'India Offices',
          repeatsAnnually: true,
          location: 'National Offices',
          attendees: 500,
          description: 'Official national public holiday commemorating Mahatma Gandhi',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Gandhi Jayanti Public Holiday');
      expect(res.body.data.repeatsAnnually).toBe(true);
      expect(res.body.data.applicableScope).toBe('India Offices');

      createdHolidayId = res.body.data.id || res.body.data._id;
    });

    it('should prevent creating a duplicate holiday for the same date and applicable scope', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Gandhi Jayanti Public Holiday',
          date: '2026-10-02',
          type: 'Holiday',
          applicableScope: 'India Offices',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should aggregate leave module HolidayModel records', async () => {
      await HolidayModel.create({
        name: 'Constitution Day Statutory Off',
        date: '2026-11-26',
        dayType: 'Full Day',
        repeatsAnnually: true,
      });

      const res = await request(app).get('/api/v1/calendar/holidays');

      expect(res.status).toBe(200);
      const leaveHoliday = res.body.data.find((h: any) => h.title.includes('Constitution Day'));
      expect(leaveHoliday).toBeDefined();
      expect(leaveHoliday.source).toBe('leave');
    });
  });

  // ================= 5. DEADLINES MANAGEMENT =================
  describe('5. Project & HR Deadlines (/api/v1/calendar/deadlines)', () => {
    it('should create a departmental deadline with priority and assignee', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Annual Statutory Tax Filing (Form 16/24Q)',
          date: '2026-09-30',
          dueTime: '11:59 PM',
          type: 'Deadline',
          priority: 'Urgent',
          department: 'Finance & Payroll',
          assigneeName: 'Payroll Compliance Lead',
          description: 'Quarterly compliance tax deduction returns submission deadline',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toContain('Statutory Tax Filing');
      expect(res.body.data.priority).toBe('Urgent');
      expect(res.body.data.department).toBe('Finance & Payroll');

      createdDeadlineId = res.body.data.id || res.body.data._id;
    });

    it('should aggregate task deadlines from TaskModel', async () => {
      await TaskModel.create({
        title: 'SOC2 Type II Audit Evidence Pack Submission',
        type: 'Compliance',
        dueDate: '2026-09-24',
        column: 'in-progress',
        priority: 'High',
        assigneeName: 'Security Ops Team',
        description: 'Upload access control log bundles for external auditors',
      });

      const res = await request(app).get('/api/v1/calendar/deadlines');

      expect(res.status).toBe(200);
      const taskDeadline = res.body.data.find((d: any) => d.title.includes('SOC2 Type II'));
      expect(taskDeadline).toBeDefined();
      expect(taskDeadline.source).toBe('tasks');
    });
  });

  // ================= 6. UPCOMING EVENTS =================
  describe('6. Upcoming Events (/api/v1/calendar/upcoming)', () => {
    it('should retrieve chronological upcoming events from today onwards', async () => {
      const res = await request(app).get('/api/v1/calendar/upcoming?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ================= 7. DATE & TIME VALIDATIONS =================
  describe('7. Date, Time & Validation Safeguards', () => {
    it('should reject an event with end time earlier than start time', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Invalid Time Paradox Meeting',
          date: '2026-09-25',
          startTime: '04:00 PM',
          endTime: '02:00 PM', // earlier than start!
          type: 'Meeting',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle leap year dates (e.g. 2028-02-29)', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Leap Year Quadrennial Strategy Summit',
          date: '2028-02-29',
          type: 'Meeting',
          location: 'Executive Campus',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.date).toBe('2028-02-29');

      // Cleanup
      await CalendarEventModel.findByIdAndDelete(res.body.data.id || res.body.data._id);
    });

    it('should reject missing required title', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          date: '2026-09-25',
          type: 'Meeting',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ================= 8. EVENT DELETION =================
  describe('8. Event Deletion & Not Found Handling', () => {
    it('should delete a calendar event cleanly', async () => {
      const res = await request(app).delete(`/api/v1/calendar/${createdMeetingId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion in database
      const checkRes = await request(app).get(`/api/v1/calendar/${createdMeetingId}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 Not Found when deleting a non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/calendar/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
