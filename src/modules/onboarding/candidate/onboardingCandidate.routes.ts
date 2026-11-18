import { Router } from 'express';
import { onboardingCandidateController } from './onboardingCandidate.controller';

const router = Router();

router.get('/', onboardingCandidateController.getAll);
router.post('/', onboardingCandidateController.create);
router.get('/reports/summary', onboardingCandidateController.getReportsSummary);
router.get('/:id', onboardingCandidateController.getById);
router.patch('/:id', onboardingCandidateController.update);
router.delete('/:id', onboardingCandidateController.delete);

// Section specific updates
router.patch('/:id/background-verification', onboardingCandidateController.updateVerification);
router.patch('/:id/offer', onboardingCandidateController.updateOffer);
router.patch('/:id/document', onboardingCandidateController.updateDocument);
router.patch('/:id/provisions', onboardingCandidateController.updateProvisions);
router.patch('/:id/buddy-manager', onboardingCandidateController.updateBuddyManager);
router.patch('/:id/training', onboardingCandidateController.updateTraining);
router.patch('/:id/visa', onboardingCandidateController.updateVisa);
router.patch('/:id/insurance', onboardingCandidateController.updateInsurance);
router.post('/:id/convert-to-employee', onboardingCandidateController.convertToEmployee);

export default router;
