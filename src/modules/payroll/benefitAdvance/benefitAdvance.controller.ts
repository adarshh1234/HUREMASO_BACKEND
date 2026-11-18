import { Request, Response, NextFunction } from 'express';
import { benefitAdvanceService, BenefitAdvanceService } from './benefitAdvance.service';
import {
  createBenefitAdvanceSchema,
  updateBenefitAdvanceStatusSchema,
  queryBenefitAdvanceSchema,
  mongoIdSchema,
  createBenefitSchemeSchema,
  updateBenefitSchemeSchema,
} from './benefitAdvance.validator';
import { sendResponse } from '../../../common/utils/apiResponse';

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
      sendResponse({ res, statusCode: 200, data: item });
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
        message: 'Benefit advance request submitted successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { status, remarks, notes, approvedBy } = updateBenefitAdvanceStatusSchema.parse(req.body);
      const item = await this.service.updateStatus(id, status, remarks || notes, approvedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: `Benefit advance status updated to ${status}`,
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
        message: 'Benefit advance record deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // ─── Schemes ───────────────────────────────────────────────────────────────
  getSchemes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.query.category as string | undefined;
      const tab = req.query.tab as string | undefined;
      const schemes = await this.service.getSchemes(category, tab);
      sendResponse({ res, statusCode: 200, data: schemes });
    } catch (err) {
      next(err);
    }
  };

  createScheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createBenefitSchemeSchema.parse(req.body);
      const scheme = await this.service.createScheme(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Benefit scheme created successfully',
        data: scheme,
      });
    } catch (err) {
      next(err);
    }
  };

  updateScheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateBenefitSchemeSchema.parse(req.body);
      const scheme = await this.service.updateScheme(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Benefit scheme updated successfully',
        data: scheme,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const benefitAdvanceController = new BenefitAdvanceController();
