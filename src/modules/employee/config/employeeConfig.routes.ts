import { Router } from 'express';
import { employeeConfigController } from './employeeConfig.controller';

const router = Router();

router
  .route('/')
  .get(employeeConfigController.getConfig);

router
  .route('/optional-fields')
  .put(employeeConfigController.updateOptionalFields);

router
  .route('/custom-fields')
  .post(employeeConfigController.addCustomField);

router
  .route('/custom-fields/:name')
  .delete(employeeConfigController.deleteCustomField);

router
  .route('/reporting-methods')
  .post(employeeConfigController.addReportingMethod);

router
  .route('/reporting-methods/:name')
  .delete(employeeConfigController.deleteReportingMethod);

router
  .route('/termination-reasons')
  .post(employeeConfigController.addTerminationReason);

router
  .route('/termination-reasons/:name')
  .delete(employeeConfigController.deleteTerminationReason);

router
  .route('/import-data')
  .post(employeeConfigController.importEmployees);

export default router;
