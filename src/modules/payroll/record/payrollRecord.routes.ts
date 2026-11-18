import { Router } from 'express';
import { payrollRecordController } from './payrollRecord.controller';

const router = Router();

router.get('/reports/summary', payrollRecordController.getReportsAndAnalytics);
router.get('/employment-status', payrollRecordController.getEmploymentStatus);
router.get('/', payrollRecordController.getRecords);
router.post('/', payrollRecordController.createRecord);
router.get('/:id', payrollRecordController.getRecordById);
router.post('/:id/pay', payrollRecordController.payRecord);
router.post('/:id/generate-slip', payrollRecordController.generateSlip);
router.post('/:id/approve-pay-request', payrollRecordController.approvePayOnRequest);
router.patch('/:id', payrollRecordController.updateRecord);
router.delete('/:id', payrollRecordController.deleteRecord);

export default router;
