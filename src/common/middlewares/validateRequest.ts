import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.') || 'field'}: ${i.message}`).join(', ');
      return next(new AppError(`Validation error: ${message}`, 400));
    }
    req.body = result.data;
    next();
  };
};

export default validateRequest;
