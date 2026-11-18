import { Request, Response, NextFunction } from 'express';
import { dashboardService, DashboardService } from './dashboard.service';
import {
  dashboardQuerySchema,
  recentActivityQuerySchema,
  buzzQuerySchema,
  createBuzzPostSchema,
  updateBuzzPostSchema,
  clockInSchema,
  clockOutSchema,
} from './dashboard.validator';
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

  // GET /api/v1/dashboard/activities or /api/v1/dashboard/recent-activity
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

  // POST /api/v1/dashboard/time-at-work/clock-in
  clockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = clockInSchema.parse(req.body);
      const data = await this.service.clockIn(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Clocked in successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/dashboard/time-at-work/clock-out
  clockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = clockOutSchema.parse(req.body);
      const data = await this.service.clockOut(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Clocked out successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/employee-distribution/sub-unit
  getSubUnitDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getSubUnitDistribution(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Sub unit distribution retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/employee-distribution/location
  getLocationDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getLocationDistribution(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Location distribution retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/dashboard/employees-on-leave
  getEmployeesOnLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = dashboardQuerySchema.parse(req.query);
      const data = await this.service.getEmployeesOnLeave(filter);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employees on leave retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/dashboard/buzz
  createBuzzPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createBuzzPostSchema.parse(req.body);
      const data = await this.service.createBuzzPost(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Buzz post created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/dashboard/buzz/:id
  updateBuzzPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateBuzzPostSchema.parse(req.body);
      const data = await this.service.updateBuzzPost(String(req.params.id), parsed);
      if (!data) {
        sendResponse({
          res,
          statusCode: 404,
          message: 'Buzz post not found',
        });
        return;
      }
      sendResponse({
        res,
        statusCode: 200,
        message: 'Buzz post updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/dashboard/buzz/:id
  deleteBuzzPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await this.service.deleteBuzzPost(String(req.params.id));
      if (!deleted) {
        sendResponse({
          res,
          statusCode: 404,
          message: 'Buzz post not found',
        });
        return;
      }
      sendResponse({
        res,
        statusCode: 200,
        message: 'Buzz post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
