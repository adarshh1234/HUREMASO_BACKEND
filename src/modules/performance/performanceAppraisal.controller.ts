import { Request, Response, NextFunction } from 'express';
import {
  performanceAppraisalService,
  PerformanceAppraisalService,
} from './performanceAppraisal.service';
import { sendResponse } from '../../common/utils/apiResponse';
import {
  createAppraisalSchema,
  updateAppraisalSchema,
  updateReportsAiSchema,
  updateAttendanceTimeSchema,
  updateSmartWorkSchema,
  updatePsychometricSchema,
  updateEsopsSchema,
  updateReviewSectionSchema,
  add360FeedbackSchema,
  addEndorsementSchema,
  updateStrategySchema,
  updateAnalyticsAiSchema,
  createAppraisalCycleSchema,
  updateAppraisalCycleSchema,
  queryAppraisalSchema,
  mongoIdSchema,
} from './performanceAppraisal.validator';

export class PerformanceAppraisalController {
  constructor(private service: PerformanceAppraisalService = performanceAppraisalService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryAppraisalSchema.parse(req.query);
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
      const validated = createAppraisalSchema.parse(req.body);
      const item = await this.service.create(validated as any, req.user);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Performance appraisal record created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateAppraisalSchema.parse(req.body);
      const item = await this.service.update(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Performance appraisal record updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  // Section 1: Regenerate AI Report
  generateAiReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const item = await this.service.generateAiReport(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'AI appraisal report recalculated and generated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  // Section 2: Sync Attendance and Tasks
  syncAttendanceAndTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const item = await this.service.syncAttendanceAndTasks(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Attendance and task velocity metrics synchronized successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateReportsAi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateReportsAiSchema.parse(req.body);
      const item = await this.service.updateReportsAi(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'AI Reports & Competencies updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateAttendanceTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateAttendanceTimeSchema.parse(req.body);
      const item = await this.service.updateAttendanceTime(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Attendance & Time appraisal metrics updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateSmartWork = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateSmartWorkSchema.parse(req.body);
      const item = await this.service.updateSmartWork(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Smart work initiatives updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updatePsychometric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updatePsychometricSchema.parse(req.body);
      const item = await this.service.updatePsychometric(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Psychometric profile updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateEsops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateEsopsSchema.parse(req.body);
      const item = await this.service.updateEsops(id, validated.sops as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'E-SOPs acknowledgement updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateReviewSectionSchema.parse(req.body);
      const item = await this.service.updateReview(id, validated as any, req.user);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Performance review updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  add360Feedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = add360FeedbackSchema.parse(req.body);
      const item = await this.service.add360Feedback(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: '360 degree feedback submitted successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  addEndorsement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = addEndorsementSchema.parse(req.body);
      const item = await this.service.addEndorsement(id, validated);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Peer recommendation added successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateStrategy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateStrategySchema.parse(req.body);
      const item = await this.service.updateStrategy(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Strategy program status updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  updateAnalyticsAi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateAnalyticsAiSchema.parse(req.body);
      const item = await this.service.updateAnalyticsAi(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Predictive AI analytics updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  };

  getExportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const data = await this.service.getExportData(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Appraisal intelligence report data ready for export',
        data,
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
        message: 'Performance appraisal record deleted successfully',
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

  // --- Cycles Controllers ---
  getAllCycles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cycles = await this.service.getAllCycles();
      sendResponse({
        res,
        statusCode: 200,
        data: cycles,
      });
    } catch (err) {
      next(err);
    }
  };

  getCycleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const cycle = await this.service.getCycleById(id);
      sendResponse({
        res,
        statusCode: 200,
        data: cycle,
      });
    } catch (err) {
      next(err);
    }
  };

  createCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createAppraisalCycleSchema.parse(req.body);
      const cycle = await this.service.createCycle(validated as any, req.user);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Appraisal cycle created successfully',
        data: cycle,
      });
    } catch (err) {
      next(err);
    }
  };

  updateCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      const validated = updateAppraisalCycleSchema.parse(req.body);
      const cycle = await this.service.updateCycle(id, validated as any);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Appraisal cycle updated successfully',
        data: cycle,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = mongoIdSchema.parse(req.params.id);
      await this.service.deleteCycle(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Appraisal cycle deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const performanceAppraisalController = new PerformanceAppraisalController();
