import { Request, Response, NextFunction } from 'express';
import { massMessageService, MassMessageService } from './massMessage.service';
import { sendResponse } from '../../../common/utils/apiResponse';

export class MassMessageController {
  constructor(private service: MassMessageService = massMessageService) {}

  getRecipients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getRecipients();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.sendMassMessage(req.body);
      sendResponse({
        res,
        statusCode: 201,
        message: result.status === 'Send' ? 'Message broadcasted successfully' : 'Draft saved successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getHistory();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteHistory(String(req.params.id));
      sendResponse({
        res,
        statusCode: 200,
        message: 'Message history item deleted',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const massMessageController = new MassMessageController();
