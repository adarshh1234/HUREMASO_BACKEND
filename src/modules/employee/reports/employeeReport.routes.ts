import { Router } from 'express';
import { employeeReportController } from './employeeReport.controller';

const router = Router();

router
  .route('/headcount-turnover')
  .get(employeeReportController.getHeadcountTurnover);

router
  .route('/department-distribution')
  .get(employeeReportController.getDepartmentDistribution);

router
  .route('/predictive-analytics')
  .get(employeeReportController.getPredictiveAnalytics);

export default router;
