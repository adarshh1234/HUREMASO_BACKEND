import { Request, Response, NextFunction } from 'express';
import { employeeConfigService, EmployeeConfigService } from './employeeConfig.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  updateOptionalFieldsSchema,
  addCustomFieldSchema,
  addReportingMethodSchema,
  addTerminationReasonSchema,
  importEmployeesSchema,
} from './employeeConfig.validator';

export class EmployeeConfigController {
  constructor(private service: EmployeeConfigService = employeeConfigService) {}

  getConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getConfig();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateOptionalFields = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updateOptionalFieldsSchema.parse(req.body);
      const result = await this.service.updateOptionalFields(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Optional fields updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  addCustomField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = addCustomFieldSchema.parse(req.body);
      const result = await this.service.addCustomField(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Custom field added successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteCustomField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const name = String(req.params.name);
      const result = await this.service.deleteCustomField(name);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Custom field deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  addReportingMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = addReportingMethodSchema.parse(req.body);
      const result = await this.service.addReportingMethod(validated.name);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Reporting method added successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteReportingMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const name = String(req.params.name);
      const result = await this.service.deleteReportingMethod(name);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Reporting method deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  addTerminationReason = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = addTerminationReasonSchema.parse(req.body);
      const result = await this.service.addTerminationReason(validated.name);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Termination reason added successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteTerminationReason = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const name = String(req.params.name);
      const result = await this.service.deleteTerminationReason(name);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Termination reason deleted successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  importEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = importEmployeesSchema.parse(req.body);
      const result = await this.service.importEmployees(validated.records);
      sendResponse({
        res,
        statusCode: 200,
        message: `Imported ${result.importedCount} employees successfully`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const employeeConfigController = new EmployeeConfigController();
