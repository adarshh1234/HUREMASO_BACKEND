import { Request, Response, NextFunction } from 'express';
import { VacancyService, vacancyService } from './vacancy.service';

export class VacancyController {
  constructor(private service: VacancyService = vacancyService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAllVacancies(req.query as any);
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
      const item = await this.service.getVacancyById(id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.createVacancy(req.body);
      res.status(201).json({ success: true, message: 'Vacancy created successfully', data: item });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await this.service.updateVacancy(id, req.body);
      res.status(200).json({ success: true, message: 'Vacancy updated successfully', data: item });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await this.service.updateVacancyStatus(id, req.body.status);
      res.status(200).json({ success: true, message: 'Vacancy status updated', data: item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.service.deleteVacancy(id);
      res.status(200).json({ success: true, message: 'Vacancy deleted successfully' });
    } catch (err) {
      next(err);
    }
  };

  getPipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await this.service.getVacancyPipeline(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

export const vacancyController = new VacancyController();
