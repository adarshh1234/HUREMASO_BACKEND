import { Router } from 'express';
import candidateRoutes from './candidate/candidate.routes';
import vacancyRoutes from './vacancy/vacancy.routes';
import jobPostingRoutes from './jobPosting/jobPosting.routes';
import applicationRoutes from './application/application.routes';
import resumeRoutes from './resume/resume.routes';
import interviewRoutes from './interview/interview.routes';
import feedbackRoutes from './interview/feedback.routes';
import talentPoolRoutes from './talentPool/talentPool.routes';

const router = Router();

router.use('/candidates', candidateRoutes);
router.use('/vacancies', vacancyRoutes);
router.use('/job-postings', jobPostingRoutes);
router.use('/jobs', jobPostingRoutes);
router.use('/applications', applicationRoutes);
router.use('/resumes', resumeRoutes);
router.use('/interviews', interviewRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/talent-pool', talentPoolRoutes);
router.use('/talent-pools', talentPoolRoutes);

export default router;
