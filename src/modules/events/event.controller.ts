import { Request, Response, NextFunction } from 'express';
import { eventService, EventService } from './event.service';
import { sendResponse } from '../../common/utils/apiResponse';
import {
  createEventSchema,
  updateEventSchema,
  createSupportEventSchema,
  updateSupportEventSchema,
  createNewsletterSchema,
  updateNewsletterSchema,
  createBudgetSchema,
  updateBudgetSchema,
  queryEventSchema,
  mongoIdSchema,
} from './event.validator';

export class EventController {
  constructor(private service: EventService = eventService) {}

  // Events
  getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryEventSchema.parse(req.query);
      const result = await this.service.getAllEvents(query);
      sendResponse({
        res,
        statusCode: 200,
        data: result.items,
        pagination: {
          total: result.total,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 50,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const item = await this.service.getEventById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createEventSchema.parse(req.body);
      const item = await this.service.createEvent(validated as any);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Event created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateEventSchema.parse(req.body);
      const item = await this.service.updateEvent(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Event updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteEvent(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Event deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Support Events
  getAllSupportEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.getAllSupportEvents();
      sendResponse({
        res,
        statusCode: 200,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  };

  createSupportEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createSupportEventSchema.parse(req.body);
      const item = await this.service.createSupportEvent(validated as any);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Support event logged successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateSupportEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateSupportEventSchema.parse(req.body);
      const item = await this.service.updateSupportEvent(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support event updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteSupportEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteSupportEvent(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Support event deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Newsletters
  getAllNewsletters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.getAllNewsletters();
      sendResponse({
        res,
        statusCode: 200,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  };

  createNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createNewsletterSchema.parse(req.body);
      const item = await this.service.createNewsletter(validated as any);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Newsletter published successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateNewsletterSchema.parse(req.body);
      const item = await this.service.updateNewsletter(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Newsletter updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteNewsletter(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Newsletter deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Budgets
  getAllBudgets = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.getAllBudgets();
      sendResponse({
        res,
        statusCode: 200,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  };

  createBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createBudgetSchema.parse(req.body);
      const item = await this.service.createBudget(validated as any);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Event budget item created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateBudgetSchema.parse(req.body);
      const item = await this.service.updateBudget(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Event budget updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteBudget(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Event budget deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Stats
  getSummaryStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getSummaryStats();
      sendResponse({
        res,
        statusCode: 200,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const eventController = new EventController();
