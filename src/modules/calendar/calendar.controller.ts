import { Request, Response } from 'express';
import { calendarService } from './calendar.service';

export class CalendarController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await calendarService.getAllEvents(req.query);
      res.status(200).json({
        success: true,
        message: 'Calendar events fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch calendar events',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await calendarService.getEventById(id);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Calendar event not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch calendar event',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const event = await calendarService.createEvent(req.body);
      res.status(201).json({
        success: true,
        message: 'Calendar event created successfully',
        data: event,
      });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to create calendar event',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await calendarService.updateEvent(id, req.body);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Calendar event not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Calendar event updated successfully',
        data: event,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update calendar event',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await calendarService.deleteEvent(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Calendar event not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Calendar event deleted successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete calendar event',
      });
    }
  }

  async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const type = req.query.type as string | undefined;
      const data = await calendarService.getUpcomingEvents(limit, type);
      res.status(200).json({
        success: true,
        message: 'Upcoming calendar events fetched successfully',
        data,
        total: data.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch upcoming events',
      });
    }
  }

  async getMeetings(req: Request, res: Response): Promise<void> {
    try {
      const result = await calendarService.getMeetings(req.query);
      res.status(200).json({
        success: true,
        message: 'Meetings fetched successfully',
        data: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch meetings',
      });
    }
  }

  async getInterviews(req: Request, res: Response): Promise<void> {
    try {
      const result = await calendarService.getInterviews(req.query);
      res.status(200).json({
        success: true,
        message: 'Interviews fetched successfully',
        data: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch interviews',
      });
    }
  }

  async getHolidays(req: Request, res: Response): Promise<void> {
    try {
      const result = await calendarService.getHolidays(req.query);
      res.status(200).json({
        success: true,
        message: 'Holidays fetched successfully',
        data: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch holidays',
      });
    }
  }

  async getDeadlines(req: Request, res: Response): Promise<void> {
    try {
      const result = await calendarService.getDeadlines(req.query);
      res.status(200).json({
        success: true,
        message: 'Deadlines fetched successfully',
        data: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch deadlines',
      });
    }
  }

  async reschedule(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await calendarService.rescheduleEvent(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Calendar event rescheduled successfully',
        data: event,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to reschedule calendar event',
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;
      const event = await calendarService.updateEventStatus(id, status, notes);
      res.status(200).json({
        success: true,
        message: `Calendar event marked as ${status}`,
        data: event,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update event status',
      });
    }
  }
}

export const calendarController = new CalendarController();
