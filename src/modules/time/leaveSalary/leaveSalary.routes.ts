import { Router } from 'express';
import { leaveSalaryController } from './leaveSalary.controller';
import { validateRequest } from '../../../common/middlewares/validateRequest';
import { createLeaveSalarySchema, updateLeaveSalaryStatusSchema } from './leaveSalary.validator';

const router = Router();

router.get('/metrics', (req, res) => leaveSalaryController.getMetrics(req, res));
router.post('/calculate', (req, res) => leaveSalaryController.calculateEncashment(req, res));

router.get('/', (req, res) => leaveSalaryController.getAll(req, res));
router.post('/', validateRequest(createLeaveSalarySchema), (req, res) => leaveSalaryController.create(req, res));

router.get('/:id', (req, res) => leaveSalaryController.getById(req, res));
router.put('/:id', (req, res) => leaveSalaryController.update(req, res));
router.patch('/:id/status', validateRequest(updateLeaveSalaryStatusSchema), (req, res) => leaveSalaryController.updateStatus(req, res));
router.delete('/:id', (req, res) => leaveSalaryController.delete(req, res));

export const leaveSalaryRoutes = router;
