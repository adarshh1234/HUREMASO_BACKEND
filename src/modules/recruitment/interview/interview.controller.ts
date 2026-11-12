import { Request, Response, NextFunction } from 'express';
import { interviewService } from './interview.service';

export class InterviewController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.createInterview(req.body);
      res.status(201).json({ success: true, message: 'Interview scheduled successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.getAllInterviews(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await interviewService.getInterviewById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await interviewService.updateInterview(id, req.body);
      res.status(200).json({ success: true, message: 'Interview updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await interviewService.deleteInterview(id);
      res.status(200).json({ success: true, message: 'Interview deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const interviewController = new InterviewController();
