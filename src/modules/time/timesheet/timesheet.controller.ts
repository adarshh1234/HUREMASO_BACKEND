import { Request, Response, NextFunction } from 'express';
import { timesheetService } from './timesheet.service';

export class TimesheetController {
  async save(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timesheetService.saveTimesheet(req.body);
      res.status(200).json({ success: true, message: 'Timesheet saved successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { comment } = req.body;
      const data = await timesheetService.submitTimesheet(id, comment);
      res.status(200).json({ success: true, message: 'Timesheet submitted successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { approverName, comment } = req.body;
      const data = await timesheetService.approveTimesheet(id, approverName, comment);
      res.status(200).json({ success: true, message: 'Timesheet approved successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { approverName, comment } = req.body;
      const data = await timesheetService.rejectTimesheet(id, approverName, comment);
      res.status(200).json({ success: true, message: 'Timesheet rejected', data });
    } catch (err) {
      next(err);
    }
  }

  async getMyTimesheets(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.query.employeeId as string;
      const period = req.query.period as string;
      const data = await timesheetService.getMyTimesheets(employeeId, period);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPendingActions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timesheetService.getPendingTimesheets(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timesheetService.getAllTimesheets(req.query as any);
      res.status(200).json({ success: true, data: result.items, items: result.items, total: result.total, page: result.page, limit: result.limit });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await timesheetService.getTimesheetById(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Timesheet not found' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, approverName, comment } = req.body;
      const data = await timesheetService.updateStatus(id, status, approverName, comment);
      if (!data) {
        res.status(404).json({ success: false, message: 'Timesheet not found' });
        return;
      }
      res.status(200).json({ success: true, message: `Timesheet status updated to ${status}`, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const success = await timesheetService.deleteTimesheet(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Timesheet not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Timesheet deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const timesheetController = new TimesheetController();

