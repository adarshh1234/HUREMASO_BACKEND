import { Request, Response, NextFunction } from 'express';
import { organizationService, OrganizationService } from './organization.service';
import { EmployeeModel } from '../../employee/employee.model';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  updateOrganizationSchema,
  addLocationSchema,
  updateLocationSchema,
  mongoIdSchema,
} from './organization.validator';

export class OrganizationController {
  constructor(private service: OrganizationService = organizationService) {}

  getOrganization = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const org = await this.service.getOrganization();
      const employeeCount = await EmployeeModel.countDocuments({ isTerminated: { $ne: true } }).catch(() => 0);
      const orgObj = (org as any).toObject ? (org as any).toObject() : { ...org };
      orgObj.employeeCount = employeeCount;
      sendResponse({
        res,
        statusCode: 200,
        data: orgObj,
      });
    } catch (err) {
      next(err);
    }
  };

  updateOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updateOrganizationSchema.parse(req.body);
      const org = await this.service.updateOrganization(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Organization details updated successfully',
        data: org,
      });
    } catch (err) {
      next(err);
    }
  };

  addLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = addLocationSchema.parse(req.body);
      const org = await this.service.addLocation(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Location added successfully',
        data: org,
      });
    } catch (err) {
      next(err);
    }
  };

  updateLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateLocationSchema.parse(req.body);
      const org = await this.service.updateLocation(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Location updated successfully',
        data: org,
      });
    } catch (err) {
      next(err);
    }
  };

  removeLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const org = await this.service.removeLocation(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Location removed successfully',
        data: org,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const organizationController = new OrganizationController();
