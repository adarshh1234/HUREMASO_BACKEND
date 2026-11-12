import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';

export class AttendanceController {
  async punchIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.punchIn(req.body);
      res.status(200).json({ success: true, message: 'Punched in successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async punchOut(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.punchOut(req.body);
      res.status(200).json({ success: true, message: 'Punched out successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getMyRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.query.employeeId as string;
      const date = req.query.date as string;
      const data = await attendanceService.getMyRecords(employeeId, date);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getEmployeeRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.getEmployeeRecords(req.query as any);
      res.status(200).json({ success: true, data: result.items, items: result.items, total: result.total, page: result.page, limit: result.limit });
    } catch (err) {
      next(err);
    }
  }

  async getPunchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.query.employeeId as string;
      const data = await attendanceService.getPunchStatus(employeeId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getConfig(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.getConfig();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async saveConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.saveConfig(req.body);
      res.status(200).json({ success: true, message: 'Configuration saved successfully', data });
    } catch (err) {
      next(err);
    }
  }
}

export const attendanceController = new AttendanceController();
