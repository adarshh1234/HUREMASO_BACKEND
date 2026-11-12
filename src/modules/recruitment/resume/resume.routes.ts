import { Router } from 'express';
import { resumeController } from './resume.controller';

const router = Router();

router.post('/parse-cv', (req, res, next) => resumeController.parseCv(req, res, next));
router.post('/', (req, res, next) => resumeController.create(req, res, next));
router.get('/', (req, res, next) => resumeController.getAll(req, res, next));
router.get('/:id', (req, res, next) => resumeController.getById(req, res, next));
router.put('/:id', (req, res, next) => resumeController.update(req, res, next));
router.patch('/:id', (req, res, next) => resumeController.update(req, res, next));
router.post('/:id/match-vacancy', (req, res, next) => resumeController.matchVacancy(req, res, next));
router.delete('/:id', (req, res, next) => resumeController.delete(req, res, next));

export default router;
