import { Request, Response, NextFunction } from 'express';
import { feedbackService } from './feedback.service';

export class FeedbackController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.createFeedback(req.body);
      res.status(201).json({ success: true, message: 'Feedback submitted successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await feedbackService.getAllFeedback({
        candidateId: req.query.candidateId as string,
        interviewId: req.query.interviewId as string,
        search: req.query.search as string,
        status: req.query.status as string,
        recommendation: req.query.recommendation as string,
      });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await feedbackService.getFeedbackById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getByInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId = req.params.interviewId as string;
      const data = await feedbackService.getFeedbackByInterview(interviewId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getByCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.params.candidateId as string;
      const data = await feedbackService.getFeedbackByCandidate(candidateId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await feedbackService.updateFeedback(id, req.body);
      res.status(200).json({ success: true, message: 'Feedback updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await feedbackService.deleteFeedback(id);
      res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const feedbackController = new FeedbackController();
