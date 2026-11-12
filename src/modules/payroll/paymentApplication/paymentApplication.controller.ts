import { Request, Response, NextFunction } from 'express';
import { paymentApplicationService, PaymentApplicationService } from './paymentApplication.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createPaymentApplicationSchema,
  updatePaymentApplicationSchema,
  queryPaymentApplicationSchema,
  mongoIdSchema,
} from './paymentApplication.validator';

export class PaymentApplicationController {
  constructor(private service: PaymentApplicationService = paymentApplicationService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryPaymentApplicationSchema.parse(req.query);
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
      const validated = createPaymentApplicationSchema.parse(req.body);
      const item = await this.service.create(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Payment application configured successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updatePaymentApplicationSchema.parse(req.body);
      const item = await this.service.update(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payment application updated successfully',
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
        message: 'Payment application deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const paymentApplicationController = new PaymentApplicationController();
