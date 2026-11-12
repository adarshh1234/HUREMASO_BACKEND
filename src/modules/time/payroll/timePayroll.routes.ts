import { Router } from 'express';
import { timePayrollController } from './timePayroll.controller';
import { validateRequest } from '../../../common/middlewares/validateRequest';
import { createTimePayrollSchema, updateTimePayrollSchema } from './timePayroll.validator';

const router = Router();

router.get('/summary', (req, res) => timePayrollController.getSummary(req, res));
router.get('/export', (req, res) => timePayrollController.exportFeed(req, res));
router.post('/calculate', (req, res) => timePayrollController.calculate(req, res));

router.get('/', (req, res) => timePayrollController.getAll(req, res));
router.post('/', validateRequest(createTimePayrollSchema), (req, res) => timePayrollController.create(req, res));

router.get('/:id', (req, res) => timePayrollController.getById(req, res));
router.put('/:id', validateRequest(updateTimePayrollSchema), (req, res) => timePayrollController.update(req, res));
router.delete('/:id', (req, res) => timePayrollController.delete(req, res));

export const timePayrollRoutes = router;
