import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import {
  CompanyEventModel,
  SupportEventModel,
  EventsNewsletterModel,
  EventsBudgetModel,
} from '../src/modules/events/event.model';

let mongoServer: MongoMemoryServer;

describe('Events Module E2E Integration Tests', () => {
  let createdEventId: string;
  let createdTaskId: string;
  let createdTicketId: string;
  let createdNewsletterId: string;
  let createdBudgetId: string;

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

  describe('1. Company Events & Operational Task Management', () => {
    it('should create an event with checklist tasks and budget', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({
          title: 'Q4 Annual Strategic Innovation Summit',
          eventType: 'Conference',
          description: 'Company-wide strategic summit and innovation workshop.',
          startDate: '2026-10-15',
          startTime: '09:00 AM',
          endDate: '2026-10-16',
          endTime: '05:00 PM',
          timezone: 'UTC+4 (Dubai)',
          venue: 'Grand Ballroom & Auditorium',
          locationType: 'in-person',
          department: 'Engineering',
          organizer: 'Sarah Jenkins',
          attendeeCount: 120,
          status: 'Up coming',
          budget: {
            allocated: 25000,
            spent: 0,
            status: 'Approved',
          },
          tasks: [
            {
              id: 'TSK-1',
              name: 'Confirm key speakers and presentation decks',
              due: '2026-10-10',
              assignee: 'Alex Morgan',
              status: 'Completed',
              progress: 100,
            },
            {
              id: 'TSK-2',
              name: 'Book audio-visual crew and microphones',
              due: '2026-10-12',
              assignee: 'Sarah Jenkins',
              status: 'In Progress',
              progress: 50,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdEventId = res.body.data._id || res.body.data.id;
      expect(createdEventId).toBeDefined();
      expect(res.body.data.title).toBe('Q4 Annual Strategic Innovation Summit');
      expect(res.body.data.tasks.length).toBe(2);
    });

    it('should fetch events with search and status filtering', async () => {
      const res = await request(app)
        .get('/api/v1/events?search=Innovation&status=Up coming');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Innovation');
    });

    it('should update event status and details', async () => {
      const res = await request(app)
        .patch(`/api/v1/events/${createdEventId}`)
        .send({
          status: 'In Progress',
          attendeeCount: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.attendeeCount).toBe(150);
    });

    it('should add a task to an event and update progress metrics', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${createdEventId}/tasks`)
        .send({
          name: 'Arrange catering and VIP lunch buffet',
          due: '2026-10-14',
          assignee: 'Catering Lead',
          status: 'In Progress',
          priority: 'High',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBe(3);
      createdTaskId = res.body.data.tasks[2].id;
      expect(createdTaskId).toBeDefined();
    });

    it('should update a task in an event to Completed and dynamically recalculate progress', async () => {
      const res = await request(app)
        .patch(`/api/v1/events/${createdEventId}/tasks/${createdTaskId}`)
        .send({
          status: 'Completed',
          progress: 100,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const targetTask = res.body.data.tasks.find((t: any) => t.id === createdTaskId);
      expect(targetTask.status).toBe('Completed');
      expect(res.body.data.progress).toContain('Task');
    });

    it('should delete a task from an event', async () => {
      const res = await request(app)
        .delete(`/api/v1/events/${createdEventId}/tasks/${createdTaskId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const found = res.body.data.tasks.find((t: any) => t.id === createdTaskId);
      expect(found).toBeUndefined();
    });
  });

  describe('2. Support Events (Ticket & Conversation Management)', () => {
    it('should create a support event ticket with all required details', async () => {
      const res = await request(app)
        .post('/api/v1/events/support')
        .send({
          title: 'Projector HDMI Audio Cutout in Room 302',
          category: 'AV & Tech',
          priority: 'High',
          author: 'David Vance',
          requesterEmail: 'david.v@company.com',
          department: 'Engineering',
          assignedAgent: 'Tech Operations Lead',
          description: 'The projector keeps losing audio sync during executive training playback.',
          status: 'Open',
          timeAgo: 'Just now',
          replaysCount: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdTicketId = res.body.data._id || res.body.data.id;
      expect(createdTicketId).toBeDefined();
      expect(res.body.data.category).toBe('AV & Tech');
      expect(res.body.data.priority).toBe('High');
    });

    it('should fetch all support events', async () => {
      const res = await request(app).get('/api/v1/events/support');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should add a reply to a support ticket and update status', async () => {
      const res = await request(app)
        .patch(`/api/v1/events/support/${createdTicketId}`)
        .send({
          status: 'In Progress',
          reply: {
            author: 'Tech Operations Lead',
            text: 'Replaced the faulty HDMI 2.1 cable and updated the audio receiver firmware. Testing complete.',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.replies.length).toBe(1);
      expect(res.body.data.replies[0].author).toBe('Tech Operations Lead');
      expect(res.body.data.replaysCount).toBe(1);
    });

    it('should mark a ticket resolved and allow reopening', async () => {
      // Mark Resolved
      const res1 = await request(app)
        .patch(`/api/v1/events/support/${createdTicketId}`)
        .send({ status: 'Resolved' });
      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('Resolved');

      // Reopen
      const res2 = await request(app)
        .patch(`/api/v1/events/support/${createdTicketId}`)
        .send({ status: 'Open' });
      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('Open');
    });
  });

  describe('3. Events Newsletter & Announcements Management', () => {
    it('should create and broadcast a newsletter issue', async () => {
      const res = await request(app)
        .post('/api/v1/events/newsletters')
        .send({
          title: 'Q3 Hackathon Highlights & Team Winners',
          category: 'Company Events',
          publishDate: '2026-09-30',
          author: 'HR Communications Team',
          summary: 'Celebrating the incredible prototypes built during our 48-hour internal hackathon.',
          reads: 10,
          likes: 2,
          status: 'Published',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdNewsletterId = res.body.data._id || res.body.data.id;
      expect(createdNewsletterId).toBeDefined();
      expect(res.body.data.reads).toBe(10);
    });

    it('should increment article reads on viewing', async () => {
      const res = await request(app)
        .post(`/api/v1/events/newsletters/${createdNewsletterId}/read`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reads).toBe(11);
    });

    it('should toggle like on a newsletter issue', async () => {
      // First like with employeeId
      const res1 = await request(app)
        .post(`/api/v1/events/newsletters/${createdNewsletterId}/like`)
        .send({ employeeId: 'EMP-001' });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.likes).toBe(3);

      // Second like with same employeeId unlikes
      const res2 = await request(app)
        .post(`/api/v1/events/newsletters/${createdNewsletterId}/like`)
        .send({ employeeId: 'EMP-001' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.likes).toBe(2);
    });

    it('should support scheduling a newsletter for future broadcast', async () => {
      const res = await request(app)
        .post('/api/v1/events/newsletters')
        .send({
          title: 'Upcoming Winter Holiday Party Invitations',
          category: 'Social Events',
          publishDate: 'TBD',
          scheduleDate: '2026-12-01',
          author: 'Culture Committee',
          summary: 'Save the date for the annual Winter Gala at the St. Regis Ballroom.',
          status: 'Scheduled',
          reads: 0,
          likes: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('Scheduled');
      expect(res.body.data.scheduleDate).toBe('2026-12-01');
    });
  });

  describe('4. Event Budget & Expense Planning', () => {
    it('should create an event budget allocation', async () => {
      const res = await request(app)
        .post('/api/v1/events/budgets')
        .send({
          eventName: 'Leadership Development Workshop 2026',
          category: 'Venue & Catering',
          allocated: 15000,
          spent: 0,
          status: 'Pending Review',
          owner: 'Sarah Joseph',
          department: 'Leadership',
          expenses: [],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdBudgetId = res.body.data._id || res.body.data.id;
      expect(createdBudgetId).toBeDefined();
      expect(res.body.data.allocated).toBe(15000);
      expect(res.body.data.spent).toBe(0);
    });

    it('should record an actual expense and automatically update spent summation', async () => {
      const res = await request(app)
        .post(`/api/v1/events/budgets/${createdBudgetId}/expenses`)
        .send({
          description: 'Catering and Executive Refreshments',
          category: 'Venue & Catering',
          amount: 4500,
          date: '2026-10-15',
          vendor: 'Gourmet Caterers LLC',
          recordedBy: 'Finance Analyst',
          status: 'Approved',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.expenses.length).toBe(1);
      expect(res.body.data.spent).toBe(4500);
      expect(res.body.data.status).toBe('Pending Review');
    });

    it('should update approval workflow status to Approved', async () => {
      const res = await request(app)
        .patch(`/api/v1/events/budgets/${createdBudgetId}`)
        .send({ status: 'Approved' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
    });

    it('should flag status as Over Budget when expenses exceed allocation', async () => {
      const res = await request(app)
        .post(`/api/v1/events/budgets/${createdBudgetId}/expenses`)
        .send({
          description: 'Luxury Executive Transport Fleet',
          category: 'Travel & Accommodation',
          amount: 12000, // 4500 + 12000 = 16500 > 15000
          date: '2026-10-16',
          vendor: 'Chauffeur VIP Services',
          recordedBy: 'Finance Lead',
          status: 'Approved',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.spent).toBe(16500);
      expect(res.body.data.status).toBe('Over Budget');
    });

    it('should return aggregated summary statistics for the events module', async () => {
      const res = await request(app).get('/api/v1/events/stats/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalEvents).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalSupportEvents ?? res.body.data.totalSupportTickets).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalNewsletters).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalBudgets ?? res.body.data.totalBudgetPool).toBeGreaterThanOrEqual(1);
    });
  });
});
