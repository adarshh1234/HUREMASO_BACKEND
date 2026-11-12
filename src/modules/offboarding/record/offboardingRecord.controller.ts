import { Request, Response, NextFunction } from 'express';
import { offboardingRecordService, OffboardingRecordService } from './offboardingRecord.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createOffboardingRecordSchema,
  updateOffboardingRecordSchema,
  updateDocumentDraftSchema,
  updateSettlementSchema,
  updateLegalClearanceSchema,
  updateAssetReturnSchema,
  updateTravelSchema,
  queryOffboardingSchema,
  mongoIdSchema,
} from './offboardingRecord.validator';

export class OffboardingRecordController {
  constructor(private service: OffboardingRecordService = offboardingRecordService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryOffboardingSchema.parse(req.query);
      const result = await this.service.getAll(query);
      sendResponse({
        res,
        statusCode: 200,
        data: result.items,
        pagination: {
          total: result.total,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const item = await this.service.getById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createOffboardingRecordSchema.parse(req.body);
      const item = await this.service.create(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Offboarding record created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateOffboardingRecordSchema.parse(req.body);
      const item = await this.service.update(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Offboarding record updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateDocumentDraftSchema.parse(req.body);
      const item = await this.service.updateDocument(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Document drafted/updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateSettlement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateSettlementSchema.parse(req.body);
      const item = await this.service.updateSettlement(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Settlement details updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateLegal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateLegalClearanceSchema.parse(req.body);
      const item = await this.service.updateLegal(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Legal clearance updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateAssetReturnSchema.parse(req.body);
      const item = await this.service.updateAssets(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Asset clearance updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateTravel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateTravelSchema.parse(req.body);
      const item = await this.service.updateTravel(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Travel & Repatriation updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.delete(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Offboarding record deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  getReportsSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.service.getReportsSummary();
      sendResponse({
        res,
        statusCode: 200,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const offboardingRecordController = new OffboardingRecordController();
