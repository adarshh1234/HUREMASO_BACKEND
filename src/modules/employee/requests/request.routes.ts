import { Router } from 'express';
import { employeeRequestController } from './request.controller';

const router = Router();

router
  .route('/')
  .post(employeeRequestController.createRequest)
  .get(employeeRequestController.getRequests);

router
  .route('/:id')
  .get(employeeRequestController.getRequestById);

router
  .route('/:id/status')
  .patch(employeeRequestController.updateStatus);

export default router;
