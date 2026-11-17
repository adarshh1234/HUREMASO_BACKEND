import { Request, Response, NextFunction } from 'express';
import { resumeService } from './resume.service';

export class ResumeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resumeService.createResume(req.body);
      res.status(201).json({ success: true, message: 'Resume created successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resumeService.getMetrics();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async syncLetsGetIn(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.syncLetsGetInResumes();
      res.status(200).json({
        success: true,
        message: 'Successfully synchronized verified talent pool from LetsGetIn network',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.getAllResumes(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeService.getResumeById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeService.updateResume(id, req.body);
      res.status(200).json({ success: true, message: 'Resume updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await resumeService.deleteResume(id);
      res.status(200).json({ success: true, message: 'Resume deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async parseCv(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.parseAndProcessCv(req.body);
      res.status(200).json({ success: true, message: 'CV parsed successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  async matchVacancy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { vacancyId } = req.body;
      const data = await resumeService.matchWithVacancy(id, vacancyId);
      res.status(200).json({ success: true, message: 'Resume matched with vacancy successfully', data });
    } catch (err) {
      next(err);
    }
  }
}

export const resumeController = new ResumeController();
