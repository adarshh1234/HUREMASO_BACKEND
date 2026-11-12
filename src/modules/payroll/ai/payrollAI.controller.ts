import { Request, Response, NextFunction } from 'express';
import { payrollAIService, PayrollAIService } from './payrollAI.service';
import { sendResponse } from '../../../common/utils/apiResponse';

export class PayrollAIController {
  constructor(private service: PayrollAIService = payrollAIService) {}

  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, context } = req.body;
      const result = await this.service.chat({ message, context });
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

export const payrollAIController = new PayrollAIController();
