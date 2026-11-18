import { Request, Response, NextFunction } from 'express';
import { financeRequestService, FinanceRequestService } from './financeRequest.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createFinanceRequestSchema,
  updateFinanceRequestStatusSchema,
  queryFinanceRequestSchema,
  mongoIdSchema,
} from './financeRequest.validator';

export class FinanceRequestController {
  constructor(private service: FinanceRequestService = financeRequestService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryFinanceRequestSchema.parse(req.query);
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
      const validated = createFinanceRequestSchema.parse(req.body);
      const item = await this.service.create(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Finance request created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { status, remarks, notes, approvedBy } = updateFinanceRequestStatusSchema.parse(req.body);
      const item = await this.service.updateStatus(id, status, remarks || notes, approvedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: `Status updated successfully to ${status}`,
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
        message: 'Finance request deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const financeRequestController = new FinanceRequestController();
