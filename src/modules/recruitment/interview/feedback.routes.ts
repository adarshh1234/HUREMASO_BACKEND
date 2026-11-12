import { Router } from 'express';
import { feedbackController } from './feedback.controller';

const router = Router();

router.post('/', (req, res, next) => feedbackController.create(req, res, next));
router.get('/', (req, res, next) => feedbackController.getAll(req, res, next));
router.get('/interview/:interviewId', (req, res, next) => feedbackController.getByInterview(req, res, next));
router.get('/candidate/:candidateId', (req, res, next) => feedbackController.getByCandidate(req, res, next));
router.get('/:id', (req, res, next) => feedbackController.getById(req, res, next));
router.put('/:id', (req, res, next) => feedbackController.update(req, res, next));
router.patch('/:id', (req, res, next) => feedbackController.update(req, res, next));
router.delete('/:id', (req, res, next) => feedbackController.delete(req, res, next));

export default router;
