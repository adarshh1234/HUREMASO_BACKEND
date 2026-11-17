import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { PerformanceAppraisalModel } from '../src/modules/performance/performanceAppraisal.model';
import { AppraisalCycleModel } from '../src/modules/performance/appraisalCycle.model';
import { EmployeeModel } from '../src/modules/employee/employee.model';
import { AttendanceModel } from '../src/modules/time/attendance/attendance.model';
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

beforeEach(async () => {
  await PerformanceAppraisalModel.deleteMany({});
  await AppraisalCycleModel.deleteMany({});
  await EmployeeModel.deleteMany({});
  await AttendanceModel.deleteMany({});
  await TaskModel.deleteMany({});

  // Seed sample active employees
  await EmployeeModel.create([
    {
      employeeId: 'EMP-001',
      firstName: 'Sarah',
      lastName: 'Connor',
      name: 'Sarah Connor',
      email: 'sarah.connor@huremaso.com',
      department: 'Engineering',
      designation: 'Senior Full Stack Lead',
      isTerminated: false,
    },
    {
      employeeId: 'EMP-002',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      email: 'john.doe@huremaso.com',
      department: 'Product',
      designation: 'Product Manager',
      isTerminated: false,
    },
    {
      employeeId: 'EMP-003',
      firstName: 'Ellen',
      lastName: 'Ripley',
      name: 'Ellen Ripley',
      email: 'ellen.ripley@huremaso.com',
      department: 'Operations',
      designation: 'Chief Warrant Officer',
      isTerminated: false,
    },
  ]);

  // Seed attendance records for Sarah Connor (EMP-001)
  const empSarah = await EmployeeModel.findOne({ employeeId: 'EMP-001' });
  await AttendanceModel.create([
    {
      employeeId: empSarah?._id || new mongoose.Types.ObjectId(),
      employeeName: 'Sarah Connor',
      date: '2026-03-01',
      status: 'Present',
      punches: [
        {
          punchInTime: new Date('2026-03-01T09:00:00Z'),
          punchOutTime: new Date('2026-03-01T18:00:00Z'),
          durationMinutes: 540,
          durationHours: '09.00',
        },
      ],
      totalWorkingMinutes: 540,
      totalWorkingHours: '09.00',
    },
    {
      employeeId: empSarah?._id || new mongoose.Types.ObjectId(),
      employeeName: 'Sarah Connor',
      date: '2026-03-02',
      status: 'Present',
      punches: [
        {
          punchInTime: new Date('2026-03-02T09:00:00Z'),
          punchOutTime: new Date('2026-03-02T17:30:00Z'),
          durationMinutes: 510,
          durationHours: '08.50',
        },
      ],
      totalWorkingMinutes: 510,
      totalWorkingHours: '08.50',
    },
  ]);

  // Seed task records for Sarah Connor (EMP-001)
  await TaskModel.create([
    {
      title: 'Implement Performance Appraisal Module',
      column: 'completed',
      assigneeName: 'Sarah Connor',
      type: 'Feature',
      priority: 'High',
    },
    {
      title: 'Refactor E-SOP Workflow',
      column: 'completed',
      assigneeName: 'Sarah Connor',
      type: 'Architecture',
      priority: 'Medium',
    },
  ]);
});

describe('HUREMASO HRMS — Performance Appraisal Module Comprehensive Test Suite', () => {
  let createdCycleId: string;
  let appraisalRecordId: string;

  describe('1. Appraisal Cycle Management Endpoints', () => {
    it('POST /api/v1/performance-appraisals/cycles — should create a new appraisal cycle', async () => {
      const payload = {
        name: 'Annual Review 2026',
        cycleId: 'CYCLE-2026-Q1',
        description: 'Comprehensive 2026 Performance Appraisal Cycle',
        financialYear: '2026-2027',
        frequency: 'Annual',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        submissionDeadline: '2026-03-15',
        reviewDeadline: '2026-03-31',
        eligibleDepartments: ['Engineering', 'Product', 'Operations'],
        status: 'Active',
      };

      const res = await request(app)
        .post('/api/v1/performance-appraisals/cycles')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cycleId).toBe('CYCLE-2026-Q1');
      expect(res.body.data.status).toBe('Active');
      createdCycleId = res.body.data.cycleId;
    });

    it('GET /api/v1/performance-appraisals/cycles — should list all appraisal cycles', async () => {
      await AppraisalCycleModel.create({
        name: 'Mid-Year Review 2026',
        cycleId: 'CYCLE-2026-MID',
        frequency: 'Bi-Annual',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
        submissionDeadline: '2026-07-15',
        reviewDeadline: '2026-07-31',
        financialYear: '2026-2027',
        eligibleDepartments: ['Engineering'],
        status: 'Scheduled',
      });

      const res = await request(app).get('/api/v1/performance-appraisals/cycles');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/v1/performance-appraisals/cycles/:id — should update cycle status and metadata', async () => {
      const cycle = await AppraisalCycleModel.create({
        name: 'Q3 Rapid Review',
        cycleId: 'CYCLE-2026-Q3',
        frequency: 'Quarterly',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        submissionDeadline: '2026-08-15',
        reviewDeadline: '2026-08-31',
        financialYear: '2026-2027',
        status: 'Draft',
      });

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/cycles/${cycle._id}`)
        .send({
          status: 'Active',
          name: 'Q3 Performance & Strategy Review',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Active');
      expect(res.body.data.name).toBe('Q3 Performance & Strategy Review');
    });
  });

  describe('2. Appraisal Record Creation & Employee Association', () => {
    beforeEach(async () => {
      const cycle = await AppraisalCycleModel.create({
        name: 'Annual Review 2026',
        cycleId: 'CYCLE-2026-Q1',
        frequency: 'Annual',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        submissionDeadline: '2026-03-15',
        reviewDeadline: '2026-03-31',
        financialYear: '2026-2027',
        status: 'Active',
      });
      createdCycleId = cycle.cycleId;
    });

    it('POST /api/v1/performance-appraisals — should create an appraisal linked to a real employee', async () => {
      const payload = {
        employeeId: 'EMP-001',
        employeeName: 'Sarah Connor',
        role: 'Senior Full Stack Lead',
        department: 'Engineering',
        cycle: 'Q3 2026',
        cycleId: createdCycleId,
        status: 'Draft',
      };

      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe('EMP-001');
      expect(res.body.data.employeeName).toBe('Sarah Connor');
      expect(res.body.data.department).toBe('Engineering');
      expect(res.body.data.approvalHistory).toHaveLength(1);
      expect(res.body.data.approvalHistory[0].action).toBe('Created Appraisal Record');

      appraisalRecordId = res.body.data._id;
    });

    it('POST /api/v1/performance-appraisals — should reject creation if employee does not exist', async () => {
      const payload = {
        employeeId: 'NON-EXISTENT-EMP',
        employeeName: 'Non Existent Person',
        role: 'Ghost Role',
        department: 'Phantom Dept',
        cycle: 'Q3 2026',
      };

      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send(payload);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Employee not found');
    });

    it('POST /api/v1/performance-appraisals — should reject duplicate appraisal for same employee & cycle', async () => {
      const payload = {
        employeeId: 'EMP-001',
        employeeName: 'Sarah Connor',
        role: 'Senior Full Stack Lead',
        department: 'Engineering',
        cycle: 'Q3 2026',
      };

      // Create first appraisal
      await request(app)
        .post('/api/v1/performance-appraisals')
        .send(payload);

      // Attempt duplicate
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('GET /api/v1/performance-appraisals — should filter appraisals by department', async () => {
      await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });

      await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-002',
          employeeName: 'John Doe',
          role: 'Product Manager',
          department: 'Product',
          cycle: 'Q3 2026',
        });

      const res = await request(app).get('/api/v1/performance-appraisals?department=Engineering');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].employeeId).toBe('EMP-001');
    });
  });

  describe('3. Sub-section 1: Lists, Reports and AI Page', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('POST /api/v1/performance-appraisals/:id/generate-ai-report — should synthesize scores and skill gaps', async () => {
      const res = await request(app)
        .post(`/api/v1/performance-appraisals/${appraisalRecordId}/generate-ai-report`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportsAi).toBeDefined();
      expect(res.body.data.reportsAi.overallAiScore).toBeGreaterThanOrEqual(0);
      expect(res.body.data.reportsAi.recommendations.length).toBeGreaterThan(0);
      expect(res.body.data.reportsAi.competencies.length).toBeGreaterThan(0);
    });

    it('PUT /api/v1/performance-appraisals/:id/reports-ai — should update AI report fields', async () => {
      const updatePayload = {
        overallAiScore: 4.8,
        peerSentimentRating: 92,
        competenciesMetCount: 5,
        totalCompetenciesCount: 5,
        performanceTier: 'Tier 1: Top 5%',
        summary: 'Outstanding leadership and continuous delivery across all quarters.',
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/reports-ai`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportsAi.overallAiScore).toBe(4.8);
      expect(res.body.data.reportsAi.peerSentimentRating).toBe(92);
    });
  });

  describe('4. Sub-section 2: Attendance & Time Appraisal Impact', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('POST /api/v1/performance-appraisals/:id/attendance-sync — should pull live attendance and task records', async () => {
      const res = await request(app)
        .post(`/api/v1/performance-appraisals/${appraisalRecordId}/attendance-sync`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attendanceTime).toBeDefined();
      expect(res.body.data.attendanceTime.punctualityScore).toBe(100); // 2 present days / 2 total = 100%
      expect(res.body.data.attendanceTime.tasksCompleted).toBe(2);
      expect(res.body.data.attendanceTime.velocityMultiplier).toContain('1.15x');
    });

    it('PUT /api/v1/performance-appraisals/:id/attendance-time — should update attendance time fields', async () => {
      const payload = {
        punctualityScore: 99.2,
        streakStatus: '32 Days Zero Late Streak',
        overtimeHoursPerMonth: 14,
        velocityMultiplier: '1.20x Velocity',
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/attendance-time`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attendanceTime.punctualityScore).toBe(99.2);
      expect(res.body.data.attendanceTime.velocityMultiplier).toBe('1.20x Velocity');
    });
  });

  describe('5. Sub-section 3: Smart Work and Efficiency Metrics', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('PUT /api/v1/performance-appraisals/:id/smart-work — should log initiative and compute hours saved', async () => {
      const payload = {
        automatedWorkflowsCount: 5,
        hoursSavedPerMonth: 48,
        focusHoursRatio: 0.72,
        initiatives: [
          {
            id: 'INIT-01',
            title: 'Automated CI/CD Deployment Pipeline',
            category: 'Process Automation',
            hoursSaved: 24,
            status: 'Deployed & Measuring',
          },
          {
            id: 'INIT-02',
            title: 'Micro-frontend Shell Architecture',
            category: 'Architecture',
            hoursSaved: 24,
            status: 'Completed',
          },
        ],
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/smart-work`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.smartWork.initiatives).toHaveLength(2);
      expect(res.body.data.smartWork.automatedWorkflowsCount).toBe(5);
    });
  });

  describe('6. Sub-section 4: Psychometric Assessments & EQ Profile', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('PUT /api/v1/performance-appraisals/:id/psychometric — should persist DISC & EQ profile', async () => {
      const payload = {
        discProfileArchetype: 'Captain / Directive Leader',
        archetypeDescription: 'Direct, focused, drives for high impact results.',
        dScore: 82,
        iScore: 74,
        sScore: 65,
        cScore: 79,
        cognitivePercentile: 91,
        eqScore: 85,
        eqMax: 100,
        consentGiven: true,
        behavioralTraits: [
          { trait: 'Strategic Agility', score: 92, level: 'High' },
          { trait: 'Empathy', score: 86, level: 'High' },
        ],
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/psychometric`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.psychometric.discProfileArchetype).toBe('Captain / Directive Leader');
      expect(res.body.data.psychometric.cognitivePercentile).toBe(91);
      expect(res.body.data.psychometric.eqScore).toBe(85);
    });
  });

  describe('7. Sub-section 5: E-SOPs Compliance Tracking', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('PUT /api/v1/performance-appraisals/:id/e-sops — should recalculate compliance percentage on acknowledgement', async () => {
      const payload = {
        sops: [
          {
            sopId: 'SOP-SEC-01',
            title: 'Information Security & Data Protection Standard',
            version: 'v2.4',
            status: 'Active',
            updatedDate: '2026-01-15',
            acknowledged: true,
            acknowledgedAt: '2026-02-01T10:00:00Z',
          },
          {
            sopId: 'SOP-ENG-02',
            title: 'Production Incident Escalation Protocol',
            version: 'v3.1',
            status: 'Active',
            updatedDate: '2026-01-20',
            acknowledged: true,
            acknowledgedAt: '2026-02-05T14:30:00Z',
          },
          {
            sopId: 'SOP-HR-03',
            title: 'Code of Business Conduct & Ethics',
            version: 'v1.9',
            status: 'Active',
            updatedDate: '2026-01-10',
            acknowledged: false,
          },
        ],
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/e-sops`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.eSops.acknowledgedCount).toBe(2);
      expect(res.body.data.eSops.totalAssigned).toBe(3);
      expect(res.body.data.eSops.compliancePercentage).toBe(67); // Math.round((2/3)*100)
    });
  });

  describe('8. Sub-section 6: Complete Appraisal Workflow & 360 Feedback', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('Complete Lifecycle: Self-Review -> Manager Review -> 360 Feedback -> HR Calibration Signoff', async () => {
      // Step A: Submit Self-Review
      const selfReviewPayload = {
        selfAppraisal: {
          status: 'Submitted',
          score: 4.8,
          comments: 'Successfully delivered the Enterprise HRMS core architecture.',
          strengths: 'System design, reliability engineering',
          improvementAreas: 'Cross-timezone sync',
        },
      };

      const step1 = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/review`)
        .send(selfReviewPayload);

      expect(step1.status).toBe(200);
      expect(step1.body.data.review.selfAppraisal.status).toBe('Submitted');
      expect(step1.body.data.review.selfAppraisal.score).toBe(4.8);

      // Step B: Submit Manager Review
      const managerReviewPayload = {
        managerReview: {
          status: 'Signed Off',
          score: 4.9,
          reviewerName: 'Ellen Ripley',
          comments: 'Outstanding problem solver and deep technical acumen.',
          promotionRecommended: true,
        },
      };

      const step2 = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/review`)
        .send(managerReviewPayload);

      expect(step2.status).toBe(200);
      expect(step2.body.data.review.managerReview.status).toBe('Signed Off');
      expect(step2.body.data.review.managerReview.score).toBe(4.9);

      // Step C: Add 360-Degree Feedback
      const feedback360Payload = {
        reviewerId: 'EMP-002',
        reviewerName: 'John Doe',
        reviewerRole: 'Product Manager',
        relationship: 'Peer',
        score: 5,
        comments: 'Extremely proactive and always helps team members unblock.',
      };

      const step3 = await request(app)
        .post(`/api/v1/performance-appraisals/${appraisalRecordId}/feedback-360`)
        .send(feedback360Payload);

      expect(step3.status).toBe(200);
      expect(step3.body.data.feedback360).toHaveLength(1);
      expect(step3.body.data.feedback360[0].reviewerName).toBe('John Doe');

      // Step D: HR Calibration Sign-Off
      const calibrationPayload = {
        hrCalibration: {
          status: 'Completed',
          finalRating: 4.85,
          calibratedBy: 'Chief HR Officer',
          calibrationNotes: 'Approved for Senior Leadership HiPo track and merit increase.',
        },
      };

      const step4 = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/review`)
        .send(calibrationPayload);

      expect(step4.status).toBe(200);
      expect(step4.body.data.review.hrCalibration.status).toBe('Completed');
      expect(step4.body.data.review.hrCalibration.finalRating).toBe(4.85);
      expect(step4.body.data.approvalHistory.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('9. Sub-section 7: References & Recommendations', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('POST /api/v1/performance-appraisals/:id/endorsement — should add peer endorsement', async () => {
      const payload = {
        from: 'John Doe',
        role: 'Product Manager',
        text: 'Sarah is an exceptional technical leader who translates product vision into robust reality.',
        recommendationType: 'Promotion',
        verified: true,
      };

      const res = await request(app)
        .post(`/api/v1/performance-appraisals/${appraisalRecordId}/endorsement`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.references.endorsements).toHaveLength(1);
      expect(res.body.data.references.endorsements[0].from).toBe('John Doe');
      expect(res.body.data.references.endorsements[0].recommendationType).toBe('Promotion');
    });
  });

  describe('10. Sub-section 8: Special Strategy Program & HiPo Talent', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('PUT /api/v1/performance-appraisals/:id/strategy — should nominate HiPo track and configure milestones', async () => {
      const payload = {
        hipoTrack: {
          nominated: true,
          nominatorName: 'Ellen Ripley',
          trackName: 'Executive Technology Leadership',
          status: 'Active',
          milestones: [
            {
              id: 'MS-01',
              title: 'Executive Architecture Review Board',
              description: 'Lead the enterprise modernization review',
              targetDate: '2026-06-30',
              assignedMentor: 'Dr. Arthur Vance',
              progress: 75,
              status: 'In Progress',
            },
          ],
        },
        retentionGrant: {
          eligible: true,
          grantName: 'Executive Equity Retention Grant',
          grantAmount: 50000,
          approvalStatus: 'Board Approved',
        },
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/strategy`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.strategy.hipoTrack.nominated).toBe(true);
      expect(res.body.data.strategy.hipoTrack.trackName).toBe('Executive Technology Leadership');
      expect(res.body.data.strategy.hipoTrack.milestones).toHaveLength(1);
      expect(res.body.data.strategy.retentionGrant.eligible).toBe(true);
    });
  });

  describe('11. Sub-section 9: Reports and Analytics — AI & Export', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/performance-appraisals')
        .send({
          employeeId: 'EMP-001',
          employeeName: 'Sarah Connor',
          role: 'Senior Full Stack Lead',
          department: 'Engineering',
          cycle: 'Q3 2026',
        });
      appraisalRecordId = res.body.data._id;
    });

    it('PUT /api/v1/performance-appraisals/:id/analytics-ai — should update predictive analytics indices', async () => {
      const payload = {
        predictedTrajectoryGrowth: 'Top 5% Principal Technical Architect',
        attritionRiskPct: 4.2,
        attritionRiskLevel: 'Low',
        leadershipReadinessScore: 92,
      };

      const res = await request(app)
        .put(`/api/v1/performance-appraisals/${appraisalRecordId}/analytics-ai`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analyticsAi.attritionRiskPct).toBe(4.2);
      expect(res.body.data.analyticsAi.leadershipReadinessScore).toBe(92);
    });

    it('GET /api/v1/performance-appraisals/:id/export — should return formatted export payload', async () => {
      const res = await request(app)
        .get(`/api/v1/performance-appraisals/${appraisalRecordId}/export`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employee.id).toBe('EMP-001');
      expect(res.body.data.employee.name).toBe('Sarah Connor');
      expect(res.body.data.appraisal).toBeDefined();
      expect(res.body.data.generatedAt).toBeDefined();
    });

    it('GET /api/v1/performance-appraisals/reports/summary — should return aggregated distribution metrics', async () => {
      const res = await request(app)
        .get('/api/v1/performance-appraisals/reports/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAppraisals).toBeGreaterThanOrEqual(1);
      expect(res.body.data.averageAiScore).toBeDefined();
      expect(res.body.data.averagePunctuality).toBeDefined();
    });
  });
});
