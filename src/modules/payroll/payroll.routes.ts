import { Router } from 'express';
import payrollRecordRoutes from './record/payrollRecord.routes';
import financeRequestRoutes from './financeRequest/financeRequest.routes';
import benefitAdvanceRoutes from './benefitAdvance/benefitAdvance.routes';
import salaryDisbursementRoutes from './salaryDisbursement/salaryDisbursement.routes';
import paymentApplicationRoutes from './paymentApplication/paymentApplication.routes';
import payrollAIRoutes from './ai/payrollAI.routes';
import payGradeRoutes from './payGrade/payGrade.routes';
import { payrollRecordController } from './record/payrollRecord.controller';

const router = Router();

// Sub-routes
router.use('/records', payrollRecordRoutes);
router.post('/pay', payrollRecordController.payRecord);
router.get('/reports', payrollRecordController.getReportsAndAnalytics);
router.use('/finance-requests', financeRequestRoutes);
router.use('/benefit-advances', benefitAdvanceRoutes);
router.use('/disbursements', salaryDisbursementRoutes);
router.use('/payment-apps', paymentApplicationRoutes);
router.use('/pay-grades', payGradeRoutes);
router.use('/ai', payrollAIRoutes);

export const payrollRoutes = router;
export default router;
