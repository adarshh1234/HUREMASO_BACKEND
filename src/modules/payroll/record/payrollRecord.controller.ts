import { Request, Response, NextFunction } from 'express';
import { payrollRecordService, PayrollRecordService } from './payrollRecord.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createPayrollRecordSchema,
  updatePayrollRecordSchema,
  payRecordSchema,
  queryPayrollRecordSchema,
  mongoIdSchema,
  approvePayOnRequestSchema,
} from './payrollRecord.validator';

export class PayrollRecordController {
  constructor(private service: PayrollRecordService = payrollRecordService) {}

  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryPayrollRecordSchema.parse(req.query);
      const result = await this.service.getRecords(query);
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

  getRecordById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const record = await this.service.getRecordById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  };

  createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPayrollRecordSchema.parse(req.body);
      const record = await this.service.createRecord(validated as any);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Payroll record created successfully',
        data: record,
      });
    } catch (err) {
      next(err);
    }
  };

  payRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = (req.params.id || req.body.id) as string;
      const validId = mongoIdSchema.parse(id);
      const validatedPayload = payRecordSchema.parse(req.body);

      const updatedRecord = await this.service.processPayment(validId, validatedPayload);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payment completed successfully',
        data: updatedRecord,
      });
    } catch (err) {
      next(err);
    }
  };

  updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updatePayrollRecordSchema.parse(req.body);
      const record = await this.service.updateRecord(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payroll record updated successfully',
        data: record,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteRecord(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payroll record deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  getReportsAndAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reports = await this.service.getReportsAndAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        data: reports,
      });
    } catch (err) {
      next(err);
    }
  };

  getEmploymentStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getEmploymentStatusSummary();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  generateSlip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const record = await this.service.generateSlip(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Salary slip generated successfully',
        data: record,
      });
    } catch (err) {
      next(err);
    }
  };

  approvePayOnRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { status, approvalRemarks, approvedBy } = approvePayOnRequestSchema.parse(req.body);
      const record = await this.service.approvePayOnRequest(id, status, approvalRemarks, approvedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: `Pay on request marked as ${status}`,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const payrollRecordController = new PayrollRecordController();
