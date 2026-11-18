import { Request, Response, NextFunction } from 'express';
import { payrollAIService, PayrollAIService } from './payrollAI.service';
import { sendResponse } from '../../../common/utils/apiResponse';

export class PayrollAIController {
  constructor(private service: PayrollAIService = payrollAIService) {}

  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, context } = req.body || {};
      const result = await this.service.chat({ message: message || '', context });
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getWorkforceAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getWorkforceAnalytics();
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  getPerformanceSkills = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getPerformanceSkills();
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  getEmployeeExperience = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getEmployeeExperience();
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  getComplianceCheck = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getComplianceCheck();
      sendResponse({ res, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  };

  syncKnowledge = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.syncKnowledge();
      sendResponse({
        res,
        statusCode: 200,
        message: result.details,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const payrollAIController = new PayrollAIController();
