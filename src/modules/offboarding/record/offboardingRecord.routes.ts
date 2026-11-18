import { Router } from 'express';
import { offboardingRecordController } from './offboardingRecord.controller';

const router = Router();

router.get('/reports/summary', offboardingRecordController.getReportsSummary);
router.get('/', offboardingRecordController.getAll);
router.post('/', offboardingRecordController.create);
router.get('/:id', offboardingRecordController.getById);
router.patch('/:id', offboardingRecordController.update);
router.delete('/:id', offboardingRecordController.delete);

// Section specific updates
router.patch('/:id/document', offboardingRecordController.updateDocument);
router.patch('/:id/performance', offboardingRecordController.updatePerformance);
router.patch('/:id/settlement', offboardingRecordController.updateSettlement);
router.patch('/:id/legal', offboardingRecordController.updateLegal);
router.patch('/:id/assets', offboardingRecordController.updateAssets);
router.patch('/:id/travel', offboardingRecordController.updateTravel);
router.patch('/:id/custom-fields', offboardingRecordController.updateCustomFields);

export default router;
