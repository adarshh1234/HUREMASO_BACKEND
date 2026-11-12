import { Request, Response, NextFunction } from 'express';
import { replacementService } from './replacement.service';

export class ReplacementController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await replacementService.createReplacement(req.body);
      res.status(201).json({ success: true, message: 'Replacement request created successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await replacementService.getAllReplacements(req.query as any);
      res.status(200).json({ success: true, data: result.items, items: result.items, total: result.total, page: result.page, limit: result.limit });
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await replacementService.getMetrics();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await replacementService.getReplacementById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, approverName, comments } = req.body;
      const data = await replacementService.updateStatus(id, status, approverName, comments);
      res.status(200).json({ success: true, message: `Replacement ${status.toLowerCase()} successfully`, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await replacementService.deleteReplacement(id);
      res.status(200).json({ success: true, message: 'Replacement request deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const replacementController = new ReplacementController();
