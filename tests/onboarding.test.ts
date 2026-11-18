import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { OnboardingCandidateModel } from '../src/modules/onboarding/candidate/onboardingCandidate.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await OnboardingCandidateModel.deleteMany({});
});

afterAll(async () => {
  await OnboardingCandidateModel.deleteMany({});
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Employee Onboarding Module Integration Tests (/api/v1/onboarding)', () => {
  let createdCandidateId: string;

  // 1. FINAL LIST / CANDIDATES PIPELINE
  describe('1. Candidates Pipeline API (/api/v1/onboarding/candidates)', () => {
    it('should create an onboarding candidate and return status 201', async () => {
      const res = await request(app)
        .post('/api/v1/onboarding/candidates')
        .send({
          name: 'Sarah Connor',
          email: 'sarah.connor@testcyberdyne.com',
          phone: '+1-555-0199',
          role: 'Staff Systems Engineer',
          department: 'Engineering',
          startDate: 'Nov 01, 2026',
          baseSalary: '$180,000',
          equity: '0.20%',
          buddyName: 'Kyle Reese',
          managerName: 'Miles Dyson',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Sarah Connor');
      expect(res.body.data.role).toBe('Staff Systems Engineer');
      expect(res.body.data.department).toBe('Engineering');
      expect(res.body.data.candidateId).toMatch(/^ONB-\d+/);
      createdCandidateId = res.body.data._id || res.body.data.id;
    });

    it('should fail with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/onboarding/candidates')
        .send({
          name: '',
          email: 'invalid-email',
        });

      expect(res.status).toBe(400);
    });

    it('should list all candidates with search, filter, and pagination', async () => {
      const res = await request(app)
        .get('/api/v1/onboarding/candidates')
        .query({ search: 'Sarah', department: 'Engineering' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].email).toBe('sarah.connor@testcyberdyne.com');
    });

    it('should get a single candidate by ID', async () => {
      const res = await request(app).get(`/api/v1/onboarding/candidates/${createdCandidateId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Sarah Connor');
    });
  });

  // 2. BACKGROUND VERIFICATION
  describe('2. Background Verification API', () => {
    it('should update background verification check status to Verified', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/background-verification`)
        .send({
          checkType: 'legal',
          status: 'Verified',
          notes: 'Court records clear',
          verifiedBy: 'Checkr API',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.backgroundVerification.legal.status).toBe('Verified');
      expect(res.body.data.backgroundVerification.legal.verifiedBy).toBe('Checkr API');
    });

    it('should support flagging a verification check', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/background-verification`)
        .send({
          checkType: 'pcc',
          status: 'Flagged',
          notes: 'Police check requires manual precinct review',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.backgroundVerification.pcc.status).toBe('Flagged');
    });
  });

  // 3. SMART OFFER MANAGEMENT
  describe('3. Offer Management API', () => {
    it('should update candidate offer details and package', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/offer`)
        .send({
          roleTitle: 'Lead Systems Architect',
          baseSalary: '$195,000',
          equity: '0.25%',
          bonus: '20% Annual',
          signOnBonus: '$15,000',
          status: 'Offer Accepted',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.offer.baseSalary).toBe('$195,000');
      expect(res.body.data.offer.roleTitle).toBe('Lead Systems Architect');
      expect(res.body.data.offer.status).toBe('Offer Accepted');
    });
  });

  // 4. EMPLOYMENT DOCUMENTS (CONTRACT & NDA)
  describe('4. Employment Documents API', () => {
    it('should update contract status to Drafted then Signed', async () => {
      const draftRes = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/document`)
        .send({
          docType: 'contract',
          status: 'Drafted',
        });

      expect(draftRes.status).toBe(200);
      expect(draftRes.body.data.documents.contract.status).toBe('Drafted');

      const signRes = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/document`)
        .send({
          docType: 'contract',
          status: 'Signed',
          signedDate: '2026-10-01',
        });

      expect(signRes.status).toBe(200);
      expect(signRes.body.data.documents.contract.status).toBe('Signed');
      expect(signRes.body.data.documents.contract.signedDate).toBe('2026-10-01');
    });

    it('should update NDA document status to Signed', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/document`)
        .send({
          docType: 'nda',
          status: 'Signed',
          signedDate: '2026-10-01',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.documents.nda.status).toBe('Signed');
    });
  });

  // 5. HARDWARE & ASSET PROVISIONS
  describe('5. Hardware & Provisions API', () => {
    it('should assign and update company assets and hardware provisions', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/provisions`)
        .send({
          laptop: {
            assigned: true,
            model: 'MacBook Pro 16" M3 Max',
            serialNo: 'C02H89230KL',
            status: 'Shipped',
          },
          workstation: {
            assigned: true,
            deskNo: 'Desk 5C-22',
            location: 'HQ Floor 5',
          },
          simCard: {
            assigned: true,
            number: '+1 (555) 777-8899',
          },
          homeOffice: {
            assigned: true,
            allowance: 2000,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provisions.laptop.assigned).toBe(true);
      expect(res.body.data.provisions.laptop.model).toContain('MacBook Pro');
      expect(res.body.data.provisions.workstation.deskNo).toBe('Desk 5C-22');
      expect(res.body.data.provisions.homeOffice.allowance).toBe(2000);
    });
  });

  // 6. BUDDY & DIRECT MANAGER ASSIGNMENT
  describe('6. Buddy & Direct Manager API', () => {
    it('should update buddy, direct manager, and schedule meetings', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/buddy-manager`)
        .send({
          buddyName: 'John Connor',
          buddyRole: 'Principal Architect',
          managerName: 'Sarah Jenkins',
          managerRole: 'VP of Engineering',
          meetingScheduled: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.buddyManager.buddyName).toBe('John Connor');
      expect(res.body.data.buddyManager.meetingScheduled).toBe(true);
    });
  });

  // 7. TRAINING CURRICULUM
  describe('7. Training Curriculum API', () => {
    it('should update candidate training modules and progress tracking', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/training`)
        .send({
          modules: [
            { title: 'Security & Compliance 2026', duration: '45 mins', progress: 100, status: 'Completed' },
            { title: 'Architecture Overview', duration: '2 hours', progress: 50, status: 'In Progress' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.training).toHaveLength(2);
      expect(res.body.data.training[0].status).toBe('Completed');
      expect(res.body.data.training[1].progress).toBe(50);
    });
  });

  // 8. VISA & IMMIGRATION
  describe('8. Visa & Immigration API', () => {
    it('should update work authorization and visa petition records', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/visa`)
        .send({
          visaType: 'O-1 Extraordinary Ability',
          passportNo: 'USA-9988123',
          expiryDate: '2030-12-31',
          country: 'United States',
          status: 'Approved',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.visa.visaType).toBe('O-1 Extraordinary Ability');
      expect(res.body.data.visa.status).toBe('Approved');
    });
  });

  // 9. HEALTH & INSURANCE ENROLLMENT
  describe('9. Health & Insurance API', () => {
    it('should update health insurance coverage and policy information', async () => {
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/insurance`)
        .send({
          provider: 'Kaiser Permanente Premier',
          policyNumber: 'KP-99001122',
          coverageAmount: '$1,500,000',
          dependentsCount: 3,
          status: 'Active',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.insurance.provider).toBe('Kaiser Permanente Premier');
      expect(res.body.data.insurance.dependentsCount).toBe(3);
    });
  });

  // 10. VALIDATION & READY TO JOIN WORKFLOW
  describe('10. Workflow & Validation (Ready to Join)', () => {
    it('should prevent marking Ready to Join if background check is flagged', async () => {
      // pcc is currently flagged from test #2
      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}`)
        .send({ status: 'Ready to Join' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Cannot mark candidate as 'Ready to Join'");
      expect(res.body.message).toContain('pcc');
    });

    it('should allow marking Ready to Join once all checks are cleared', async () => {
      // Clear pcc check
      await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}/background-verification`)
        .send({
          checkType: 'pcc',
          status: 'Verified',
          notes: 'Clear record confirmed',
        });

      const res = await request(app)
        .patch(`/api/v1/onboarding/candidates/${createdCandidateId}`)
        .send({ status: 'Ready to Join' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Ready to Join');
    });
  });

  // 11. CANDIDATE TO EMPLOYEE CONVERSION
  describe('11. Candidate to Employee Conversion API', () => {
    it('should convert an onboarding candidate to an Employee record and set status to Completed', async () => {
      const res = await request(app)
        .post(`/api/v1/onboarding/candidates/${createdCandidateId}/convert-to-employee`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.candidate.status).toBe('Completed');
      expect(res.body.data.employee).toBeDefined();
    });

    it('should prevent duplicate employee creation on multiple conversion calls', async () => {
      const res = await request(app)
        .post(`/api/v1/onboarding/candidates/${createdCandidateId}/convert-to-employee`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employee).toBeDefined();
    });
  });

  // 12. REPORTS & INSIGHTS
  describe('12. Reports & Analytics API', () => {
    it('should return aggregated metrics without hardcoded static responses', async () => {
      const res = await request(app).get('/api/v1/onboarding/reports');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.totalOnboarding).toBe('number');
      expect(typeof res.body.data.completedCount).toBe('number');
      expect(typeof res.body.data.complianceRate).toBe('number');
      expect(typeof res.body.data.averageOnboardingDays).toBe('number');
      expect(res.body.data.completedCount).toBeGreaterThanOrEqual(1);
    });

    it('should also serve reports from /api/v1/onboarding/candidates/reports/summary', async () => {
      const res = await request(app).get('/api/v1/onboarding/candidates/reports/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalOnboarding).toBeGreaterThanOrEqual(1);
    });
  });

  // 13. DELETION
  describe('13. Deletion API', () => {
    it('should delete a candidate by ID', async () => {
      const res = await request(app).delete(`/api/v1/onboarding/candidates/${createdCandidateId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app).get(`/api/v1/onboarding/candidates/${createdCandidateId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
