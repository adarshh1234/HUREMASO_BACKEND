import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../common/errors/AppError';

export class JobPostingValidator {
  static validateCreate(req: Request, _res: Response, next: NextFunction): void {
    const { title, department } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return next(new AppError('Job title is required', 400));
    }
    if (!department || typeof department !== 'string' || !department.trim()) {
      return next(new AppError('Department is required', 400));
    }
    next();
  }
}
