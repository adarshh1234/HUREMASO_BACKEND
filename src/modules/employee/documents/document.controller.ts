import { Request, Response, NextFunction } from 'express';
import { documentService, DocumentService } from './document.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createFolderSchema,
  createDocumentSchema,
  updateDocumentSchema,
  mongoIdSchema,
} from './document.validator';

export class DocumentController {
  constructor(private service: DocumentService = documentService) {}

  // Folders
  getFolders = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const folders = await this.service.getFolders();
      sendResponse({
        res,
        statusCode: 200,
        data: folders,
      });
    } catch (err) {
      next(err);
    }
  };

  createFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createFolderSchema.parse(req.body);
      const folder = await this.service.createFolder(validated.name, validated.description);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Folder created successfully',
        data: folder,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteFolder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteFolder(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Folder deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Documents
  getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docs = await this.service.getDocuments(req.query);
      sendResponse({
        res,
        statusCode: 200,
        data: docs,
      });
    } catch (err) {
      next(err);
    }
  };

  createDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createDocumentSchema.parse(req.body);
      const doc = await this.service.createDocument(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Document uploaded successfully',
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  };

  getDocumentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const doc = await this.service.getDocumentById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  };

  updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateDocumentSchema.parse(req.body);
      const doc = await this.service.updateDocument(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Document updated successfully',
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteDocument(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Document deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const documentController = new DocumentController();
