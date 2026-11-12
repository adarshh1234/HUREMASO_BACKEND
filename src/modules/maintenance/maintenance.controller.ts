import { Request, Response, NextFunction } from 'express';
import { maintenanceService, MaintenanceService } from './maintenance.service';
import {
  createMaintenanceTicketSchema,
  updateMaintenanceTicketSchema,
  assignTicketSchema,
  updateTicketStatusSchema,
  addCommentSchema,
  createHuremasoLogSchema,
  updateHuremasoLogSchema,
  maintenanceQueryFilterSchema,
} from './maintenance.validator';
import { sendResponse } from '../../common/utils/apiResponse';

const getParam = (params: Request['params'], key: string): string => String(params[key] || '');

export class MaintenanceController {
  private service: MaintenanceService;

  constructor(service = maintenanceService) {
    this.service = service;
  }

  // ================= 1. ACTIVE SUPPORT TICKETS HANDLERS =================

  listTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = maintenanceQueryFilterSchema.parse(req.query);
      const data = await this.service.listTickets(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Active maintenance tickets retrieved successfully',
        data: data.tickets,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getTicketById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Ticket details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createMaintenanceTicketSchema.parse(req.body);
      const data = await this.service.createTicket(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Support ticket created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateMaintenanceTicketSchema.parse(req.body);
      const data = await this.service.updateTicket(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support ticket updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  assignTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = assignTicketSchema.parse(req.body);
      const data = await this.service.assignTicket(id, parsed.assignedAgent, parsed.assignedAgentId, parsed.performedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: `Ticket assigned to ${parsed.assignedAgent}`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateTicketStatusSchema.parse(req.body);
      const data = await this.service.updateTicketStatus(id, parsed.status, parsed.resolutionNotes, parsed.performedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: `Ticket status transitioned to ${parsed.status}`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = addCommentSchema.parse(req.body);
      const data = await this.service.addComment(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Comment added to support ticket',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteTicket(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support ticket deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. HUREMASO SUBSECTION HANDLERS =================

  getHuremasoOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getHuremasoOverview();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Huremaso maintenance diagnostics and system health retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  runSystemDiagnostics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.runSystemDiagnostics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'System diagnostics executed successfully. All Huremaso services optimal.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  listHuremasoLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = maintenanceQueryFilterSchema.parse(req.query);
      const data = await this.service.listHuremasoLogs(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Huremaso scheduled maintenance logs retrieved successfully',
        data: data.logs,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getHuremasoLogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getHuremasoLogById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance log details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createHuremasoLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createHuremasoLogSchema.parse(req.body);
      const data = await this.service.createHuremasoLog(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Maintenance window scheduled successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateHuremasoLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateHuremasoLogSchema.parse(req.body);
      const data = await this.service.updateHuremasoLog(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance log updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteHuremasoLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteHuremasoLog(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance log deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const maintenanceController = new MaintenanceController();
