import { Router } from 'express';
import { payrollRecordController } from './payrollRecord.controller';

const router = Router();

router.get('/', payrollRecordController.getRecords);
router.post('/', payrollRecordController.createRecord);
router.get('/reports/summary', payrollRecordController.getReportsAndAnalytics);
router.get('/:id', payrollRecordController.getRecordById);
router.post('/:id/pay', payrollRecordController.payRecord);
router.patch('/:id', payrollRecordController.updateRecord);
router.delete('/:id', payrollRecordController.deleteRecord);

export default router;
