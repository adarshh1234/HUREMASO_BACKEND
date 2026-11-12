import { Router } from 'express';
import { overtimeController } from './overtime.controller';

const router = Router();

router.post('/calculate', (req, res, next) => overtimeController.calculate(req, res, next));
router.post('/', (req, res, next) => overtimeController.create(req, res, next));
router.get('/metrics', (req, res, next) => overtimeController.getMetrics(req, res, next));
router.get('/', (req, res, next) => overtimeController.getAll(req, res, next));
router.get('/:id', (req, res, next) => overtimeController.getById(req, res, next));
router.patch('/:id/status', (req, res, next) => overtimeController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => overtimeController.delete(req, res, next));

export const overtimeRoutes = router;
export default router;
