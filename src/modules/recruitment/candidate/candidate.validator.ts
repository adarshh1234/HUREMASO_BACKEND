import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../common/errors/AppError';

export class CandidateValidator {
  static validateCreate(req: Request, _res: Response, next: NextFunction): void {
    const { name, firstName, lastName, email } = req.body;
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();
    if (!fullName) {
      return next(new AppError('Candidate name or firstName/lastName is required', 400));
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return next(new AppError('Valid candidate email is required', 400));
    }
    next();
  }

  static validateUpdate(req: Request, _res: Response, next: NextFunction): void {
    const { email } = req.body;
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      return next(new AppError('Valid email format is required', 400));
    }
    next();
  }
}
