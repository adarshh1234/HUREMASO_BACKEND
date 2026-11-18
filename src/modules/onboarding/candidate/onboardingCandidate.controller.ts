import { Request, Response, NextFunction } from 'express';
import { onboardingCandidateService, OnboardingCandidateService } from './onboardingCandidate.service';
import { IOnboardingCandidateDocument } from '../onboarding.types';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createOnboardingCandidateSchema,
  updateOnboardingCandidateSchema,
  updateVerificationSchema,
  updateOfferSchema,
  updateDocumentSchema,
  updateProvisionsSchema,
  updateBuddyManagerSchema,
  updateTrainingSchema,
  updateVisaSchema,
  updateInsuranceSchema,
  queryOnboardingSchema,
  mongoIdSchema,
} from './onboardingCandidate.validator';

export class OnboardingCandidateController {
  constructor(private service: OnboardingCandidateService = onboardingCandidateService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryOnboardingSchema.parse(req.query);
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
      const validated = createOnboardingCandidateSchema.parse(req.body);
      const item = await this.service.create(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Onboarding candidate created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateOnboardingCandidateSchema.parse(req.body);
      const item = await this.service.update(id, validated as Partial<IOnboardingCandidateDocument>);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Onboarding candidate updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { checkType, status, notes, verifiedBy } = updateVerificationSchema.parse(req.body);
      const item = await this.service.updateVerification(id, checkType, status, notes, verifiedBy);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Background verification updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateOfferSchema.parse(req.body);
      const item = await this.service.updateOffer(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Offer updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { docType, status, signedDate, docUrl } = updateDocumentSchema.parse(req.body);
      const item = await this.service.updateDocument(id, docType, status, signedDate, docUrl);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Document status updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateProvisions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateProvisionsSchema.parse(req.body);
      const item = await this.service.updateProvisions(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Provisions updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateBuddyManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateBuddyManagerSchema.parse(req.body);
      const item = await this.service.updateBuddyManager(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Buddy & Manager updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateTraining = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const { modules } = updateTrainingSchema.parse(req.body);
      const item = await this.service.updateTraining(id, modules);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Training modules updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateVisa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateVisaSchema.parse(req.body);
      const item = await this.service.updateVisa(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Visa & Immigration details updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateInsurance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateInsuranceSchema.parse(req.body);
      const item = await this.service.updateInsurance(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Insurance policy updated successfully',
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
        message: 'Onboarding candidate deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  convertToEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const result = await this.service.convertToEmployee(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Candidate converted to employee successfully',
        data: result,
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

export const onboardingCandidateController = new OnboardingCandidateController();
