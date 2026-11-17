import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { TaskModel, TodoModel } from '../src/modules/tasks/tasks.model';

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

describe('HUREMASO Tasks & Todo Module Complete Integration Tests', () => {
  let createdTaskId: string;
  let createdTodoId: string;

  // ================= 1. KANBAN TASKS HUB & DEFAULT SEEDING =================
  describe('1. Kanban Tasks Hub & Default Seeding (/api/v1/tasks)', () => {
    it('should initialize and return default seeded enterprise tasks across all columns', async () => {
      const res = await request(app).get('/api/v1/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(9);

      // Verify presence of all 4 columns in seeded records
      const columns = res.body.data.map((t: any) => t.column);
      expect(columns).toContain('new-task');
      expect(columns).toContain('scheduled');
      expect(columns).toContain('in-progress');
      expect(columns).toContain('completed');
    });

    it('should retrieve task column counts breakdown via /counts', async () => {
      const res = await request(app).get('/api/v1/tasks/counts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(9);
      expect(res.body.data.newTask).toBeGreaterThanOrEqual(3);
      expect(res.body.data.scheduled).toBeGreaterThanOrEqual(2);
      expect(res.body.data.inProgress).toBeGreaterThanOrEqual(2);
      expect(res.body.data.completed).toBeGreaterThanOrEqual(2);
    });

    it('should filter tasks by column', async () => {
      const res = await request(app).get('/api/v1/tasks?column=in-progress');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.every((t: any) => t.column === 'in-progress')).toBe(true);
    });

    it('should search tasks by title and description', async () => {
      const res = await request(app).get('/api/v1/tasks?search=Calculus');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Calculus');
    });

    it('should filter tasks by type', async () => {
      const res = await request(app).get('/api/v1/tasks?type=Technical');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.every((t: any) => t.type === 'Technical')).toBe(true);
    });
  });

  // ================= 2. TASK CREATION, ASSIGNMENT & LIFECYCLE =================
  describe('2. Task Creation, Assignment & Lifecycle (/api/v1/tasks)', () => {
    it('should create a new task with employee assignment and priority', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Implement Multi-Region VPC Peering for Database Cluster',
          type: 'Technical',
          column: 'new-task',
          priority: 'Urgent',
          dueDate: '2026-12-28',
          startDate: '2026-12-20',
          assigneeName: 'Marcus Vance',
          description: 'Establish low-latency peering connections across AWS us-east-1 and eu-central-1.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Implement Multi-Region VPC Peering for Database Cluster');
      expect(res.body.data.priority).toBe('Urgent');
      expect(res.body.data.column).toBe('new-task');
      expect(res.body.data.assigneeName).toBe('Marcus Vance');

      createdTaskId = res.body.data.id || res.body.data._id;
    });

    it('should fetch task by ID', async () => {
      const res = await request(app).get(`/api/v1/tasks/${createdTaskId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Multi-Region VPC Peering');
      expect(res.body.data.priority).toBe('Urgent');
    });

    it('should update task details via PUT /:id', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .send({
          title: 'Implement Multi-Region VPC Peering & Transit Gateway',
          priority: 'High',
          dueDate: '2026-12-30',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Transit Gateway');
      expect(res.body.data.priority).toBe('High');
      expect(res.body.data.dueDate).toBe('2026-12-30');
    });

    it('should move task to in-progress column via PATCH /:id/move', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}/move`)
        .send({ column: 'in-progress' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.column).toBe('in-progress');
    });

    it('should move task to completed and set completedAt timestamp', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}/move`)
        .send({ column: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data.column).toBe('completed');
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('should reject task creation with empty title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: '   ',
          type: 'Operational',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should delete task cleanly and return 404 on subsequent get', async () => {
      const delRes = await request(app).delete(`/api/v1/tasks/${createdTaskId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const getRes = await request(app).get(`/api/v1/tasks/${createdTaskId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/tasks/${nonExistentId}`);
      expect(res.status).toBe(404);
    });
  });

  // ================= 3. TODO LIST & DAILY COMPLETION =================
  describe('3. Todo List & Daily Completion Statistics (/api/v1/tasks/todos)', () => {
    it('should initialize and return default seeded enterprise todos', async () => {
      const res = await request(app).get('/api/v1/tasks/todos');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);

      const categories = res.body.data.map((t: any) => t.category);
      expect(categories).toContain('Payroll');
      expect(categories).toContain('Off-Boarding');
      expect(categories).toContain('Events');
      expect(categories).toContain('Compliance');
    });

    it('should dynamically calculate daily todo completion statistics via /todos/stats', async () => {
      const res = await request(app).get('/api/v1/tasks/todos/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(5);
      expect(res.body.data.completed).toBeGreaterThanOrEqual(3);
      expect(res.body.data.percentage).toBeGreaterThanOrEqual(60);
      expect(res.body.data.pending).toBe(res.body.data.total - res.body.data.completed);
    });

    it('should create a new todo item with category, due date, and priority', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/todos')
        .send({
          title: 'Review and sign off on FY26 Employee Health Insurance Renewal',
          category: 'Compliance',
          completed: false,
          dueDate: 'Tomorrow',
          priority: 'Urgent',
          description: 'Ensure comprehensive coverage policies across global regional offices.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Health Insurance Renewal');
      expect(res.body.data.category).toBe('Compliance');
      expect(res.body.data.completed).toBe(false);

      createdTodoId = res.body.data.id || res.body.data._id;
    });

    it('should fetch todo by ID', async () => {
      const res = await request(app).get(`/api/v1/tasks/todos/${createdTodoId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Health Insurance');
      expect(res.body.data.category).toBe('Compliance');
    });

    it('should toggle todo item completion status and record timestamp', async () => {
      // Toggle to completed
      const res1 = await request(app)
        .patch(`/api/v1/tasks/todos/${createdTodoId}/toggle`)
        .send({ completed: true });

      expect(res1.status).toBe(200);
      expect(res1.body.data.completed).toBe(true);
      expect(res1.body.data.completedAt).toBeDefined();

      // Toggle back to pending
      const res2 = await request(app)
        .patch(`/api/v1/tasks/todos/${createdTodoId}/toggle`)
        .send({ completed: false });

      expect(res2.status).toBe(200);
      expect(res2.body.data.completed).toBe(false);
      expect(res2.body.data.completedAt).toBeNull();
    });

    it('should update todo details via PUT /todos/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/todos/${createdTodoId}`)
        .send({
          title: 'Review and sign off on FY26 Employee Health & Dental Renewal',
          category: 'Payroll',
          priority: 'High',
          dueDate: 'Today',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Dental');
      expect(res.body.data.category).toBe('Payroll');
      expect(res.body.data.dueDate).toBe('Today');
    });

    it('should filter todos by category', async () => {
      const res = await request(app).get('/api/v1/tasks/todos?category=Off-Boarding');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.every((t: any) => t.category.toLowerCase() === 'off-boarding')).toBe(true);
    });

    it('should search todos by keyword', async () => {
      const res = await request(app).get('/api/v1/tasks/todos?search=YubiKey');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('YubiKey');
    });

    it('should reject todo creation with empty title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks/todos')
        .send({
          title: '   ',
          category: 'General',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should delete todo item cleanly', async () => {
      const delRes = await request(app).delete(`/api/v1/tasks/todos/${createdTodoId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const getRes = await request(app).get(`/api/v1/tasks/todos/${createdTodoId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/tasks/todos/${nonExistentId}`);
      expect(res.status).toBe(404);
    });
  });
});
