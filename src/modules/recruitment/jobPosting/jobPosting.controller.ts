import { Request, Response, NextFunction } from 'express';
import { jobPostingService } from './jobPosting.service';

export class JobPostingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await jobPostingService.createJobPosting(req.body);
      res.status(201).json({ success: true, message: 'Job posting created successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.getAllJobPostings(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await jobPostingService.getJobPostingById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await jobPostingService.updateJobPosting(id, req.body);
      res.status(200).json({ success: true, message: 'Job posting updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { platform } = req.body;
      const data = await jobPostingService.publishJobPosting(id, platform);
      res.status(200).json({ success: true, message: 'Job posting published successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await jobPostingService.closeJobPosting(id);
      res.status(200).json({ success: true, message: 'Job posting closed successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async unpublish(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await jobPostingService.unpublishJobPosting(id);
      res.status(200).json({ success: true, message: 'Job posting unpublished successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async postToLetGetIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await jobPostingService.postToLetGetIn(req.body);
      res.status(201).json({ success: true, message: 'Job published to LetGetIn network successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getActiveLetGetIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.getActiveLetGetInPostings(req.query as any);
      res.status(200).json({ success: true, data: result.items, postings: result.items, items: result.items, total: result.total });
    } catch (err) {
      next(err);
    }
  }

  async syncLetGetIn(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.syncLetGetInStatus();
      res.status(200).json({ success: true, message: 'LetGetIn API status: 100% Operational', data: result });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await jobPostingService.deleteJobPosting(id);
      res.status(200).json({ success: true, message: 'Job posting deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const jobPostingController = new JobPostingController();
