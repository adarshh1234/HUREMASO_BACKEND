import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { NoteModel } from '../src/modules/notes/notes.model';

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

describe('HUREMASO Notes Module Complete Integration Tests', () => {
  let createdPolicyId: string;
  let createdInterviewNoteId: string;
  let createdChecklistId: string;
  let createdMemoId: string;

  // ================= 1. ALL NOTES HUB & SEEDING =================
  describe('1. All Notes Hub & Default Seeding (/api/v1/notes)', () => {
    it('should initialize and return default seeded enterprise notes on first load', async () => {
      const res = await request(app).get('/api/v1/notes');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      // Verify presence of seeded categories
      const categories = res.body.data.map((n: any) => n.category);
      expect(categories).toContain('Checklists');
      expect(categories).toContain('Interview Notes');
      expect(categories).toContain('HR Policy');
      expect(categories).toContain('Memos');
    });

    it('should retrieve category counts breakdown via /categories/counts', async () => {
      const res = await request(app).get('/api/v1/notes/categories/counts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.all).toBeGreaterThanOrEqual(4);
      expect(res.body.data.checklists).toBeGreaterThanOrEqual(1);
      expect(res.body.data.interviewNotes).toBeGreaterThanOrEqual(1);
      expect(res.body.data.hrPolicy).toBeGreaterThanOrEqual(1);
      expect(res.body.data.memos).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pinned).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve all unique tags across notes via /tags/all', async () => {
      const res = await request(app).get('/api/v1/notes/tags/all');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toContain('onboarding');
      expect(res.body.data).toContain('compliance');
    });
  });

  // ================= 2. HR POLICY NOTES =================
  describe('2. HR Policy Notes (/api/v1/notes)', () => {
    it('should create a structured HR Policy note with scope and tags', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          title: 'Hybrid Work & Home Ergonomics Allowance Policy 2026',
          category: 'HR Policy',
          content: 'Full-time remote and hybrid employees can claim an annual $750 ergonomics workspace reimbursement with valid receipts.',
          description: 'Official corporate policy for workplace wellness and remote ergonomic setups.',
          applicableScope: 'Global Engineering & Product Teams',
          policyStatus: 'Active',
          pinned: true,
          tags: ['policy', 'ergonomics', 'wellness', 'remote-work', 'benefits'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Hybrid Work & Home Ergonomics Allowance Policy 2026');
      expect(res.body.data.category).toBe('HR Policy');
      expect(res.body.data.applicableScope).toBe('Global Engineering & Product Teams');
      expect(res.body.data.pinned).toBe(true);

      createdPolicyId = res.body.data.id || res.body.data._id;
    });

    it('should filter notes by category HR Policy', async () => {
      const res = await request(app).get('/api/v1/notes?category=HR%20Policy');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.every((n: any) => n.category.toLowerCase() === 'hr policy')).toBe(true);
    });
  });

  // ================= 3. INTERVIEW NOTES =================
  describe('3. Interview Notes (/api/v1/notes)', () => {
    it('should create an Interview Note with candidate details, ratings, and evaluation points', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          title: 'Staff Platform Engineer Evaluation - Marcus Vance',
          category: 'Interview Notes',
          content: 'Candidate has strong background in distributed systems, Rust microservices, and Kubernetes orchestration. Good communication style.',
          description: 'Technical panel debrief note for senior platform engineer candidate.',
          candidateName: 'Marcus Vance',
          vacancyName: 'Staff Cloud Infrastructure Engineer',
          interviewerName: 'Sarah Jenkins (Principal Architect)',
          interviewRound: 'System Design & Distributed Scalability',
          interviewDate: '2026-09-18',
          technicalRating: 9,
          communicationRating: 8,
          strengths: 'Outstanding depth in Raft consensus protocol and eBPF observability.',
          improvements: 'Minor hesitation in multi-tenant resource isolation policies.',
          tags: ['interview', 'engineering', 'platform', 'rust', 'evaluation'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.candidateName).toBe('Marcus Vance');
      expect(res.body.data.technicalRating).toBe(9);
      expect(res.body.data.interviewRound).toContain('System Design');

      createdInterviewNoteId = res.body.data.id || res.body.data._id;
    });

    it('should filter notes by category Interview Notes', async () => {
      const res = await request(app).get('/api/v1/notes?category=Interview%20Notes');

      expect(res.status).toBe(200);
      expect(res.body.data.some((n: any) => n.candidateName === 'Marcus Vance')).toBe(true);
    });
  });

  // ================= 4. CHECKLISTS =================
  describe('4. Checklists & Dynamic Item Completion (/api/v1/notes)', () => {
    it('should create a checklist note with interactive checklist items', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          title: 'Executive Offboarding & Security Revocation Checklist',
          category: 'Checklists',
          content: 'Complete mandatory compliance checklist within 24 hours of executive departure.',
          tags: ['offboarding', 'security', 'compliance'],
          checklistItems: [
            { id: 'off-1', text: 'Revoke AWS IAM and GitHub Enterprise admin privileges', completed: true, order: 1 },
            { id: 'off-2', text: 'Deprovision Okta SSO and 1Password enterprise vault access', completed: false, order: 2 },
            { id: 'off-3', text: 'Schedule exit interview with VP of People', completed: false, order: 3 },
            { id: 'off-4', text: 'Initiate DHL return kit for corporate hardware', completed: false, order: 4 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.checklistItems.length).toBe(4);
      expect(res.body.data.checklistItems[0].completed).toBe(true);

      createdChecklistId = res.body.data.id || res.body.data._id;
    });

    it('should update all checklist items via PATCH /:id/checklist', async () => {
      const updatedItems = [
        { id: 'off-1', text: 'Revoke AWS IAM and GitHub Enterprise admin privileges', completed: true, order: 1 },
        { id: 'off-2', text: 'Deprovision Okta SSO and 1Password enterprise vault access', completed: true, order: 2 },
        { id: 'off-3', text: 'Schedule exit interview with VP of People', completed: true, order: 3 },
        { id: 'off-4', text: 'Initiate DHL return kit for corporate hardware', completed: false, order: 4 },
      ];

      const res = await request(app)
        .patch(`/api/v1/notes/${createdChecklistId}/checklist`)
        .send({ checklistItems: updatedItems });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.checklistItems.filter((i: any) => i.completed).length).toBe(3);
    });

    it('should toggle an individual checklist item via PATCH /:id/checklist/:itemId/toggle', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${createdChecklistId}/checklist/off-4/toggle`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const item4 = res.body.data.checklistItems.find((i: any) => i.id === 'off-4');
      expect(item4.completed).toBe(true);
    });
  });

  // ================= 5. MEMOS =================
  describe('5. Memos Management (/api/v1/notes)', () => {
    it('should create an internal HR Memo with subject, visibility, and author', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          title: 'Mandatory Global Annual Compliance Training 2026',
          category: 'Memos',
          content: 'All global employees must complete the 2026 Anti-Bribery, Insider Trading, and Data Privacy refresher modules by October 31.',
          memoSubject: 'FY26 Compliance Training Deadline',
          visibility: 'internal',
          authorName: 'Chief Legal Officer',
          tags: ['memo', 'compliance', 'training', 'legal'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.memoSubject).toBe('FY26 Compliance Training Deadline');
      expect(res.body.data.visibility).toBe('internal');

      createdMemoId = res.body.data.id || res.body.data._id;
    });
  });

  // ================= 6. SEARCH & FILTERING =================
  describe('6. Search & Tag Filtering (/api/v1/notes)', () => {
    it('should search notes across title and content', async () => {
      const res = await request(app).get('/api/v1/notes?search=Ergonomics');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Ergonomics');
    });

    it('should search notes by candidate name for interview notes', async () => {
      const res = await request(app).get('/api/v1/notes?search=Marcus%20Vance');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].candidateName).toBe('Marcus Vance');
    });

    it('should filter notes by specific tag', async () => {
      const res = await request(app).get('/api/v1/notes?tag=rust');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].tags).toContain('rust');
    });
  });

  // ================= 7. PIN & UNPIN =================
  describe('7. Pin & Unpin Notes (/api/v1/notes/:id/pin)', () => {
    it('should unpin a pinned note', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${createdPolicyId}/pin`)
        .send({ pinned: false });

      expect(res.status).toBe(200);
      expect(res.body.data.pinned).toBe(false);
    });

    it('should pin an unpinned note', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${createdMemoId}/pin`)
        .send({ pinned: true });

      expect(res.status).toBe(200);
      expect(res.body.data.pinned).toBe(true);
    });
  });

  // ================= 8. AI SUMMARIZATION =================
  describe('8. AI Summarization (/api/v1/notes/:id/ai-summarize)', () => {
    it('should generate an intelligent, content-aware AI summary for the interview note', async () => {
      const res = await request(app).post(`/api/v1/notes/${createdInterviewNoteId}/ai-summarize`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(typeof res.body.data.summary).toBe('string');
      expect(res.body.data.summary.length).toBeGreaterThan(20);

      // Verify summary is stored on the document
      const getRes = await request(app).get(`/api/v1/notes/${createdInterviewNoteId}`);
      expect(getRes.body.data.aiSummary).toBe(res.body.data.summary);
    });
  });

  // ================= 9. EDIT & NOTE DETAILS =================
  describe('9. Edit Note & Inspection (/api/v1/notes/:id)', () => {
    it('should fetch note details by specific ID', async () => {
      const res = await request(app).get(`/api/v1/notes/${createdPolicyId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Hybrid Work');
      expect(res.body.data.tags).toContain('ergonomics');
    });

    it('should update note title and content via PUT /api/v1/notes/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${createdPolicyId}`)
        .send({
          title: 'Revised Hybrid Work & Home Ergonomics Allowance Policy 2026',
          content: 'Updated: Full-time employees can claim up to $1,000 annually for approved home office ergonomics.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Revised Hybrid Work');
      expect(res.body.data.content).toContain('$1,000');
    });
  });

  // ================= 10. VALIDATION SAFEGUARDS =================
  describe('10. Validation Safeguards', () => {
    it('should reject note creation with missing title', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          content: 'Content without title',
          category: 'HR Policy',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject note creation with empty content', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .send({
          title: 'Title with empty content',
          content: '   ',
          category: 'HR Policy',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ================= 11. DELETION & 404 HANDLING =================
  describe('11. Note Deletion & 404 Handling', () => {
    it('should delete a note cleanly by ID', async () => {
      const res = await request(app).delete(`/api/v1/notes/${createdMemoId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify subsequent GET returns 404
      const checkRes = await request(app).get(`/api/v1/notes/${createdMemoId}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent note', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/notes/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
