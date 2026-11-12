import { Request, Response, NextFunction } from 'express';
import { employeeReportService, EmployeeReportService } from './employeeReport.service';
import { sendResponse } from '../../../common/utils/apiResponse';

export class EmployeeReportController {
  constructor(private service: EmployeeReportService = employeeReportService) {}

  getHeadcountTurnover = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getHeadcountTurnover();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getDepartmentDistribution = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getDepartmentDistribution();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getPredictiveAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getPredictiveAnalytics();
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

export const employeeReportController = new EmployeeReportController();
