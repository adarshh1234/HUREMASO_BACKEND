import { Request, Response, NextFunction } from 'express';
import { projectService, ProjectService } from './project.service';
import { sendResponse } from '../../../common/utils/apiResponse';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createProjectSchema,
  updateProjectSchema,
  mongoIdSchema,
} from './project.validator';

export class ProjectController {
  constructor(private service: ProjectService = projectService) {}

  // Customers
  getCustomers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCustomers();
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createCustomerSchema.parse(req.body);
      const result = await this.service.createCustomer(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Customer added successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateCustomerSchema.parse(req.body);
      const result = await this.service.updateCustomer(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Customer updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteCustomer(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Customer deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // Projects
  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getProjects(req.query);
      sendResponse({
        res,
        statusCode: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createProjectSchema.parse(req.body);
      const result = await this.service.createProject(validated);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Project created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateProjectSchema.parse(req.body);
      const result = await this.service.updateProject(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Project updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteProject(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Project deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const projectController = new ProjectController();
