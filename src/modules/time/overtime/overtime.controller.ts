import { Request, Response, NextFunction } from 'express';
import { overtimeService } from './overtime.service';

export class OvertimeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await overtimeService.createOvertime(req.body);
      res.status(201).json({ success: true, message: 'Overtime record created successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { hours, multiplier, baseRate } = req.body;
      const data = await overtimeService.calculate(
        Number(hours) || 0,
        Number(multiplier) || 1.5,
        Number(baseRate) || 20
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await overtimeService.getAllOvertime(req.query as any);
      res.status(200).json({ success: true, data: result.items, items: result.items, total: result.total, page: result.page, limit: result.limit });
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await overtimeService.getMetrics();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await overtimeService.getOvertimeById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, approverName, comments } = req.body;
      const data = await overtimeService.updateStatus(id, status, approverName, comments);
      res.status(200).json({ success: true, message: `Overtime ${status.toLowerCase()} successfully`, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await overtimeService.deleteOvertime(id);
      res.status(200).json({ success: true, message: 'Overtime record deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const overtimeController = new OvertimeController();
