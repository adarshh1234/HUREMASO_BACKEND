import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../common/errors/AppError';

export class VacancyValidator {
  static validateCreate(req: Request, _res: Response, next: NextFunction): void {
    const { jobTitle, title, department, hiringManager } = req.body;
    const name = jobTitle || title;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return next(new AppError('Job title or title is required', 400));
    }
    if (!department || typeof department !== 'string' || !department.trim()) {
      return next(new AppError('Department is required', 400));
    }
    next();
  }

  static validateStatus(req: Request, _res: Response, next: NextFunction): void {
    const { status } = req.body;
    if (!status || !['Available', 'Active', 'Open', 'Closed', 'Draft', 'Paused'].includes(status)) {
      return next(new AppError('Valid status is required ("Available", "Active", "Open", "Closed", "Draft", "Paused")', 400));
    }
    next();
  }
}
