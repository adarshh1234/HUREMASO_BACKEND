import { Request, Response, NextFunction } from 'express';
import { configurationService, ConfigurationService } from './config.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  updateConfigurationSchema,
  testEmailSchema,
  testLdapSchema,
} from './config.validator';

export class ConfigurationController {
  constructor(private service: ConfigurationService = configurationService) {}

  getConfiguration = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conf = await this.service.getConfiguration();
      sendResponse({
        res,
        statusCode: 200,
        data: conf,
      });
    } catch (err) {
      next(err);
    }
  };

  updateConfiguration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updateConfigurationSchema.parse(req.body);
      const conf = await this.service.updateConfiguration(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'System Configuration updated successfully',
        data: conf,
      });
    } catch (err) {
      next(err);
    }
  };

  testEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = testEmailSchema.parse(req.body);
      const result = await this.service.testEmail(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  testLdap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = testLdapSchema.parse(req.body);
      const result = await this.service.testLdap(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const configurationController = new ConfigurationController();
