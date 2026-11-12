import { Request, Response, NextFunction } from 'express';
import { dashboardService, DashboardService } from './dashboard.service';
import { dashboardQuerySchema, recentActivityQuerySchema, buzzQuerySchema } from './dashboard.validator';
import { sendResponse } from '../../common/utils/apiResponse';

export class DashboardController {
  private service: DashboardService;

  constructor(service = dashboardService) {
    this.service = service;
  }

  // GET /api/v1/dashboard or /api/v1/dashboard/overview
  getDashboardOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getDashboardOverview(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Dashboard overview data retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/summary
  getSummaryMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getSummaryMetrics(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Dashboard summary metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/time-at-work
  getTimeAtWork = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getTimeAtWork(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Time at work metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/workforce
  getWorkforceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getWorkforceMetrics(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Workforce metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/attendance
  getAttendanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getAttendanceLeaveMetrics(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Attendance and leave metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/payroll
  getPayrollMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getPayrollMetrics(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payroll metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/recruitment
  getRecruitmentMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getRecruitmentOnboardingMetrics(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Recruitment and onboarding metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/performance
  getPerformanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getPerformanceMetrics(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Performance metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/actions
  getMyActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getMyActions(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Pending actions retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/buzz
  getBuzzPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = buzzQuerySchema.parse(req.query);
      const data = await this.service.getBuzzPosts(parsed.limit);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Buzz posts retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/activities
  getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = recentActivityQuerySchema.parse(req.query);
      const data = await this.service.getRecentActivities(parsed.limit, parsed.type);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Recent activities retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
