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
      res.status(500).json({
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
      res.status(500).json({
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
      res.status(500).json({
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
      res.status(500).json({
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
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete calendar event',
      });
    }
  }
}

export const calendarController = new CalendarController();
