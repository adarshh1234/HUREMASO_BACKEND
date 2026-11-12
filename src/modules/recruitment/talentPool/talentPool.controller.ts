import { Request, Response, NextFunction } from 'express';
import { talentPoolService } from './talentPool.service';

export class TalentPoolController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await talentPoolService.createTalentPool(req.body);
      res.status(201).json({ success: true, message: 'Talent pool created successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await talentPoolService.getAllTalentPools(req.query as any);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await talentPoolService.getTalentPoolById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await talentPoolService.updateTalentPool(id, req.body);
      res.status(200).json({ success: true, message: 'Talent pool updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await talentPoolService.deleteTalentPool(id);
      res.status(200).json({ success: true, message: 'Talent pool deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async addCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await talentPoolService.addCandidate(id, req.body);
      res.status(200).json({ success: true, message: 'Candidate added to talent pool', data });
    } catch (err) {
      next(err);
    }
  }

  async getCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await talentPoolService.getCandidates(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async associateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { candidateId, vacancyId } = req.body;
      const data = await talentPoolService.associateCandidateWithJob(id, candidateId, vacancyId);
      res.status(200).json({ success: true, message: data.message, data });
    } catch (err) {
      next(err);
    }
  }

  async removeCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const candidateId = req.params.candidateId as string;
      const data = await talentPoolService.removeCandidate(id, candidateId);
      res.status(200).json({ success: true, message: 'Candidate removed from talent pool', data });
    } catch (err) {
      next(err);
    }
  }
}

export const talentPoolController = new TalentPoolController();
