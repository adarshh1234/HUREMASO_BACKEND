import { Request, Response, NextFunction } from 'express';
import { analyticsService, AnalyticsService } from './analytics.service';
import { reportQuerySchema, analyticsQuerySchema, employeeOfPeriodQuerySchema } from './analytics.validator';
import { sendResponse } from '../../common/utils/apiResponse';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor(service = analyticsService) {
    this.service = service;
  }

  // ================= 1. REPORTS HANDLERS =================

  getEmployeeReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getEmployeeReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getAttendanceReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Attendance report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getLeaveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getLeaveReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Leave report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getPayrollReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getPayrollReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payroll report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecruitmentReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getRecruitmentReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Recruitment report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getOnboardingReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getOnboardingReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Onboarding report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getOffboardingReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getOffboardingReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Offboarding report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getPerformanceReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Performance report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeAppReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getEmployeeAppReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee App report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getWellnessReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getWellnessReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Wellness report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getEventsReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getEventsReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Events report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getNotificationsReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = reportQuerySchema.parse(req.query);
      const data = await this.service.getNotificationsReport(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Notifications report retrieved successfully',
        data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. ANALYTICS HANDLERS =================

  getEmployeeOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      analyticsQuerySchema.parse(req.query);
      const data = await this.service.getEmployeeOverviewAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee overview analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getAttendanceTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      analyticsQuerySchema.parse(req.query);
      const data = await this.service.getAttendanceTrendsAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Attendance trends analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getLeaveTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      analyticsQuerySchema.parse(req.query);
      const data = await this.service.getLeaveTrendsAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Leave trends analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getPayrollSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      analyticsQuerySchema.parse(req.query);
      const data = await this.service.getPayrollSummaryAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Payroll summary analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecruitmentMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      analyticsQuerySchema.parse(req.query);
      const data = await this.service.getRecruitmentMetricsAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Recruitment metrics analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getPerformanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      analyticsQuerySchema.parse(req.query);
      const data = await this.service.getPerformanceMetricsAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Performance metrics analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeOfPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      employeeOfPeriodQuerySchema.parse(req.query);
      const data = await this.service.getEmployeeOfPeriodAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee of Period analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeOfWeek = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getEmployeeOfPeriodAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee of the Week retrieved successfully',
        data: data.employeeOfWeek,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeOfMonth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getEmployeeOfPeriodAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee of the Month retrieved successfully',
        data: data.employeeOfMonth,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeOfYear = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getEmployeeOfPeriodAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee of the Year retrieved successfully',
        data: data.employeeOfYear,
      });
    } catch (error) {
      next(error);
    }
  };

  getExecutiveDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getExecutiveDashboardAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Executive dashboard analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
