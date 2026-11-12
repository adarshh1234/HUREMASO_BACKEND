import { Request, Response, NextFunction } from 'express';
import { employeeRequestService, EmployeeRequestService } from './request.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createEmployeeRequestSchema,
  updateRequestStatusSchema,
  mongoIdSchema,
} from './request.validator';

export class EmployeeRequestController {
  constructor(private service: EmployeeRequestService = employeeRequestService) {}

  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createEmployeeRequestSchema.parse(req.body);
      const result = await this.service.createRequest(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Request created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getRequests(req.query);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const result = await this.service.getRequestById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateRequestStatusSchema.parse(req.body);
      const result = await this.service.updateStatus(
        id,
        validated.status,
        validated.approver,
        validated.rejectionReason
      );
      sendResponse({
        res,
        statusCode: 200,
        message: `Request status updated to ${validated.status}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const employeeRequestController = new EmployeeRequestController();
