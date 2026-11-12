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

describe('Calendar, Notes, and Tasks Integration Tests', () => {
  let createdEventId: string;
  let createdNoteId: string;
  let createdTaskId: string;
  let createdTodoId: string;

  // 1. CALENDAR
  describe('Calendar API (/api/v1/calendar)', () => {
    it('should create a new corporate event', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .send({
          title: 'Q4 Product Roadmap Alignment',
          date: '2026-09-22',
          time: '11:00 AM - 12:30 PM',
          type: 'Meeting',
          location: 'Conference Room Alpha & Zoom',
          attendees: 18,
          description: 'Quarterly roadmap priorities and feature demo sync',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Q4 Product Roadmap Alignment');
      expect(res.body.data.attendees).toBe(18);
      createdEventId = res.body.data._id || res.body.data.id;
    });

    it('should get all calendar events with default seeding', async () => {
      const res = await request(app).get('/api/v1/calendar/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter calendar events by type', async () => {
      const res = await request(app).get('/api/v1/calendar/events?type=Meeting');
      expect(res.status).toBe(200);
      expect(res.body.data.every((e: any) => e.type.toLowerCase() === 'meeting')).toBe(true);
    });

    it('should get calendar event by ID', async () => {
      const res = await request(app).get(`/api/v1/calendar/${createdEventId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Q4 Product Roadmap Alignment');
    });

    it('should update calendar event', async () => {
      const res = await request(app)
        .put(`/api/v1/calendar/${createdEventId}`)
        .send({
          location: 'Executive Boardroom',
          attendees: 25,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.location).toBe('Executive Boardroom');
      expect(res.body.data.attendees).toBe(25);
    });

    it('should delete calendar event', async () => {
      const res = await request(app).delete(`/api/v1/calendar/${createdEventId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // 2. NOTES
  describe('Notes API (/api/v1/notes)', () => {
    it('should create a new HR note', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          title: 'Remote Work Ergonomics Allowance Policy',
          category: 'HR Policy',
          content: 'Full-time remote engineers are eligible for a $500 home office ergonomics setup subsidy.',
          pinned: true,
          tags: ['policy', 'remote-work', 'benefits'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Remote Work Ergonomics Allowance Policy');
      expect(res.body.data.pinned).toBe(true);
      createdNoteId = res.body.data._id || res.body.data.id;
    });

    it('should get all notes including default seeded items', async () => {
      const res = await request(app).get('/api/v1/notes');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter notes by category', async () => {
      const res = await request(app).get('/api/v1/notes?category=HR%20Policy');
      expect(res.status).toBe(200);
      expect(res.body.data.every((n: any) => n.category === 'HR Policy')).toBe(true);
    });

    it('should toggle note pinned status', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${createdNoteId}/pin`)
        .send({ pinned: false });

      expect(res.status).toBe(200);
      expect(res.body.data.pinned).toBe(false);
    });

    it('should generate AI summary for note', async () => {
      const res = await request(app).post(`/api/v1/notes/${createdNoteId}/ai-summarize`);
      expect(res.status).toBe(200);
      expect(res.body.data.summary).toBeDefined();
    });

    it('should update and delete note', async () => {
      const updateRes = await request(app)
        .put(`/api/v1/notes/${createdNoteId}`)
        .send({ title: 'Updated Ergonomics Policy 2026' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe('Updated Ergonomics Policy 2026');

      const delRes = await request(app).delete(`/api/v1/notes/${createdNoteId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
    });
  });

  // 3. TASKS (KANBAN)
  describe('Task Management API (/api/v1/tasks)', () => {
    it('should create a new kanban task', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Implement Multi-Factor Auth for Admin Console',
          type: 'Technical',
          dueDate: 'Dec 18',
          column: 'new-task',
          priority: 'High',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Implement Multi-Factor Auth for Admin Console');
      expect(res.body.data.column).toBe('new-task');
      createdTaskId = res.body.data._id || res.body.data.id;
    });

    it('should get all tasks including default seeded tasks', async () => {
      const res = await request(app).get('/api/v1/tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should move task between columns', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}/move`)
        .send({ column: 'in-progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.column).toBe('in-progress');
    });

    it('should update and delete task', async () => {
      const updateRes = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .send({ priority: 'Urgent' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.priority).toBe('Urgent');

      const delRes = await request(app).delete(`/api/v1/tasks/${createdTaskId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
    });
  });

  // 4. TODOS
  describe('Todo List API (/api/v1/tasks/todos)', () => {
    it('should create a new todo item', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/todos')
        .send({
          title: 'Sign and stamp executive confidentiality agreements',
          category: 'Compliance',
          dueDate: 'Today',
          completed: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Sign and stamp executive confidentiality agreements');
      expect(res.body.data.completed).toBe(false);
      createdTodoId = res.body.data._id || res.body.data.id;
    });

    it('should get all todo items', async () => {
      const res = await request(app).get('/api/v1/tasks/todos');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should toggle todo item completion', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/todos/${createdTodoId}/toggle`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('should delete todo item', async () => {
      const delRes = await request(app).delete(`/api/v1/tasks/todos/${createdTodoId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
    });
  });
});
