import { Request, Response, NextFunction } from 'express';
import { legalService, LegalService } from './legal.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import { legalAiQuerySchema } from './legal.validator';

export class LegalController {
  constructor(private service: LegalService = legalService) {}

  getOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getOverview();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  analyzeAiQuery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = legalAiQuerySchema.parse(req.body);
      const result = await this.service.analyzeQuery(validated.query);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const legalController = new LegalController();
