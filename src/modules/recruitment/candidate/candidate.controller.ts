import { Request, Response, NextFunction } from 'express';
import { CandidateService, candidateService } from './candidate.service';

export class CandidateController {
  constructor(private service: CandidateService = candidateService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAllCandidates(req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await this.service.getCandidateById(id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.createCandidate(req.body);
      res.status(201).json({ success: true, message: 'Candidate created successfully', data: item });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await this.service.updateCandidate(id, req.body);
      res.status(200).json({ success: true, message: 'Candidate updated successfully', data: item });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await this.service.updateCandidateStatus(id, req.body.status);
      res.status(200).json({ success: true, message: 'Candidate status updated', data: item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.service.deleteCandidate(id);
      res.status(200).json({ success: true, message: 'Candidate deleted successfully' });
    } catch (err) {
      next(err);
    }
  };

  convertToEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employee = await this.service.convertToEmployee(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Candidate converted to Employee successfully',
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  };

  progressStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { stage, status, notes } = req.body;
      const targetStage = stage || status;
      const updated = await this.service.progressStage(id, targetStage, notes);
      res.status(200).json({
        success: true,
        message: `Candidate progressed to stage: ${targetStage}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };

  getPipelineMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vacancyId = req.query.vacancyId as string | undefined;
      const metrics = await this.service.getPipelineMetrics(vacancyId);
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const candidateController = new CandidateController();
