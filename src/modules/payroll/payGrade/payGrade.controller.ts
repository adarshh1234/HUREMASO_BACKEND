import { Request, Response, NextFunction } from 'express';
import { payGradeService, PayGradeService } from './payGrade.service';
import { createPayGradeSchema, updatePayGradeSchema } from './payGrade.validator';
import { sendResponse } from '../../../common/utils/apiResponse';

export class PayGradeController {
  constructor(private service: PayGradeService = payGradeService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await this.service.getAll({ search, status });
      sendResponse({
        res,
        statusCode: 200,
        data: result.items,
        pagination: { total: result.total, page: 1, limit: result.total },
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.getById(String(req.params.id));
      sendResponse({ res, statusCode: 200, data: item });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPayGradeSchema.parse(req.body);
      const item = await this.service.create(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Pay grade created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updatePayGradeSchema.parse(req.body);
      const item = await this.service.update(String(req.params.id), validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Pay grade updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(String(req.params.id));
      sendResponse({
        res,
        statusCode: 200,
        message: 'Pay grade deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const payGradeController = new PayGradeController();
