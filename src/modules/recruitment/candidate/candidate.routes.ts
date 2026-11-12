import { Router } from 'express';
import { candidateController } from './candidate.controller';
import { CandidateValidator } from './candidate.validator';

const router = Router();

router.get('/pipeline-metrics', candidateController.getPipelineMetrics);
router.get('/', candidateController.getAll);
router.post('/', CandidateValidator.validateCreate, candidateController.create);
router.get('/:id', candidateController.getById);
router.put('/:id', CandidateValidator.validateUpdate, candidateController.update);
router.patch('/:id/status', candidateController.updateStatus);
router.patch('/:id/stage', candidateController.progressStage);
router.delete('/:id', candidateController.delete);
router.post('/:id/convert-to-employee', candidateController.convertToEmployee);

export default router;
