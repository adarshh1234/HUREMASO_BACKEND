import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { NotificationModel } from '../src/modules/notification/notification.model';
import {
  NotificationChannel,
  NotificationStatus,
  RecipientType,
  DeliveryStatus,
} from '../src/modules/notification/notification.types';
import { providerRegistry } from '../src/modules/notification/providers/index';
import { EmployeeModel } from '../src/modules/employee/employee.model';
import { DepartmentModel } from '../src/modules/admin/jobConfig/department.model';

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

beforeEach(async () => {
  await NotificationModel.deleteMany({});
  await EmployeeModel.deleteMany({});
  await DepartmentModel.deleteMany({});
  jest.restoreAllMocks();

  // Seed sample employees for dynamic recipient management tests
  await DepartmentModel.create([
    { name: 'Engineering', code: 'ENG', employeeCount: 2 },
    { name: 'Human Resources', code: 'HR', employeeCount: 1 },
  ]);

  await EmployeeModel.create([
    {
      employeeId: 'EMP-001',
      firstName: 'Alice',
      lastName: 'Smith',
      name: 'Alice Smith',
      email: 'alice.smith@company.com',
      phone: '+15551234567',
      department: 'Engineering',
      isTerminated: false,
    },
    {
      employeeId: 'EMP-002',
      firstName: 'Bob',
      lastName: 'Jones',
      name: 'Bob Jones',
      email: 'bob.jones@company.com',
      phone: '', // missing phone for SMS/WhatsApp validation test
      department: 'Engineering',
      isTerminated: false,
    },
    {
      employeeId: 'EMP-003',
      firstName: 'Carol',
      lastName: 'Taylor',
      name: 'Carol Taylor',
      email: 'invalid-email-address', // invalid email for EMAIL validation test
      phone: '+15559876543',
      department: 'Human Resources',
      isTerminated: false,
    },
  ]);
});

describe('Notification Backend API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 UP and database connected status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.database.isConnected).toBe(true);
    });
  });

  describe('GET /api/v1/notifications/recipients (Dynamic Recipient Management)', () => {
    it('should return dynamic active employees and validate email addresses for EMAIL channel', async () => {
      const res = await request(app).get('/api/v1/notifications/recipients?channel=EMAIL');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employees).toHaveLength(3);
      expect(res.body.data.summary.totalEmployees).toBe(3);
      // Alice and Bob have valid emails; Carol has invalid email
      expect(res.body.data.summary.validCount).toBe(2);
      expect(res.body.data.summary.invalidCount).toBe(1);

      const carol = res.body.data.employees.find((e: any) => e.employeeId === 'EMP-003');
      expect(carol.isValidForChannel).toBe(false);
      expect(carol.validationError).toContain('email');
    });

    it('should validate phone numbers for SMS channel', async () => {
      const res = await request(app).get('/api/v1/notifications/recipients?channel=SMS');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Alice and Carol have phones; Bob has empty phone
      expect(res.body.data.summary.validCount).toBe(2);
      expect(res.body.data.summary.invalidCount).toBe(1);

      const bob = res.body.data.employees.find((e: any) => e.employeeId === 'EMP-002');
      expect(bob.isValidForChannel).toBe(false);
      expect(bob.validationError).toContain('phone');
    });

    it('should validate contact for WhatsApp and Employee App channels', async () => {
      const waRes = await request(app).get('/api/v1/notifications/recipients?channel=WHATSAPP');
      expect(waRes.status).toBe(200);
      expect(waRes.body.data.summary.validCount).toBe(2);

      const appRes = await request(app).get('/api/v1/notifications/recipients?channel=EMPLOYEE_APP');
      expect(appRes.status).toBe(200);
      // All 3 are active employees
      expect(appRes.body.data.summary.validCount).toBe(3);
      expect(appRes.body.data.summary.invalidCount).toBe(0);
    });
  });

  describe('POST /api/v1/notifications (Create)', () => {
    it('should create a DRAFT notification with valid payload', async () => {
      const payload = {
        channel: NotificationChannel.EMAIL,
        subject: 'Monthly Newsletter',
        message: 'Welcome to the new month!',
        recipients: 'All Employees',
        recipientType: RecipientType.ALL_EMPLOYEES,
      };

      const res = await request(app).post('/api/v1/notifications').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.subject).toBe(payload.subject);
      expect(res.body.data.status).toBe(NotificationStatus.DRAFT);
    });

    it('should ALWAYS create status DRAFT even if client sends status: SENT', async () => {
      const provider = providerRegistry.getProvider(NotificationChannel.EMAIL);
      const sendSpy = jest.spyOn(provider, 'send');

      const res = await request(app).post('/api/v1/notifications').send({
        channel: NotificationChannel.EMAIL,
        subject: 'Forced Sent Creation',
        message: 'Should still be draft',
        recipients: 'All Employees',
        status: NotificationStatus.SENT,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe(NotificationStatus.DRAFT);
      // Provider send MUST NOT be called during creation
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should persist employee recipient IDs correctly', async () => {
      const payload = {
        channel: NotificationChannel.SMS,
        message: 'Direct message to employees',
        recipients: '2 Selected Employee(s)',
        recipientType: RecipientType.EMPLOYEES,
        employeeIds: ['EMP-001', 'EMP-002'],
      };

      const res = await request(app).post('/api/v1/notifications').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.recipientType).toBe(RecipientType.EMPLOYEES);
      expect(res.body.data.employeeIds).toEqual(['EMP-001', 'EMP-002']);
    });

    it('should persist department recipient IDs correctly', async () => {
      const payload = {
        channel: NotificationChannel.WHATSAPP,
        message: 'Department announcement',
        recipients: 'Engineering, Human Resources',
        recipientType: RecipientType.DEPARTMENT,
        departmentIds: ['Engineering', 'Human Resources'],
      };

      const res = await request(app).post('/api/v1/notifications').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.recipientType).toBe(RecipientType.DEPARTMENT);
      expect(res.body.data.departmentIds).toEqual(['Engineering', 'Human Resources']);
    });

    it('should fail with 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/v1/notifications').send({
        channel: NotificationChannel.EMAIL,
        subject: 'Missing message',
        // message missing
        recipients: 'All Employees',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 400 when invalid channel is provided', async () => {
      const res = await request(app).post('/api/v1/notifications').send({
        channel: 'CARRIER_PIGEON',
        message: 'Test message',
        recipients: 'All Employees',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/notifications (History, Pagination & Search/Filter)', () => {
    beforeEach(async () => {
      await NotificationModel.create([
        {
          channel: NotificationChannel.EMAIL,
          subject: 'Alpha Subject',
          message: 'Alpha body message',
          recipients: 'All Employees',
          status: NotificationStatus.DRAFT,
          createdAt: new Date('2026-01-01T10:00:00Z'),
        },
        {
          channel: NotificationChannel.SMS,
          subject: 'Beta Subject',
          message: 'Beta SMS body text',
          recipients: 'Engineering',
          status: NotificationStatus.SENT,
          createdAt: new Date('2026-01-02T10:00:00Z'),
        },
        {
          channel: NotificationChannel.WHATSAPP,
          subject: 'Gamma Special [Discount]',
          message: 'Gamma promotional message',
          recipients: 'Marketing',
          status: NotificationStatus.SENT,
          createdAt: new Date('2026-01-03T10:00:00Z'),
        },
      ]);
    });

    it('should retrieve history sorted newest first with pagination', async () => {
      const res = await request(app).get('/api/v1/notifications?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.totalItems).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
      // Newest first check
      expect(res.body.data[0].subject).toBe('Gamma Special [Discount]');
    });

    it('should filter by channel', async () => {
      const res = await request(app).get(`/api/v1/notifications?channel=${NotificationChannel.SMS}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].channel).toBe(NotificationChannel.SMS);
    });

    it('should filter by status (DRAFT vs SENT)', async () => {
      const res = await request(app).get(`/api/v1/notifications?status=${NotificationStatus.SENT}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      res.body.data.forEach((item: any) => {
        expect(item.status).toBe(NotificationStatus.SENT);
      });
    });

    it('should search notifications by keyword safely escaping regex characters', async () => {
      const res = await request(app).get('/api/v1/notifications?search=[Discount]');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].subject).toBe('Gamma Special [Discount]');
    });

    it('should reject invalid sortBy field', async () => {
      const res = await request(app).get('/api/v1/notifications?sortBy=maliciousField');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/notifications/:id', () => {
    it('should return 400 for invalid mongo ID format', async () => {
      const res = await request(app).get('/api/v1/notifications/123-invalid-id');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if notification ID does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/notifications/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return notification details for valid ID', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Single View Test',
        message: 'Content for single view',
        recipients: 'Engineering',
        status: NotificationStatus.DRAFT,
      });

      const res = await request(app).get(`/api/v1/notifications/${doc.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(doc.id);
      expect(res.body.data.subject).toBe('Single View Test');
    });
  });

  describe('POST /api/v1/notifications/:id/send (Individual Delivery Tracking across Channels)', () => {
    it('should dispatch EMAIL with individual delivery tracking and update status to SENT', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Company Wide Broadcast',
        message: 'Important updates regarding policies',
        recipients: 'All Employees',
        recipientType: RecipientType.ALL_EMPLOYEES,
        status: NotificationStatus.DRAFT,
      });

      const res = await request(app).post(`/api/v1/notifications/${doc.id}/send`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(NotificationStatus.SENT);
      expect(res.body.data.recipientDeliveries).toBeDefined();
      expect(res.body.data.recipientDeliveries.length).toBeGreaterThan(0);

      // Verify individual delivery statuses
      const deliveries = res.body.data.recipientDeliveries;
      const alice = deliveries.find((d: any) => d.recipientId === 'EMP-001');
      expect(alice.status).toBe(DeliveryStatus.SENT);
      expect(alice.messageId).toBeDefined();

      // Carol had invalid email so her delivery status is FAILED with error
      const carol = deliveries.find((d: any) => d.recipientId === 'EMP-003');
      expect(carol.status).toBe(DeliveryStatus.FAILED);
      expect(carol.error).toBeDefined();
    });

    it('should dispatch SMS and track individual phone deliveries', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.SMS,
        message: 'Urgent system maintenance alert',
        recipients: 'All Employees',
        recipientType: RecipientType.ALL_EMPLOYEES,
        status: NotificationStatus.DRAFT,
      });

      const res = await request(app).post(`/api/v1/notifications/${doc.id}/send`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(NotificationStatus.SENT);
      expect(res.body.data.sentCount).toBeGreaterThan(0);
    });

    it('should dispatch HUREMASO broadcast with announcement category', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.HUREMASO,
        subject: 'Quarterly Town Hall',
        message: 'Please join us for our Q4 Town Hall meeting',
        announcementCategory: 'Company News',
        recipients: 'All Employees',
        status: NotificationStatus.DRAFT,
      });

      const res = await request(app).post(`/api/v1/notifications/${doc.id}/send`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(NotificationStatus.SENT);
      expect(res.body.data.announcementCategory).toBe('Company News');
    });

    it('should prevent duplicate notification sending when called multiple times on an already SENT notification', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Idempotency Check',
        message: 'Only send once',
        recipients: 'HR',
        status: NotificationStatus.DRAFT,
      });

      const firstSend = await request(app).post(`/api/v1/notifications/${doc.id}/send`);
      expect(firstSend.status).toBe(200);
      expect(firstSend.body.data.status).toBe(NotificationStatus.SENT);

      // Second send call
      const secondSend = await request(app).post(`/api/v1/notifications/${doc.id}/send`);
      expect(secondSend.status).toBe(200);
      expect(secondSend.body.data.status).toBe(NotificationStatus.SENT);
    });
  });

  describe('POST /api/v1/notifications/:id/retry (Retry Failed Deliveries)', () => {
    it('should retry failed recipient deliveries and increment retryCount', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Retry Test',
        message: 'Testing delivery retry',
        recipients: 'EMP-001',
        status: NotificationStatus.SENT,
        recipientDeliveries: [
          {
            recipientId: 'EMP-001',
            name: 'Alice Smith',
            department: 'Engineering',
            contactAddress: 'alice.smith@company.com',
            status: DeliveryStatus.FAILED,
            error: 'Connection timeout on previous attempt',
          },
        ],
        failedCount: 1,
        retryCount: 0,
      });

      const res = await request(app).post(`/api/v1/notifications/${doc.id}/retry`);

      expect(res.status).toBe(200);
      expect(res.body.data.retryCount).toBe(1);
      const delivery = res.body.data.recipientDeliveries[0];
      expect(delivery.status).toBe(DeliveryStatus.SENT);
      expect(res.body.data.sentCount).toBe(1);
      expect(res.body.data.failedCount).toBe(0);
    });
  });

  describe('Employee In-App Notifications (/my-notifications)', () => {
    it('should allow employees to fetch their in-app notifications and mark them as read', async () => {
      // Create an EMPLOYEE_APP notification sent to Alice
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMPLOYEE_APP,
        subject: 'Your Performance Review',
        message: 'Your annual performance review is now ready to view.',
        recipients: 'Alice Smith',
        recipientType: RecipientType.EMPLOYEES,
        status: NotificationStatus.SENT,
        recipientDeliveries: [
          {
            recipientId: 'EMP-001',
            name: 'Alice Smith',
            department: 'Engineering',
            contactAddress: 'EMP-001',
            status: DeliveryStatus.DELIVERED,
          },
        ],
        totalRecipientsCount: 1,
        sentCount: 1,
      });

      // 1. Fetch in-app notifications for Alice
      const fetchRes = await request(app).get('/api/v1/notifications/my-notifications?employeeId=EMP-001');
      expect(fetchRes.status).toBe(200);
      expect(fetchRes.body.data.length).toBeGreaterThan(0);
      expect(fetchRes.body.pagination.unreadCount).toBeGreaterThan(0);

      // 2. Check unread count endpoint
      const unreadRes = await request(app).get('/api/v1/notifications/my-notifications/unread-count?employeeId=EMP-001');
      expect(unreadRes.status).toBe(200);
      expect(unreadRes.body.data.unreadCount).toBeGreaterThan(0);

      // 3. Mark single notification as read
      const markReadRes = await request(app)
        .patch(`/api/v1/notifications/my-notifications/${doc.id}/read`)
        .send({ recipientId: 'EMP-001' });

      expect(markReadRes.status).toBe(200);
      expect(markReadRes.body.data.updated).toBe(true);

      // 4. Verify unread count is now 0
      const afterReadRes = await request(app).get('/api/v1/notifications/my-notifications/unread-count?employeeId=EMP-001');
      expect(afterReadRes.body.data.unreadCount).toBe(0);
    });
  });

  describe('PATCH /api/v1/notifications/:id (Update Draft)', () => {
    it('should update draft content successfully', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Initial Subject',
        message: 'Initial Message Content',
        recipients: 'HR Team',
        status: NotificationStatus.DRAFT,
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${doc.id}`)
        .send({
          subject: 'Updated Subject',
          message: 'Updated Message Content',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subject).toBe('Updated Subject');
      expect(res.body.data.message).toBe('Updated Message Content');
    });

    it('should return 400 when attempting to update an already SENT notification', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Sent Subject',
        message: 'Sent Message Content',
        recipients: 'HR Team',
        status: NotificationStatus.SENT,
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${doc.id}`)
        .send({ subject: 'Attempted Change' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('already been sent');
    });

    it('should reject PATCH request attempting to set status to SENT and NOT dispatch provider', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Draft Notification',
        message: 'Message Body',
        recipients: 'All',
        status: NotificationStatus.DRAFT,
      });

      const provider = providerRegistry.getProvider(NotificationChannel.EMAIL);
      const sendSpy = jest.spyOn(provider, 'send');

      const res = await request(app)
        .patch(`/api/v1/notifications/${doc.id}`)
        .send({ status: NotificationStatus.SENT });

      expect(res.status).toBe(400);
      expect(sendSpy).not.toHaveBeenCalled();

      const check = await NotificationModel.findById(doc.id);
      expect(check?.status).toBe(NotificationStatus.DRAFT);
    });
  });

  describe('DELETE /api/v1/notifications/:id (Delete Draft)', () => {
    it('should delete a notification draft', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Draft to delete',
        message: 'Delete me',
        recipients: 'All',
        status: NotificationStatus.DRAFT,
      });

      const res = await request(app).delete(`/api/v1/notifications/${doc.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await NotificationModel.findById(doc.id);
      expect(check).toBeNull();
    });

    it('should return 400 when attempting to delete a SENT notification', async () => {
      const doc = await NotificationModel.create({
        channel: NotificationChannel.EMAIL,
        subject: 'Sent Notification',
        message: 'Cannot delete me',
        recipients: 'All',
        status: NotificationStatus.SENT,
      });

      const res = await request(app).delete(`/api/v1/notifications/${doc.id}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('already been sent');

      const check = await NotificationModel.findById(doc.id);
      expect(check).not.toBeNull();
    });

    it('should return 404 when deleting a non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/notifications/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });
});
