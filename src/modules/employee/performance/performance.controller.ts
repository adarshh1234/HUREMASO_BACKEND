import { Request, Response, NextFunction } from 'express';
import { performanceService, PerformanceService } from './performance.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createReviewSchema,
  updateReviewSchema,
  createTrackerSchema,
  mongoIdSchema,
} from './performance.validator';

export class PerformanceController {
  constructor(private service: PerformanceService = performanceService) {}

  // Reviews
  getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getReviews(req.query);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createReviewSchema.parse(req.body);
      const result = await this.service.createReview(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Performance review created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateReviewSchema.parse(req.body);
      const result = await this.service.updateReview(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Performance review updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Trackers
  getTrackers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getTrackers(req.query);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createTracker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createTrackerSchema.parse(req.body);
      const result = await this.service.createTracker(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Tracker created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Appraisal Summary
  getAppraisalSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAppraisalSummary();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const performanceController = new PerformanceController();
