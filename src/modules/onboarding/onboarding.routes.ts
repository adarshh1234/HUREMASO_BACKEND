import { Router } from 'express';
import onboardingCandidateRoutes from './candidate/onboardingCandidate.routes';
import { onboardingCandidateController } from './candidate/onboardingCandidate.controller';

const router = Router();

router.use('/candidates', onboardingCandidateRoutes);
router.get('/reports', onboardingCandidateController.getReportsSummary);

export const onboardingRoutes = router;
export default router;
