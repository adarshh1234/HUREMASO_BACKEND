import { Request, Response, NextFunction } from 'express';
import { supportService, SupportService } from './support.service';
import {
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  addTicketCommentSchema,
  addInternalNoteSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  createHelpArticleSchema,
  updateHelpArticleSchema,
  voteHelpArticleSchema,
  createAgentSchema,
  createContactRequestSchema,
  updateContactRequestStatusSchema,
  createMiscRequestSchema,
  updateMiscRequestSchema,
  updateMiscRequestStatusSchema,
  startReviewSchema,
  approveMiscRequestSchema,
  rejectMiscRequestSchema,
  processMiscRequestSchema,
  miscRequestQueryFilterSchema,
  supportQueryFilterSchema,
} from './support.validator';
import { sendResponse } from '../../common/utils/apiResponse';

const getParam = (params: Request['params'], key: string): string => String(params[key] || '');

export class SupportController {
  private service: SupportService;

  constructor(service = supportService) {
    this.service = service;
  }

  // ================= 1. DASHBOARD HANDLERS =================

  getDashboardMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getDashboardMetrics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support dashboard metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. TICKETS HANDLERS =================

  listTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = supportQueryFilterSchema.parse(req.query);
      const data = await this.service.listTickets(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Tickets retrieved successfully',
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
      const parsed = createTicketSchema.parse(req.body);
      const ticketDoc = await this.service.createTicket(parsed);
      const ticketObj = (ticketDoc as any).toJSON ? (ticketDoc as any).toJSON() : ticketDoc;
      const id = ticketObj._id?.toString() || ticketObj.id;
      const ticket = {
        ...ticketObj,
        id,
      };

      sendResponse({
        res,
        statusCode: 201,
        message: 'Support ticket created successfully',
        data: {
          ...ticket,
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateTicketSchema.parse(req.body);
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

  updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateTicketStatusSchema.parse(req.body);
      const changedBy = (req.headers['x-user-name'] as string) || (req.body.changedBy as string) || 'Support Staff';
      const data = await this.service.updateTicketStatus(
        id,
        parsed.status,
        parsed.resolutionDetails,
        parsed.notes,
        changedBy
      );
      sendResponse({
        res,
        statusCode: 200,
        message: `Ticket status updated to ${parsed.status}`,
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
      const assignedBy = (req.headers['x-user-name'] as string) || parsed.assignedBy || 'Admin';
      const data = await this.service.assignAgent(id, parsed.assignedAgent, parsed.assignedAgentEmail, assignedBy);
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

  addTicketComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = addTicketCommentSchema.parse(req.body);
      const data = await this.service.addComment(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Comment added to ticket successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  addInternalNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = addInternalNoteSchema.parse(req.body);
      const data = await this.service.addInternalNote(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Internal note added to ticket successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getTicketHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getTicketHistory(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Ticket activity history retrieved successfully',
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

  // ================= 3. MAINTENANCE HANDLERS =================

  listMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = supportQueryFilterSchema.parse(req.query);
      const data = await this.service.listMaintenance(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance requests retrieved successfully',
        data: data.maintenance,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getMaintenanceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getMaintenanceById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance request details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createMaintenanceSchema.parse(req.body);
      const data = await this.service.createMaintenance(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Maintenance request reported successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateMaintenanceSchema.parse(req.body);
      const data = await this.service.updateMaintenance(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance request updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteMaintenance(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Maintenance request deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 4. HELP / KB HANDLERS =================

  listHelpArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = supportQueryFilterSchema.parse(req.query);
      const data = await this.service.listHelpArticles(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Help articles retrieved successfully',
        data: data.articles,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getHelpArticleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getHelpArticleById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Help article retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createHelpArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createHelpArticleSchema.parse(req.body);
      const data = await this.service.createHelpArticle(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Help article created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateHelpArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateHelpArticleSchema.parse(req.body);
      const data = await this.service.updateHelpArticle(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Help article updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  voteHelpful = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const isHelpful = req.body?.isHelpful !== false && req.query?.isHelpful !== 'false';
      const data = await this.service.voteHelpArticle(id, isHelpful);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Thank you for your feedback!',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteHelpArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteHelpArticle(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Help article deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 4b. SUPPORT AGENTS HANDLERS =================

  listSupportAgents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listSupportAgents();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support agents retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createSupportAgent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createAgentSchema.parse(req.body);
      const data = await this.service.createSupportAgent(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Support agent created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 4c. SEED HANDLER =================

  seedSupportData = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.seedInitialData();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support demo data seeded successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 5. CONTACT INQUIRIES HANDLERS =================

  listContactRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = supportQueryFilterSchema.parse(req.query);
      const data = await this.service.listContactRequests(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Contact inquiries retrieved successfully',
        data: data.contactRequests,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  createContactRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createContactRequestSchema.parse(req.body);
      const data = await this.service.createContactRequest(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Contact message submitted successfully. An agent will respond shortly.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateContactStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateContactRequestStatusSchema.parse(req.body);
      const data = await this.service.updateContactStatus(id, parsed.status, parsed.responseMessage, parsed.respondedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Contact inquiry status updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteContactRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteContactRequest(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Contact inquiry deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 6. MISCELLANEOUS REQUESTS HANDLERS =================

  listMiscellaneousRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = miscRequestQueryFilterSchema.parse(req.query);
      const data = await this.service.listMiscellaneousRequests(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous requests retrieved successfully',
        data: data.requests,
        pagination: {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getMiscellaneousSummaryCounts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getMiscellaneousSummaryCounts();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request summary counts retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getMiscellaneousRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getMiscellaneousRequestById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createMiscRequestSchema.parse(req.body);
      const data = await this.service.createMiscellaneousRequest(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Miscellaneous request created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateMiscRequestSchema.parse(req.body);
      const data = await this.service.updateMiscellaneousRequest(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMiscellaneousRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateMiscRequestStatusSchema.parse(req.body);
      const data = await this.service.updateMiscellaneousRequestStatus(id, parsed.status, {
        comments: parsed.comments,
        remarks: parsed.remarks,
        rejectionReason: parsed.rejectionReason,
        approvalRemarks: parsed.approvalRemarks,
        reviewerName: parsed.reviewerName,
        reviewerId: parsed.reviewerId,
        processedBy: parsed.processedBy,
      });
      sendResponse({
        res,
        statusCode: 200,
        message: `Miscellaneous request status updated to ${parsed.status}`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  startReviewMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = startReviewSchema.parse(req.body);
      const data = await this.service.startReview(id, parsed.reviewerName, parsed.reviewerId, parsed.remarks);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request placed in review',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  approveMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = approveMiscRequestSchema.parse(req.body);
      const data = await this.service.approveMiscellaneousRequest(
        id,
        parsed.reviewerName,
        parsed.reviewerId,
        parsed.approvalRemarks || parsed.comments
      );
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request approved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = rejectMiscRequestSchema.parse(req.body);
      const data = await this.service.rejectMiscellaneousRequest(
        id,
        parsed.rejectionReason,
        parsed.reviewerName,
        parsed.reviewerId
      );
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request rejected',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  processMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = processMiscRequestSchema.parse(req.body);
      const data = await this.service.processMiscellaneousRequest(id, parsed.processedBy, parsed.remarks);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request marked as processed and fulfilled',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getMiscellaneousAuditHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getMiscellaneousAuditHistory(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request audit history retrieved',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMiscellaneousRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      await this.service.deleteMiscellaneousRequest(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Miscellaneous request deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const supportController = new SupportController();

