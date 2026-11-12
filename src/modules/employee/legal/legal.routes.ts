import { Router } from 'express';
import { legalController } from './legal.controller';

const router = Router();

router
  .route('/overview')
  .get(legalController.getOverview);

router
  .route('/ai-query')
  .post(legalController.analyzeAiQuery);

export default router;
