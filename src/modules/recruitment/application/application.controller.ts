import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';

export class ApplicationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.createApplication(req.body);
      res.status(201).json({ success: true, message: 'Application created successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await applicationService.getAllApplications(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.getApplicationMetrics();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await applicationService.getApplicationById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await applicationService.updateApplication(id, req.body);
      res.status(200).json({ success: true, message: 'Application updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await applicationService.updateStatus(id, req.body);
      res.status(200).json({ success: true, message: 'Application status updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await applicationService.deleteApplication(id);
      res.status(200).json({ success: true, message: 'Application deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const applicationController = new ApplicationController();
