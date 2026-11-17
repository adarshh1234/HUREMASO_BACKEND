import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';

let mongoServer: MongoMemoryServer;
const TEST_EMP_ID = 'EMP-TEST-999';

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

describe('HUREMASO Employee Wellness & Development Integration Tests', () => {
  // ==================== 1. FINANCIAL INCENTIVES ====================
  describe('1. Financial Incentives (ESOPs, Bonus, Incentives, Literacy)', () => {
    let createdBonusPlanId: string;
    let createdIncentiveId: string;
    let createdWorkshopId: string;

    it('should retrieve or seed default financial incentives for employee', async () => {
      const res = await request(app).get(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe(TEST_EMP_ID);
      expect(res.body.data.grantedEsopShares).toBeGreaterThan(0);
      expect(res.body.data.vestingSchedule.length).toBe(4);
    });

    it('should create a custom ESOP grant with 4-year calculated vesting schedule', async () => {
      const res = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/esop-grant`)
        .send({
          shares: 4000,
          grantPrice: 15.0,
          currentFMV: 50.0,
          grantDate: '2024-01-01',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.grantedEsopShares).toBe(4000);
      expect(res.body.data.grantPrice).toBe(15.0);
      expect(res.body.data.currentFMV).toBe(50.0);
      expect(res.body.data.vestingSchedule.length).toBe(4);
      // Tranche 1 and 2 should already be Vested since grantDate was 2024-01-01
      expect(res.body.data.vestingSchedule[0].status).toBe('Vested');
      expect(res.body.data.vestingSchedule[0].shares).toBe(1000);
    });

    it('should exercise vested ESOP options and record in exercise history', async () => {
      const res = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/exercise-esop`)
        .send({ trancheNumber: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vestingSchedule[0].status).toBe('Exercised');
      expect(res.body.data.exerciseHistory.length).toBeGreaterThan(0);
      expect(res.body.data.exerciseHistory[0].trancheNumber).toBe(1);
      expect(res.body.data.exerciseHistory[0].shares).toBe(1000);
    });

    it('should reject exercising an already exercised or unvested tranche', async () => {
      // Trying to exercise tranche 1 again
      const res = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/exercise-esop`)
        .send({ trancheNumber: 1 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should update performance bonus status', async () => {
      const res = await request(app)
        .patch(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/bonus-status`)
        .send({ bonusStatus: 'Approved' });

      expect(res.status).toBe(200);
      expect(res.body.data.bonusStatus).toBe('Approved');
    });

    it('should add a performance bonus plan and update its status', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/bonus-plans`)
        .send({
          planName: 'Cloud Infrastructure Scalability Bonus',
          bonusYear: 2026,
          targetMetrics: 'Zero outages in Q3 and 20% latency reduction',
          targetAchievement: 115,
          bonusMultiplier: 1.3,
          estimatedBonusAmount: 25000,
          status: 'Pending Approval',
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.bonusPlans.length).toBeGreaterThan(0);
      const plan = addRes.body.data.bonusPlans.find((p: any) => p.planName === 'Cloud Infrastructure Scalability Bonus');
      expect(plan).toBeDefined();
      createdBonusPlanId = plan.id;

      const updateRes = await request(app)
        .patch(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/bonus-plans/${createdBonusPlanId}`)
        .send({ status: 'Approved' });

      expect(updateRes.status).toBe(200);
      const updatedPlan = updateRes.body.data.bonusPlans.find((p: any) => p.id === createdBonusPlanId);
      expect(updatedPlan.status).toBe('Approved');
    });

    it('should add a quarterly incentive record and mark it Achieved', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/incentives`)
        .send({
          title: 'Client Retention Index > 98%',
          target: 'Deliver zero defect deployment for Tier 1 client',
          reward: '$3,000 Spot Bonus',
          rewardAmount: 3000,
          quarter: 'Q4-2026',
        });

      expect(addRes.status).toBe(201);
      const inc = addRes.body.data.incentives.find((i: any) => i.title === 'Client Retention Index > 98%');
      expect(inc).toBeDefined();
      createdIncentiveId = inc.id || inc._id;

      const patchRes = await request(app)
        .patch(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/incentives/${createdIncentiveId}`)
        .send({ status: 'Achieved' });

      expect(patchRes.status).toBe(200);
      const updatedInc = patchRes.body.data.incentives.find((i: any) => (i.id || i._id) === createdIncentiveId);
      expect(updatedInc.status).toBe('Achieved');
    });

    it('should create a financial literacy workshop and register an employee', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/literacy-programs`)
        .send({
          title: 'Executive Asset Protection & Tax Efficiency',
          speaker: 'David Sterling, JD CPA',
          date: '2026-12-05',
          category: 'Tax & Equity',
          topics: '83(b) elections, estate planning, capital gains',
        });

      expect(addRes.status).toBe(201);
      const ws = addRes.body.data.financialLiteracyPrograms.find((w: any) => w.title.includes('Asset Protection'));
      expect(ws).toBeDefined();
      createdWorkshopId = ws.id || ws._id;

      const enrollRes = await request(app)
        .post(`/api/v1/wellness/financial-incentives/${TEST_EMP_ID}/literacy-programs/${createdWorkshopId}/enroll`)
        .send({ registered: true });

      expect(enrollRes.status).toBe(200);
      const enrolled = enrollRes.body.data.financialLiteracyPrograms.find((w: any) => (w.id || w._id) === createdWorkshopId);
      expect(enrolled.registered).toBe(true);
    });
  });

  // ==================== 2. EMPLOYEE DEVELOPMENT ====================
  describe('2. Employee Development (Programs, Certs, Mentorship, Goals)', () => {
    let createdProgramId: string;
    let createdCertId: string;
    let createdGoalId: string;

    it('should retrieve default development profile', async () => {
      const res = await request(app).get(`/api/v1/wellness/employee-development/${TEST_EMP_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.data.employeeId).toBe(TEST_EMP_ID);
      expect(res.body.data.annualTargetHours).toBe(60);
    });

    it('should enroll in a learning program, update progress, and recalculate hours', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/programs`)
        .send({
          title: 'Microservices Design Patterns in Go',
          provider: 'O’Reilly Learning',
          totalModules: 10,
          completedModules: 2,
          progressPercent: 20,
          status: 'In_Progress',
          trainingHours: 20,
          allowanceCost: 350,
        });

      expect(addRes.status).toBe(201);
      const prog = addRes.body.data.learningPrograms.find((p: any) => p.title.includes('Microservices Design'));
      expect(prog).toBeDefined();
      createdProgramId = prog._id || prog.id;

      // Advance modules to completion
      const putRes = await request(app)
        .put(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/programs/${createdProgramId}`)
        .send({
          completedModules: 10,
          progressPercent: 100,
          status: 'Completed',
        });

      expect(putRes.status).toBe(200);
      const updatedProg = putRes.body.data.learningPrograms.find((p: any) => (p._id || p.id) === createdProgramId);
      expect(updatedProg.status).toBe('Completed');
    });

    it('should add a certification and verify it', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/certifications`)
        .send({
          name: 'Certified Kubernetes Administrator (CKA)',
          issuingOrganization: 'Cloud Native Computing Foundation',
          issuedDate: '2026-02-15',
          expiryDate: '2029-02-15',
          certificationId: 'CKA-8923412',
          status: 'Pending Verification',
        });

      expect(addRes.status).toBe(201);
      const cert = addRes.body.data.certifications.find((c: any) => c.name.includes('CKA'));
      expect(cert).toBeDefined();
      createdCertId = cert._id || cert.id;

      // Verify certificate
      const patchRes = await request(app)
        .patch(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/certifications/${createdCertId}`)
        .send({
          status: 'Active',
          verifiedBy: 'HR Verifier Sarah Jenkins',
        });

      expect(patchRes.status).toBe(200);
      const verifiedCert = patchRes.body.data.certifications.find((c: any) => (c._id || c.id) === createdCertId);
      expect(verifiedCert.status).toBe('Active');
      expect(verifiedCert.verifiedBy).toContain('Sarah Jenkins');
    });

    it('should request mentorship and log sessions with notes and feedback', async () => {
      const reqRes = await request(app)
        .post(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/mentorship/request`)
        .send({
          mentorName: 'David Chen, VP Architecture',
          mentorId: 'EMP-012',
          durationMonths: 6,
          objectives: 'Enterprise architecture leadership and team scaling',
        });

      expect(reqRes.status).toBe(200);
      expect(reqRes.body.data.mentorship.mentorName).toBe('David Chen, VP Architecture');
      expect(reqRes.body.data.mentorship.status).toBe('Active');

      // Log a session
      const sessRes = await request(app)
        .post(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/mentorship/sessions`)
        .send({
          sessionDate: '2026-11-20',
          time: '14:00',
          topic: 'High Availability Distributed Datastores',
          notes: 'Covered Raft consensus and multi-region replication.',
          feedback: 'Excellent analytical grasp on CAP theorem trade-offs.',
          completed: true,
        });

      expect([200, 201]).toContain(sessRes.status);
      expect(sessRes.body.data.mentorship.sessions.length).toBeGreaterThan(0);
      expect(sessRes.body.data.mentorship.sessions.some((s: any) => s.topic.includes('High Availability'))).toBe(true);
    });

    it('should add a career goal with milestones and toggle completion', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/career-goals`)
        .send({
          title: 'Promote to Principal Technical Architect',
          targetDate: '2027-06-30',
          status: 'In Progress',
          milestones: [
            { title: 'Publish Zero-Trust Architecture Standard', completed: true },
            { title: 'Facilitate Distributed Systems Workshop', completed: false },
          ],
        });

      expect(addRes.status).toBe(201);
      const goal = addRes.body.data.careerGoals.find((g: any) => g.title.includes('Principal Technical Architect'));
      expect(goal).toBeDefined();
      createdGoalId = goal.id || goal._id;

      // Complete second milestone
      const patchRes = await request(app)
        .patch(`/api/v1/wellness/employee-development/${TEST_EMP_ID}/career-goals/${createdGoalId}`)
        .send({
          milestones: [
            { title: 'Publish Zero-Trust Architecture Standard', completed: true },
            { title: 'Facilitate Distributed Systems Workshop', completed: true },
          ],
          status: 'Completed',
          managerFeedback: 'Outstanding technical leadership demonstrated.',
        });

      expect(patchRes.status).toBe(200);
      const updatedGoal = patchRes.body.data.careerGoals.find((g: any) => (g.id || g._id) === createdGoalId);
      expect(updatedGoal.status).toBe('Completed');
      expect(updatedGoal.milestones.every((m: any) => m.completed)).toBe(true);
    });
  });

  // ==================== 3. HEALTH & WELLNESS ====================
  describe('3. Health & Wellness (Insurance, Claims, Mental, Fitness)', () => {
    let createdClaimId: string;
    let createdDepId: string;
    let createdApptId: string;

    it('should retrieve default health profile with insurance details', async () => {
      const res = await request(app).get(`/api/v1/wellness/health/${TEST_EMP_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.data.groupInsurancePolicyNumber).toBeDefined();
      expect(res.body.data.insuranceDependents.length).toBeGreaterThan(0);
    });

    it('should add an insurance dependent and remove it', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/health/${TEST_EMP_ID}/dependents`)
        .send({
          name: 'Lucas Johnson',
          relationship: 'Child',
          dateOfBirth: '2022-04-10',
          status: 'Covered',
        });

      expect([200, 201]).toContain(addRes.status);
      const dep = addRes.body.data.insuranceDependents.find((d: any) => d.name === 'Lucas Johnson');
      expect(dep).toBeDefined();
      createdDepId = dep._id || dep.id;

      // Remove dependent
      const delRes = await request(app).delete(
        `/api/v1/wellness/health/${TEST_EMP_ID}/dependents/${createdDepId}`
      );
      expect(delRes.status).toBe(200);
      expect(delRes.body.data.insuranceDependents.find((d: any) => (d._id || d.id) === createdDepId)).toBeUndefined();
    });

    it('should submit an OPD health claim and approve it', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/health/${TEST_EMP_ID}/claims`)
        .send({
          type: 'Dental',
          description: 'Specialist Periodontal Cleaning',
          amount: 220,
          currency: 'USD',
          notes: 'Invoice attached with clinic stamp',
        });

      expect(addRes.status).toBe(201);
      const claim = addRes.body.data.healthClaims.find((c: any) => c.description.includes('Periodontal'));
      expect(claim).toBeDefined();
      createdClaimId = claim.claimId;

      // Approve claim
      const patchRes = await request(app)
        .patch(`/api/v1/wellness/health/${TEST_EMP_ID}/claims/${createdClaimId}`)
        .send({ status: 'Approved' });

      expect(patchRes.status).toBe(200);
      const approved = patchRes.body.data.healthClaims.find((c: any) => c.claimId === createdClaimId);
      expect(approved.status).toBe('Approved');
    });

    it('should book a confidential counseling session and cancel it', async () => {
      const bookRes = await request(app)
        .post(`/api/v1/wellness/health/${TEST_EMP_ID}/counselling/book`)
        .send({
          counsellorName: 'Dr. Rebecca Martinez, LMFT',
          appointmentDate: '2026-11-28',
          appointmentTime: '15:30',
          topic: 'Mindfulness & Deep Work Equilibrium',
        });

      expect([200, 201]).toContain(bookRes.status);
      const appt = bookRes.body.data.counsellingAppointments.find((a: any) => a.counsellorName.includes('Martinez'));
      expect(appt).toBeDefined();
      createdApptId = appt.id || appt._id;

      // Cancel appointment
      const cancelRes = await request(app).patch(
        `/api/v1/wellness/health/${TEST_EMP_ID}/counselling/${createdApptId}/cancel`
      );
      expect(cancelRes.status).toBe(200);
      const cancelled = cancelRes.body.data.counsellingAppointments.find((a: any) => (a.id || a._id) === createdApptId);
      expect(cancelled.status).toBe('Cancelled');
    });

    it('should log a fitness activity and credit points', async () => {
      const logRes = await request(app)
        .post(`/api/v1/wellness/health/${TEST_EMP_ID}/fitness/log`)
        .send({
          activityName: 'Evening Trail Run',
          date: '2026-11-17',
          durationMinutes: 50,
          stepsCount: 7500,
          caloriesBurned: 480,
        });

      expect([200, 201]).toContain(logRes.status);
      expect(logRes.body.data.fitnessActivities.length).toBeGreaterThan(0);
      expect(logRes.body.data.fitnessRewardPoints).toBeGreaterThan(0);
    });

    it('should enroll in corporate fitness challenge', async () => {
      const res = await request(app)
        .post(`/api/v1/wellness/health/${TEST_EMP_ID}/fitness/enroll`)
        .send({
          challengeName: 'Winter 150,000 Step Challenge',
          stepsGoal: 150000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.fitnessChallengeName).toBe('Winter 150,000 Step Challenge');
      expect(res.body.data.fitnessChallengeStatus).toBe('Active');
    });
  });

  // ==================== 4. WORKPLACE LIFE BALANCE ====================
  describe('4. Workplace Life Balance (Flexi, Leave, Care, Family, Fringe)', () => {
    let createdScheduleReqId: string;
    let createdLeaveReqId: string;
    let createdAccommId: string;
    let createdChildcareId: string;
    let createdFringeClaimId: string;

    it('should retrieve default workplace balance settings', async () => {
      const res = await request(app).get(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.data.wellnessDaysTotal).toBe(5);
    });

    it('should submit a schedule change request and approve it', async () => {
      const reqRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/schedule-requests`)
        .send({
          requestedSchedule: 'Hybrid',
          officeDays: 2,
          remoteDays: 3,
          coreHours: '10:00 - 16:00',
          reason: 'Deep work focus for architecture migration sprint.',
        });

      expect(reqRes.status).toBe(201);
      const reqItem = reqRes.body.data.scheduleChangeRequests.find((r: any) => r.reason.includes('Deep work focus'));
      expect(reqItem).toBeDefined();
      createdScheduleReqId = reqItem.id || reqItem._id;

      // Review and approve
      const reviewRes = await request(app)
        .patch(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/schedule-requests/${createdScheduleReqId}`)
        .send({ status: 'Approved' });

      expect(reviewRes.status).toBe(200);
      const approved = reviewRes.body.data.scheduleChangeRequests.find((r: any) => (r.id || r._id) === createdScheduleReqId);
      expect(approved.status).toBe('Approved');
      expect(reviewRes.body.data.officeDaysPerWeek).toBe(2);
    });

    it('should request a wellness day and deduct balance upon approval', async () => {
      const reqRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/leave-requests`)
        .send({
          leaveType: 'Wellness Day',
          startDate: '2026-12-01',
          endDate: '2026-12-01',
          daysCount: 1,
          reason: 'Mental recharge and family day.',
        });

      expect(reqRes.status).toBe(201);
      const leave = reqRes.body.data.paidLeaveRequests[0];
      createdLeaveReqId = leave.id || leave._id;
      const initialUsed = reqRes.body.data.wellnessDaysUsed;

      // Approve request
      const reviewRes = await request(app)
        .patch(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/leave-requests/${createdLeaveReqId}`)
        .send({ status: 'Approved' });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.data.wellnessDaysUsed).toBe(initialUsed + 1);
    });

    it('should request accommodation and allocate a room number', async () => {
      const reqRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/accommodation-requests`)
        .send({
          facilityName: 'Huremaso Executive Residencies - Suite 300',
          roomType: 'Executive Suite',
          checkInDate: '2026-12-10',
          checkOutDate: '2026-12-15',
          reason: 'On-site executive quarterly summit.',
        });

      expect(reqRes.status).toBe(201);
      const acc = reqRes.body.data.accommodationRequests[0];
      createdAccommId = acc.id || acc._id;

      // Allocate room
      const reviewRes = await request(app)
        .patch(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/accommodation-requests/${createdAccommId}`)
        .send({ status: 'Allocated', allocatedRoomNumber: 'Suite-404' });

      expect(reviewRes.status).toBe(200);
      const allocated = reviewRes.body.data.accommodationRequests.find((a: any) => (a.id || a._id) === createdAccommId);
      expect(allocated.status).toBe('Allocated');
      expect(allocated.allocatedRoomNumber).toBe('Suite-404');
    });

    it('should request childcare assistance and approve enrollment', async () => {
      const reqRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/childcare-requests`)
        .send({
          childName: 'Emma Johnson',
          childAge: 4,
          facilityName: 'Bright Horizons Partner Academy',
          requestedMonthlyStipend: 450,
        });

      expect(reqRes.status).toBe(201);
      const cc = reqRes.body.data.childCareRequests[0];
      createdChildcareId = cc.id || cc._id;

      // Approve childcare
      const reviewRes = await request(app)
        .patch(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/childcare-requests/${createdChildcareId}`)
        .send({ status: 'Enrolled' });

      expect(reviewRes.status).toBe(200);
      const enrolled = reviewRes.body.data.childCareRequests.find((c: any) => (c.id || c._id) === createdChildcareId);
      expect(enrolled.status).toBe('Enrolled');
      expect(reviewRes.body.data.childCareStipendActive).toBe(true);
    });

    it('should create a family event and register for it', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/family-events`)
        .send({
          title: 'Huremaso Annual Winter Wonderland Gala',
          date: '2026-12-20',
          location: 'Grand Ballroom & Courtyard',
          description: 'Festive celebrations, dinner, and children gifts.',
        });

      expect(addRes.status).toBe(201);
      const ev = addRes.body.data.familyEvents.find((e: any) => e.title.includes('Winter Wonderland'));
      expect(ev).toBeDefined();

      // Register
      const regRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/family-events/register`)
        .send({ eventName: ev.title });

      expect(regRes.status).toBe(200);
      expect(regRes.body.data.familyEventsRegistered).toContain(ev.title);
    });

    it('should submit a fringe reimbursement claim and approve it', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/fringe-claims`)
        .send({
          title: 'Home Office Ultra-Fast Fiber 1Gbps',
          category: 'Connectivity',
          amount: 110,
          currency: 'USD',
          description: 'Monthly broadband invoice',
        });

      expect(addRes.status).toBe(201);
      const claim = addRes.body.data.fringeClaims.find((f: any) => f.title.includes('Fiber 1Gbps'));
      expect(claim).toBeDefined();
      createdFringeClaimId = claim.claimId;

      // Approve claim
      const patchRes = await request(app)
        .patch(`/api/v1/wellness/workplace-balance/${TEST_EMP_ID}/fringe-claims/${createdFringeClaimId}`)
        .send({ status: 'Approved' });

      expect(patchRes.status).toBe(200);
      const approved = patchRes.body.data.fringeClaims.find((f: any) => f.claimId === createdFringeClaimId);
      expect(approved.status).toBe('Approved');
    });
  });

  // ==================== 5. SUMMARY STATS ====================
  describe('5. Wellness Aggregated Summary Stats Endpoint', () => {
    it('should return aggregated database-backed wellness metrics', async () => {
      const res = await request(app).get('/api/v1/wellness/stats/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalGrantedEsopShares).toBeGreaterThanOrEqual(0);
      expect(res.body.data.totalPortfolioValue).toBeGreaterThanOrEqual(0);
      expect(res.body.data.totalCompletedTrainingHours).toBeGreaterThanOrEqual(0);
      expect(res.body.data.totalActiveCertifications).toBeGreaterThanOrEqual(0);
      expect(res.body.data.activeInsurancePoliciesCount).toBeGreaterThanOrEqual(0);
      expect(res.body.data.activeFlexibleSchedulesCount).toBeGreaterThanOrEqual(0);
    });
  });
});
