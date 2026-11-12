import { Request, Response, NextFunction } from 'express';
import { salaryDisbursementService, SalaryDisbursementService } from './salaryDisbursement.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createSalaryDisbursementSchema,
  updateSalaryDisbursementStatusSchema,
  querySalaryDisbursementSchema,
  mongoIdSchema,
} from './salaryDisbursement.validator';

export class SalaryDisbursementController {
  constructor(private service: SalaryDisbursementService = salaryDisbursementService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = querySalaryDisbursementSchema.parse(req.query);
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
      const validated = createSalaryDisbursementSchema.parse(req.body);
      const item = await this.service.create(validated as any);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Salary disbursement record created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  disburse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const item = await this.service.disburse(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Salary disbursed successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { status } = updateSalaryDisbursementStatusSchema.parse(req.body);
      const item = await this.service.updateStatus(id, status);
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

  getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.service.getSummary();
      sendResponse({
        res,
        statusCode: 200,
        data: summary,
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
        message: 'Disbursement record deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const salaryDisbursementController = new SalaryDisbursementController();
