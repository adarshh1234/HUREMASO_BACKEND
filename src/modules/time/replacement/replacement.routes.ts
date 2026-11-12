import { Router } from 'express';
import { replacementController } from './replacement.controller';

const router = Router();

router.post('/', (req, res, next) => replacementController.create(req, res, next));
router.get('/metrics', (req, res, next) => replacementController.getMetrics(req, res, next));
router.get('/', (req, res, next) => replacementController.getAll(req, res, next));
router.get('/:id', (req, res, next) => replacementController.getById(req, res, next));
router.patch('/:id/status', (req, res, next) => replacementController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => replacementController.delete(req, res, next));

export const replacementRoutes = router;
export default router;
