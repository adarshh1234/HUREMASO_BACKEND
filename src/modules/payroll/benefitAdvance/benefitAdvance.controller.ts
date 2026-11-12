import { Request, Response, NextFunction } from 'express';
import { benefitAdvanceService, BenefitAdvanceService } from './benefitAdvance.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createBenefitAdvanceSchema,
  updateBenefitAdvanceStatusSchema,
  queryBenefitAdvanceSchema,
  mongoIdSchema,
} from './benefitAdvance.validator';

export class BenefitAdvanceController {
  constructor(private service: BenefitAdvanceService = benefitAdvanceService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryBenefitAdvanceSchema.parse(req.query);
      const result = await this.service.getAll(query);
      sendResponse({
        res,
        statusCode: 200,
        data: result.items,
        pagination: {
          total: result.total,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const item = await this.service.getById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createBenefitAdvanceSchema.parse(req.body);
      const item = await this.service.create(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Benefit advance created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { status, notes } = updateBenefitAdvanceStatusSchema.parse(req.body);
      const item = await this.service.updateStatus(id, status, notes);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Status updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.delete(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Benefit advance deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const benefitAdvanceController = new BenefitAdvanceController();
