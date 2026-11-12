import { Request, Response, NextFunction } from 'express';
import { leaveService, LeaveService } from './leave.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createLeaveRequestSchema,
  updateLeaveRequestStatusSchema,
  assignLeaveSchema,
  addEntitlementSchema,
  leavePeriodConfigSchema,
  leaveTypeConfigSchema,
  workWeekConfigSchema,
  holidaySchema,
  mongoIdSchema,
} from './leave.validator';

export class LeaveController {
  constructor(private service: LeaveService = leaveService) {}

  // Requests
  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createLeaveRequestSchema.parse(req.body);
      const result = await this.service.createRequest(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Leave requested successfully',
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

  updateRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateLeaveRequestStatusSchema.parse(req.body);
      const result = await this.service.updateRequestStatus(id, validated.status, validated.comments);
      sendResponse({
        res,
        statusCode: 200,
        message: `Leave request marked as ${validated.status}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  assignLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = assignLeaveSchema.parse(req.body);
      const result = await this.service.assignLeave(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Leave assigned successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Balances
  getBalances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeName = req.query.employeeName as string | undefined;
      const result = await this.service.getBalances(employeeName);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Entitlements
  addEntitlement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = addEntitlementSchema.parse(req.body);
      const result = await this.service.addEntitlement(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Entitlement added successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getEntitlements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getEntitlements(req.query);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Reports
  getLeaveUsageReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leaveType = req.query.leaveType as string | undefined;
      const result = await this.service.getLeaveUsageReport(leaveType);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Config: Period
  getLeavePeriod = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getLeavePeriod();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  saveLeavePeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = leavePeriodConfigSchema.parse(req.body);
      const result = await this.service.saveLeavePeriod(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Leave period saved successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Config: Types
  getLeaveTypes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getLeaveTypes();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createLeaveType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = leaveTypeConfigSchema.parse(req.body);
      const result = await this.service.createLeaveType(validated.name, validated.daysPerYear);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Leave type created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateLeaveType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = leaveTypeConfigSchema.parse(req.body);
      const result = await this.service.updateLeaveType(id, validated.name);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Leave type updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteLeaveType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteLeaveType(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Leave type deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Config: Work Week
  getWorkWeek = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getWorkWeek();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  saveWorkWeek = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = workWeekConfigSchema.parse(req.body);
      const result = await this.service.saveWorkWeek(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Work week config saved successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Holidays
  getHolidays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
      const result = await this.service.getHolidays(fromDate, toDate);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = holidaySchema.parse(req.body);
      const result = await this.service.createHoliday(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Holiday added successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = holidaySchema.parse(req.body);
      const result = await this.service.updateHoliday(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Holiday updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteHoliday(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Holiday deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const leaveController = new LeaveController();
