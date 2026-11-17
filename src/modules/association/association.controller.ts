import { Request, Response, NextFunction } from 'express';
import { associationService, AssociationService } from './association.service';
import {
  createAssociationRequestSchema,
  updateAssociationSchema,
  approveRejectAssociationSchema,
  deactivateAssociationSchema,
  renewAssociationSchema,
  associationQueryFilterSchema,
} from './association.validator';
import { sendResponse } from '../../common/utils/apiResponse';

const getParam = (params: Request['params'], key: string): string => String(params[key] || '');

export class AssociationController {
  private service: AssociationService;

  constructor(service = associationService) {
    this.service = service;
  }

  // ================= 1. NEW REQUEST HANDLERS =================

  listRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = associationQueryFilterSchema.parse(req.query);
      const data = await this.service.listRequests(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'New association requests retrieved successfully',
        data: data.requests,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getRequestById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Association request details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createAssociationRequestSchema.parse(req.body);
      const data = await this.service.createRequest(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Association request submitted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateAssociationSchema.parse(req.body);
      const data = await this.service.updateRequest(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Association request updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  approveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = approveRejectAssociationSchema.parse(req.body);
      const data = await this.service.approveRequest(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: `Accepted association request for ${data.employeeName} (Request #${data.associationCode || id})`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = approveRejectAssociationSchema.parse(req.body);
      const data = await this.service.rejectRequest(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: `Cancelled/Rejected association request for ${data.employeeName} (Request #${data.associationCode || id})`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. EXISTING ASSOCIATIONS HANDLERS =================

  listExisting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = associationQueryFilterSchema.parse(req.query);
      const data = await this.service.listExisting(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Existing associations retrieved successfully',
        data: data.associations,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getExistingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getExistingById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Existing association details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateExisting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateAssociationSchema.parse(req.body);
      const data = await this.service.updateRequest(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Existing association updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateExisting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = deactivateAssociationSchema.parse(req.body);
      const data = await this.service.deactivateExisting(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: `Existing association cancelled/deactivated successfully`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  renewExisting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = renewAssociationSchema.parse(req.body);
      const data = await this.service.renewExisting(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: `Association renewed and extended successfully`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 3. GENERAL / UNIFIED HANDLERS =================

  listAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = associationQueryFilterSchema.parse(req.query);
      const data = await this.service.listAll(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Associations retrieved successfully',
        data: data.items,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getOverviewStats();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Monitoring Inhouse Association statistics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAssociation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteAssociation(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Association record removed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const associationController = new AssociationController();
