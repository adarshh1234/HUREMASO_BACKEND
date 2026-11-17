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

describe('HUREMASO Recruitment Module Full ATS Test Suite', () => {
  let vacancyId: string;
  let candidateId: string;
  let resumeId: string;
  let jobPostingId: string;
  let applicationId: string;
  let feedbackId: string;
  let talentPoolId: string;

  // ==========================================
  // SECTION 8 & 3: VACANCY & JOB POSTING CREATION
  // ==========================================
  describe('Section 8 & 3: Vacancy Management & Post a Job', () => {
    it('should create an active vacancy in MongoDB', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/vacancies')
        .send({
          title: 'Full Stack Cloud Architect',
          department: 'Engineering',
          jobTitle: 'Lead Cloud Architect',
          hiringManager: 'Amal Benny',
          numberOfPositions: 2,
          jobDescription: 'Design scalable microservices and manage AWS cloud infrastructure.',
          skillsRequired: ['React', 'Node.js', 'AWS', 'Kubernetes', 'TypeScript'],
          experienceRequired: '5-8 years',
          status: 'Active',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Full Stack Cloud Architect');
      expect(res.body.data.numberOfPositions).toBe(2);
      vacancyId = res.body.data.id || res.body.data._id;
      expect(vacancyId).toBeDefined();
    });

    it('should create a job posting and publish it to LetsGetIn', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/job-postings')
        .send({
          title: 'Lead Cloud Architect',
          department: 'Engineering',
          location: 'Kochi (Hybrid)',
          locationType: 'Hybrid',
          type: 'Full-time',
          minSalary: 2000000,
          maxSalary: 2500000,
          currency: 'INR',
          salaryRange: '₹20,00,000 - ₹25,00,000',
          skills: ['AWS', 'Kubernetes', 'TypeScript', 'Node.js'],
          qualifications: 'B.Tech / M.Tech in CS or equivalent',
          description: 'High visibility role managing cloud deployment.',
          platform: 'LetsGetIn',
          status: 'Published',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.platformPostId).toBeDefined();
      expect(res.body.data.liveUrl).toContain('letgetin.com/jobs/');
      jobPostingId = res.body.data.id || res.body.data._id;
    });
  });

  // ==========================================
  // SECTION 1: RESUME MANAGEMENT & LETSGETIN SYNC
  // ==========================================
  describe('Section 1: Resume Management & LetsGetIn Verified Pools', () => {
    it('should sync verified candidates from LetsGetIn network into MongoDB', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/resumes/sync-letsgetin');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.syncedCount).toBeGreaterThanOrEqual(5);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should retrieve resume metrics accurately', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/resumes/metrics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalResumes).toBeGreaterThanOrEqual(5);
      expect(res.body.data.verifiedCount).toBeGreaterThanOrEqual(5);
      expect(res.body.data.highMatchCount).toBeGreaterThanOrEqual(1);
    });

    it('should upload a direct candidate resume', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/resumes')
        .send({
          candidateName: 'Vikram Menon',
          email: 'vikram.menon@example.com',
          phone: '+91 98450 99887',
          role: 'Full Stack Cloud Architect',
          experience: '6 Years',
          experienceYears: 6,
          location: 'Kochi (Hybrid)',
          expectedSalary: '₹22,00,000 / yr',
          noticePeriod: 'Immediate',
          skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Kubernetes', 'Docker'],
          education: [{ degree: 'B.Tech in CSE - NIT Calicut' }],
          previousCompany: 'CloudNative Corp',
          summary: 'Experienced Cloud Architect with 6 years experience in AWS, Kubernetes, React, and microservices.',
          source: 'Direct Upload',
          isVerifiedLetsGetIn: true,
          matchScore: 95,
          assessmentScore: 94,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.candidateName).toBe('Vikram Menon');
      resumeId = res.body.data.id || res.body.data._id;
      expect(resumeId).toBeDefined();
    });

    it('should compute explainable skills match against open vacancy', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/resumes/${resumeId}/match-vacancy`)
        .send({
          vacancyId: vacancyId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchScore).toBeGreaterThanOrEqual(80);
      expect(Array.isArray(res.body.data.matchedSkills)).toBe(true);
      expect(res.body.data.matchedSkills).toContain('AWS');
      expect(res.body.data.matchedSkills).toContain('Kubernetes');
    });
  });

  // ==========================================
  // SECTION 2: AI CV PARSER
  // ==========================================
  describe('Section 2: AI CV Parser & Entity Extraction', () => {
    it('should parse raw resume text and extract candidate entities and skills', async () => {
      const rawResumeText = `
        Kavya Iyer
        kavya.iyer@example.com | +91 98451 12345
        Senior Frontend Engineer with 4 years of experience building modern React, TypeScript, and Next.js applications.
        Skills: React, TypeScript, Next.js, Tailwind CSS, Jest, GraphQL, Docker
        Education: Bachelor of Technology in Computer Science - CUSAT
        Experience: Senior Frontend Developer at AppCraft Technologies
      `;

      const res = await request(app)
        .post('/api/v1/recruitment/resumes/parse-cv')
        .send({
          rawText: rawResumeText,
          fileName: 'Kavya_Iyer_CV.pdf',
          vacancyId: vacancyId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.parsedData.name).toBe('Kavya Iyer');
      expect(res.body.data.parsedData.email).toBe('kavya.iyer@example.com');
      expect(res.body.data.parsedData.skills).toContain('React');
      expect(res.body.data.parsedData.skills).toContain('TypeScript');
      expect(res.body.data.parsedData.skills).toContain('Next.js');
    });
  });

  // ==========================================
  // SECTION 7: CANDIDATE MANAGEMENT
  // ==========================================
  describe('Section 7: Candidate Management Master ATS', () => {
    it('should create a new candidate in MongoDB', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/candidates')
        .send({
          name: 'Vikram Menon',
          email: 'vikram.candidate@example.com',
          phone: '+91 98450 99887',
          vacancy: 'Full Stack Cloud Architect',
          hiringManager: 'Amal Benny',
          experienceYears: 6,
          skills: ['React', 'Node.js', 'AWS', 'Kubernetes'],
          education: 'B.Tech in CSE',
          status: 'Applied',
          poolCategory: 'Technical Skills',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Vikram Menon');
      candidateId = res.body.data.id || res.body.data._id;
      expect(candidateId).toBeDefined();
    });

    it('should filter candidates by keywords and jobTitle', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/candidates?keywords=Vikram');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data.items || res.body.data;
      expect(items.some((c: any) => c.name === 'Vikram Menon')).toBe(true);
    });

    it('should update candidate details', async () => {
      const res = await request(app)
        .put(`/api/v1/recruitment/candidates/${candidateId}`)
        .send({
          status: 'Interview',
          notes: 'Passed initial phone screen with flying colors.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Interview');
    });
  });

  // ==========================================
  // SECTION 4: TRACK APPLICANTS
  // ==========================================
  describe('Section 4: Track Applicants Pipeline', () => {
    it('should create an application linking candidate and vacancy', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/applications')
        .send({
          candidateId: candidateId,
          vacancyId: vacancyId,
          status: 'Applied',
          source: 'LetsGetIn',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      applicationId = res.body.data.id || res.body.data._id;
      expect(applicationId).toBeDefined();
    });

    it('should update application status and push to statusHistory audit trail', async () => {
      const res = await request(app)
        .put(`/api/v1/recruitment/applications/${applicationId}/status`)
        .send({
          status: 'Shortlisted',
          notes: 'Candidate approved by engineering hiring manager.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Shortlisted');
      expect(res.body.data.statusHistory.length).toBeGreaterThan(0);
    });

    it('should list all applications with populate', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/applications');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.items || res.body.data || [];
      expect(items.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // SECTION 5: TALENT POOL
  // ==========================================
  describe('Section 5: Talent Pool & Candidate Association', () => {
    it('should create a talent pool category', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/talent-pool')
        .send({
          name: 'Cloud & Infrastructure Specialists',
          department: 'Engineering',
          description: 'Specialists in AWS, Kubernetes, Terraform, and distributed systems.',
          skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker'],
          tags: ['Cloud', 'DevOps', 'High Priority'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      talentPoolId = res.body.data.id || res.body.data._id;
      expect(talentPoolId).toBeDefined();
    });

    it('should add a candidate to the talent pool', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/talent-pool/${talentPoolId}/candidates`)
        .send({
          candidateId: candidateId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.candidates.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // SECTION 6: FEEDBACK AND INTERVIEW FORM
  // ==========================================
  describe('Section 6: Interview Feedback & Evaluation', () => {
    it('should submit interview feedback and automatically synchronize candidate status', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/feedback')
        .send({
          candidateId: candidateId,
          candidateName: 'Vikram Menon',
          position: 'Full Stack Cloud Architect',
          interviewDate: '2026-03-30',
          interviewerName: 'Amal Benny',
          technicalRating: 5,
          communicationRating: 4,
          assessment: 'Exceptional',
          recommendation: 'Strong Hire',
          comments: 'Exceptional technical depth across microservices and cloud infrastructure. Strong culture fit.',
          overallRating: 5,
          rating: 5,
          status: 'Hire',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      feedbackId = res.body.data.id || res.body.data._id;
      expect(feedbackId).toBeDefined();
      expect(res.body.data.recommendation).toBe('Strong Hire');
    });

    it('should retrieve all feedback records with filter', async () => {
      const res = await request(app)
        .get('/api/v1/recruitment/feedback?search=Vikram');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data || [];
      expect(items.some((f: any) => f.candidateName === 'Vikram Menon')).toBe(true);
    });
  });

  // ==========================================
  // SECTION 8: VACANCY OPENINGS & HIRING AUTOMATION
  // ==========================================
  describe('Section 8: Vacancy Hiring & Dynamic Openings Calculation', () => {
    it('should mark candidate as Hired and verify vacancy filled/remaining counts updated', async () => {
      // 1. Update candidate to Hired
      const candRes = await request(app)
        .put(`/api/v1/recruitment/candidates/${candidateId}`)
        .send({
          status: 'Hired',
        });

      expect(candRes.status).toBe(200);
      expect(candRes.body.data.status).toBe('Hired');

      // 2. Fetch vacancy and verify filledPositions incremented
      const vacRes = await request(app)
        .get(`/api/v1/recruitment/vacancies/${vacancyId}`);

      expect(vacRes.status).toBe(200);
      expect(vacRes.body.data.filledPositions).toBeGreaterThanOrEqual(1);
      expect(vacRes.body.data.remainingPositions).toBeLessThanOrEqual(1);
    });

    it('should convert hired candidate to employee entity', async () => {
      const res = await request(app)
        .post(`/api/v1/recruitment/candidates/${candidateId}/convert-to-employee`)
        .send({
          department: 'Engineering',
          joiningDate: '2026-04-15',
          salary: 2200000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employee).toBeDefined();
    });
  });

  // ==========================================
  // CLEANUP & DELETION VERIFICATION
  // ==========================================
  describe('Record Deletion & Data Integrity', () => {
    it('should delete feedback record', async () => {
      const res = await request(app)
        .delete(`/api/v1/recruitment/feedback/${feedbackId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should delete application record', async () => {
      const res = await request(app)
        .delete(`/api/v1/recruitment/applications/${applicationId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should delete direct resume record', async () => {
      const res = await request(app)
        .delete(`/api/v1/recruitment/resumes/${resumeId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
