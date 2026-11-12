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

describe('Recruitment Module Integration Tests', () => {
  let createdCandidateId: string;
  let createdVacancyId: string;
  let createdJobPostingId: string;
  let createdApplicationId: string;
  let createdResumeId: string;
  let createdInterviewId: string;
  let createdTalentPoolId: string;

  // 1. VACANCY
  describe('Vacancies API (/api/v1/recruitment/vacancies)', () => {
    it('should create a new vacancy', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/vacancies')
        .send({
          title: 'Senior React Developer',
          department: 'Engineering',
          jobTitle: 'Senior Frontend Engineer',
          hiringManager: 'John Doe',
          numberOfPositions: 3,
          jobDescription: 'Build modern UI applications in React and TypeScript',
          skillsRequired: ['React', 'TypeScript', 'Node.js', 'Redux'],
          experienceRequired: '4-6 years',
          status: 'Active',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Senior React Developer');
      expect(res.body.data.numberOfPositions).toBe(3);
      createdVacancyId = res.body.data.id || res.body.data._id;
    });

    it('should get all vacancies', async () => {
      const res = await request(app).get('/api/v1/recruitment/vacancies');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('should get vacancy by id', async () => {
      const res = await request(app).get(`/api/v1/recruitment/vacancies/${createdVacancyId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Senior React Developer');
    });

    it('should update vacancy details', async () => {
      const res = await request(app)
        .put(`/api/v1/recruitment/vacancies/${createdVacancyId}`)
        .send({
          numberOfPositions: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.numberOfPositions).toBe(5);
    });
  });

  // 2. CANDIDATE
  describe('Candidates API (/api/v1/recruitment/candidates)', () => {
    it('should create a new candidate', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/candidates')
        .send({
          firstName: 'Alex',
          lastName: 'Morgan',
          email: 'alex.morgan.test@example.com',
          contactNumber: '+1 555 123 4567',
          jobTitle: 'Frontend Engineer',
          vacancyId: createdVacancyId,
          experience: 5,
          skills: ['React', 'TypeScript', 'CSS', 'Jest'],
          status: 'Application Initiated',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Alex');
      createdCandidateId = res.body.data.id || res.body.data._id;
    });

    it('should get candidate by id', async () => {
      const res = await request(app).get(`/api/v1/recruitment/candidates/${createdCandidateId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('alex.morgan.test@example.com');
    });

    it('should update candidate status', async () => {
      const res = await request(app)
        .patch(`/api/v1/recruitment/candidates/${createdCandidateId}/status`)
        .send({
          status: 'Shortlisted',
          comment: 'Strong candidate profile',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Shortlisted');
    });
  });

  // 3. JOB POSTINGS & LETGETIN
  describe('Job Postings API (/api/v1/recruitment/job-postings)', () => {
    it('should create a job posting', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/job-postings')
        .send({
          vacancyId: createdVacancyId,
          jobTitle: 'Senior React Developer',
          department: 'Engineering',
          location: 'Remote',
          employmentType: 'Full-Time',
          description: 'We are hiring a Senior React Developer',
          platform: 'Internal',
          status: 'Draft',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.jobTitle).toBe('Senior React Developer');
      createdJobPostingId = res.body.data.id || res.body.data._id;
    });

    it('should publish job posting to LetsGetIn', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/job-postings/${createdJobPostingId}/publish`)
        .send({ platform: 'LetsGetIn' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Live on Letgetin');
    });
  });

  // 4. APPLICATION & PIPELINE TRACKING
  describe('Applications API (/api/v1/recruitment/applications)', () => {
    it('should create an application', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/applications')
        .send({
          candidateId: createdCandidateId,
          vacancyId: createdVacancyId,
          jobPostingId: createdJobPostingId,
          status: 'Applied',
          currentStage: 'Initial Screening',
          matchScore: 85,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('Applied');
      createdApplicationId = res.body.data.id || res.body.data._id;
    });

    it('should update application status and push to statusHistory', async () => {
      const res = await request(app)
        .patch(`/api/v1/recruitment/applications/${createdApplicationId}/status`)
        .send({
          status: 'Interview Scheduled',
          stage: 'Technical Round 1',
          comment: 'Candidate cleared initial screening',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Interview Scheduled');
      expect(res.body.data.statusHistory.length).toBeGreaterThan(1);
    });

    it('should get application metrics', async () => {
      const res = await request(app).get('/api/v1/recruitment/applications/metrics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // 5. RESUME & CV PARSER
  describe('Resume & CV Parser API (/api/v1/recruitment/resumes)', () => {
    it('should parse raw resume text and return extracted skills and match score', async () => {
      const rawText = `
        Alex Morgan
        alex.morgan@testdomain.com | (555) 123-4567
        Senior React Developer with 5 years of experience
        Skills: React, TypeScript, Node.js, Redux, Docker, Git, Express
        Education: B.Tech in Computer Science
        Experience:
        Lead Frontend Engineer at TechCorp
        Built high-traffic web applications
      `;

      const res = await request(app)
        .post('/api/v1/recruitment/resumes/parse-cv')
        .send({
          rawText,
          vacancyId: createdVacancyId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.parsedData.skills).toContain('React');
      expect(res.body.data.parsedData.skills).toContain('TypeScript');
      expect(res.body.data.matchScore).toBeGreaterThan(50);
      if (res.body.data.resume) {
        createdResumeId = res.body.data.resume.id || res.body.data.resume._id;
      }
    });

    it('should get all resumes', async () => {
      const res = await request(app).get('/api/v1/recruitment/resumes');
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
    });
  });

  // 6. INTERVIEW & FEEDBACK
  describe('Interview & Feedback API (/api/v1/recruitment/interviews & /feedback)', () => {
    it('should schedule an interview', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/interviews')
        .send({
          candidateId: createdCandidateId,
          vacancyId: createdVacancyId,
          applicationId: createdApplicationId,
          roundName: 'Technical Round 1',
          interviewDate: new Date().toISOString(),
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          interviewers: [{ name: 'Lead Architect', role: 'Technical Lead' }],
          interviewType: 'Technical',
          mode: 'Online',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.roundName).toBe('Technical Round 1');
      createdInterviewId = res.body.data.id || res.body.data._id;
    });

    it('should submit feedback for the interview', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/feedback')
        .send({
          interviewId: createdInterviewId,
          candidateId: createdCandidateId,
          interviewerName: 'Lead Architect',
          technicalRating: 5,
          communicationRating: 4,
          overallRating: 5,
          recommendation: 'Strong Hire',
          comments: 'Excellent knowledge of React and TypeScript architecture.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.recommendation).toBe('Strong Hire');
    });

    it('should get feedback by candidate id', async () => {
      const res = await request(app).get(`/api/v1/recruitment/feedback/candidate/${createdCandidateId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // 7. TALENT POOL
  describe('Talent Pool API (/api/v1/recruitment/talent-pool)', () => {
    it('should create a talent pool', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/talent-pool')
        .send({
          name: 'Core Frontend Engineers',
          description: 'High-performing React & TypeScript talent bench',
          department: 'Engineering',
          tags: ['React', 'Frontend', 'TypeScript'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Core Frontend Engineers');
      createdTalentPoolId = res.body.data.id || res.body.data._id;
    });

    it('should add a candidate to the talent pool', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/talent-pool/${createdTalentPoolId}/candidates`)
        .send({
          candidateId: createdCandidateId,
          notes: 'Strong candidate for upcoming frontend projects',
          rating: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.candidates.length).toBeGreaterThan(0);
    });
  });

  // 8. CANDIDATE CONVERSION TO EMPLOYEE
  describe('Candidate Convert to Employee (/api/v1/recruitment/candidates/:id/convert-to-employee)', () => {
    it('should convert hired candidate into a full Employee entity', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/candidates/${createdCandidateId}/convert-to-employee`)
        .send({
          employeeId: 'EMP888001',
          department: 'Software Engineering',
          jobTitle: 'Senior React Developer',
          location: 'Kochi',
          category: 'staff',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employee).toBeDefined();
      expect(res.body.data.employee.employeeId).toBe('EMP888001');
      expect(res.body.data.candidate.status).toBe('Hired');
      expect(res.body.data.candidate.employeeId).toBeDefined();
    });
  });
});
