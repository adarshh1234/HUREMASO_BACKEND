import { Router } from 'express';
import { interviewController } from './interview.controller';

const router = Router();

router.post('/', (req, res, next) => interviewController.create(req, res, next));
router.get('/', (req, res, next) => interviewController.getAll(req, res, next));
router.get('/:id', (req, res, next) => interviewController.getById(req, res, next));
router.put('/:id', (req, res, next) => interviewController.update(req, res, next));
router.patch('/:id', (req, res, next) => interviewController.update(req, res, next));
router.delete('/:id', (req, res, next) => interviewController.delete(req, res, next));

export default router;
