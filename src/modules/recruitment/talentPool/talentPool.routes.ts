import { Router } from 'express';
import { talentPoolController } from './talentPool.controller';

const router = Router();

router.post('/', (req, res, next) => talentPoolController.create(req, res, next));
router.get('/', (req, res, next) => talentPoolController.getAll(req, res, next));
router.get('/:id', (req, res, next) => talentPoolController.getById(req, res, next));
router.get('/:id/candidates', (req, res, next) => talentPoolController.getCandidates(req, res, next));
router.put('/:id', (req, res, next) => talentPoolController.update(req, res, next));
router.patch('/:id', (req, res, next) => talentPoolController.update(req, res, next));
router.delete('/:id', (req, res, next) => talentPoolController.delete(req, res, next));
router.post('/:id/candidates', (req, res, next) => talentPoolController.addCandidate(req, res, next));
router.post('/:id/associate-job', (req, res, next) => talentPoolController.associateJob(req, res, next));
router.delete('/:id/candidates/:candidateId', (req, res, next) =>
  talentPoolController.removeCandidate(req, res, next)
);

export default router;
