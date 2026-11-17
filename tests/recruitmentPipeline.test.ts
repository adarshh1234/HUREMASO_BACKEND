import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { CandidateModel } from '../src/modules/recruitment/candidate/candidate.model';
import { VacancyModel } from '../src/modules/recruitment/vacancy/vacancy.model';
import { JobPostingModel } from '../src/modules/recruitment/jobPosting/jobPosting.model';
import { TalentPoolModel } from '../src/modules/recruitment/talentPool/talentPool.model';

let mongoServer: MongoMemoryServer;

describe('Recruitment Pipeline E2E Integration Tests', () => {
  let createdVacancyId: string;
  let createdCandidateId: string;
  let createdPoolId: string;
  let createdJobPostingId: string;

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

  describe('1. Vacancies Management & Pipeline Metrics', () => {
    it('should create a vacancy and retrieve its dynamic pipeline metrics', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/vacancies')
        .send({
          jobTitle: 'Pipeline Test Senior Architect',
          department: 'Engineering',
          numberOfOpenings: 3,
          hiringManager: 'Jane Doe',
          status: 'Active',
          location: 'San Francisco, CA',
          jobDescription: 'Leading architecture initiatives'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      createdVacancyId = res.body.data._id || res.body.data.id;
      expect(createdVacancyId).toBeDefined();

      // Retrieve pipeline statistics
      const pipeRes = await request(app)
        .get(`/api/v1/recruitment/vacancies/${createdVacancyId}/pipeline`);

      expect(pipeRes.status).toBe(200);
      expect(pipeRes.body.success).toBe(true);
      expect(pipeRes.body.data.openings).toBe(3);
      expect(pipeRes.body.data.pipeline).toBeDefined();
      expect(pipeRes.body.data.pipeline.applied).toBeDefined();
    });

    it('should list all vacancies with computed openings and remaining positions', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/vacancies');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((v: any) => v.id === createdVacancyId || v._id === createdVacancyId);
      expect(found).toBeDefined();
      expect(found.openings).toBe(3);
      expect(found.remainingPositions).toBeDefined();
    });
  });

  describe('2. Talent Pool & Candidate Integration', () => {
    it('should seed or retrieve talent pool categories with candidate counts', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/talent-pool');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      createdPoolId = res.body.data[0]._id || res.body.data[0].id;
    });

    it('should create a candidate with skills and talent pool assignment', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/candidates')
        .send({
          name: 'Alex Pipeline',
          email: 'alex@pipeline-test.com',
          phone: '+1 555-0199',
          jobTitle: 'Senior React Engineer',
          talentPool: 'Technical Skills',
          skills: ['React', 'TypeScript', 'Node.js'],
          experience: 6,
          education: 'B.S. in CS',
          status: 'Applied'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdCandidateId = res.body.data._id || res.body.data.id;
      expect(createdCandidateId).toBeDefined();
    });

    it('should reject duplicate candidate email with HTTP 409', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/candidates')
        .send({
          name: 'Alex Duplicate',
          email: 'alex@pipeline-test.com',
          jobTitle: 'Junior Dev',
          talentPool: 'Technical Skills'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists|already registered/i);
    });

    it('should associate a talent pool candidate to a vacancy', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/talent-pool/${createdPoolId}/candidates/${createdCandidateId}/associate`)
        .send({ vacancyId: createdVacancyId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.candidate.vacancyId).toBe(createdVacancyId);
    });
  });

  describe('3. Create Job & Automated Vacancy Synchronization', () => {
    it('should save a job posting as Draft', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/job-postings')
        .send({
          title: 'Pipeline Test Draft Engineer',
          department: 'Engineering',
          status: 'Draft',
          platform: 'Internal',
          salaryRange: 'USD 90,000 - 110,000'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Draft');
    });

    it('should publish a job posting and auto-link/create a Vacancy in MongoDB', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/job-postings')
        .send({
          title: 'Pipeline Test Published Specialist',
          department: 'People Operations',
          status: 'Published',
          platform: 'LetsGetIn',
          salaryRange: 'USD 110,000 - 140,000',
          skills: ['Talent Sourcing', 'HR Management'],
          description: 'Recruiting top talent across globe'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.platformPostId).toMatch(/^LGT-/);
      expect(res.body.data.liveUrl).toMatch(/letgetin\.com\/jobs\//);
      expect(res.body.data.vacancyId).toBeDefined();

      createdJobPostingId = res.body.data._id || res.body.data.id;

      // Verify that the vacancy was actually created/linked in Vacancies collection
      const vacancy = await VacancyModel.findById(res.body.data.vacancyId);
      expect(vacancy).not.toBeNull();
      expect(vacancy?.jobTitle).toBe('Pipeline Test Published Specialist');
    });
  });

  describe('4. LetGetIn Integration & Network Synchronization', () => {
    it('should query active LetGetIn postings', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/job-postings/letgetin/active');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((j: any) => (j._id || j.id) === createdJobPostingId);
      expect(found).toBeDefined();
    });

    it('should trigger real-time LetGetIn network synchronization', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/job-postings/letgetin/sync')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('synchronized');
      expect(res.body.data.connected).toBe(true);
      expect(res.body.data.activePostingsCount).toBeGreaterThan(0);
      expect(res.body.data.lastSyncAt).toBeDefined();
    });

    it('should unpublish a LetGetIn posting back to Draft', async () => {
      const res = await request(app)
        .put(`/api/v1/recruitment/job-postings/${createdJobPostingId}/unpublish`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Draft');

      // Verify that it no longer appears in active LetGetIn postings
      const activeRes = await request(app)
        .get('/api/v1/recruitment/job-postings/letgetin/active');
      expect(activeRes.status).toBe(200);
      const stillActive = activeRes.body.data.find((j: any) => (j._id || j.id) === createdJobPostingId);
      expect(stillActive).toBeUndefined();
    });
  });
});
