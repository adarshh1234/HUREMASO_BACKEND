import { Router } from 'express';
import { performanceController } from './performance.controller';

const router = Router();

// Reviews
router
  .route('/reviews')
  .get(performanceController.getReviews)
  .post(performanceController.createReview);

router
  .route('/reviews/:id')
  .patch(performanceController.updateReview);

// Trackers
router
  .route('/trackers')
  .get(performanceController.getTrackers)
  .post(performanceController.createTracker);

// Appraisal Summary
router
  .route('/appraisal/summary')
  .get(performanceController.getAppraisalSummary);

export default router;
