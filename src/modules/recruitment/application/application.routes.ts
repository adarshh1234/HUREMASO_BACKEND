import { Router } from 'express';
import { applicationController } from './application.controller';

const router = Router();

router.post('/', (req, res, next) => applicationController.create(req, res, next));
router.get('/metrics', (req, res, next) => applicationController.getMetrics(req, res, next));
router.get('/', (req, res, next) => applicationController.getAll(req, res, next));
router.get('/:id', (req, res, next) => applicationController.getById(req, res, next));
router.put('/:id', (req, res, next) => applicationController.update(req, res, next));
router.patch('/:id/status', (req, res, next) => applicationController.updateStatus(req, res, next));
router.put('/:id/status', (req, res, next) => applicationController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => applicationController.delete(req, res, next));

export default router;
