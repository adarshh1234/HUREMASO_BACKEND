import { Router } from 'express';
import offboardingRecordRoutes from './record/offboardingRecord.routes';
import { offboardingRecordController } from './record/offboardingRecord.controller';

const router = Router();

router.use('/records', offboardingRecordRoutes);
router.get('/reports', offboardingRecordController.getReportsSummary);

// Also expose directly for ease of access
router.use('/', offboardingRecordRoutes);

export const offboardingRoutes = router;
export default router;
