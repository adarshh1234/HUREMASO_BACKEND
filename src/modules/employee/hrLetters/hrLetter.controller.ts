import { Request, Response, NextFunction } from 'express';
import { hrLetterService, HrLetterService } from './hrLetter.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createTemplateSchema,
  updateTemplateSchema,
  generateLetterSchema,
  createCommunicationSchema,
  updateCommunicationSchema,
  createIssuedLetterSchema,
  updateIssuedLetterSchema,
  mongoIdSchema,
} from './hrLetter.validator';

export class HrLetterController {
  constructor(private service: HrLetterService = hrLetterService) {}

  // ==========================================
  // TEMPLATES
  // ==========================================
  getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.query.category as string | undefined;
      const type = req.query.type as string | undefined;
      const result = await this.service.getTemplates({ category, type });
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const result = await this.service.getTemplateById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createTemplateSchema.parse(req.body);
      const result = await this.service.createTemplate(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Template created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateTemplateSchema.parse(req.body);
      const result = await this.service.updateTemplate(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Template updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteTemplate(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Template deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // ==========================================
  // COMMUNICATIONS (MEMO, NOTICE, CIRCULAR, LETTER)
  // ==========================================
  getCommunications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, status, department, search, page, limit, sortBy, sortOrder } = req.query as any;
      const result = await this.service.getCommunications({
        type,
        status,
        department,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getCommunicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const result = await this.service.getCommunicationById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createCommunication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createCommunicationSchema.parse(req.body);
      const result = await this.service.createCommunication(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: `${validated.type.toUpperCase()} created and saved successfully`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateCommunication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateCommunicationSchema.parse(req.body);
      const result = await this.service.updateCommunication(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Communication updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateCommunicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const status = req.body.status || 'Published';
      const result = await this.service.updateCommunicationStatus(id, status);
      sendResponse({
        res,
        statusCode: 200,
        message: `Communication status updated to ${status}`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteCommunication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteCommunication(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Communication record deleted',
      });
    } catch (err) {
      next(err);
    }
  };

  // Specific helpers for types (memos, notices, circulars, letters)
  getMemos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.query.type = 'memo';
    return this.getCommunications(req, res, next);
  };

  createMemo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.type = 'memo';
    return this.createCommunication(req, res, next);
  };

  getNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.query.type = 'notice';
    return this.getCommunications(req, res, next);
  };

  createNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.type = 'notice';
    return this.createCommunication(req, res, next);
  };

  getCirculars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.query.type = 'circular';
    return this.getCommunications(req, res, next);
  };

  createCircular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.type = 'circular';
    return this.createCommunication(req, res, next);
  };

  getLetters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.query.type = 'letter';
    return this.getCommunications(req, res, next);
  };

  createLetter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.type = 'letter';
    return this.createCommunication(req, res, next);
  };

  // ==========================================
  // ISSUED LETTERS / RECORDS
  // ==========================================
  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await this.service.getIssuedLetters({ employeeId, status });
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getRecordById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const result = await this.service.getIssuedLetterById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createIssuedLetterSchema.parse(req.body);
      const result = await this.service.createIssuedLetter(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Letter record created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateIssuedLetterSchema.parse(req.body);
      const result = await this.service.updateIssuedLetter(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Letter record updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteIssuedLetter(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Letter record deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // ==========================================
  // DYNAMIC LETTER GENERATION
  // ==========================================
  generateLetter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = generateLetterSchema.parse(req.body);
      const result = await this.service.generateLetter(validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Letter generated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const hrLetterController = new HrLetterController();
