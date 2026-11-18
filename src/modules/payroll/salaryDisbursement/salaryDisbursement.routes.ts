import { Router } from 'express';
import { salaryDisbursementController } from './salaryDisbursement.controller';

const router = Router();

router.get('/summary', salaryDisbursementController.getSummary);
router.get('/', salaryDisbursementController.getAll);
router.post('/', salaryDisbursementController.create);
router.get('/:id', salaryDisbursementController.getById);
router.post('/:id/disburse', salaryDisbursementController.disburse);
router.patch('/:id/status', salaryDisbursementController.updateStatus);
router.delete('/:id', salaryDisbursementController.delete);

export default router;
