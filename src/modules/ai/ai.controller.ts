import { Request, Response, NextFunction } from 'express';
import { aiService, AIService } from './ai.service';
import {
  createFlightRiskSchema,
  updateFlightRiskSchema,
  flightRiskQueryFilterSchema,
  createSkillGapSchema,
  updateSkillGapSchema,
  createDevelopmentRecommendationSchema,
  updateDevelopmentRecommendationSchema,
  sendChatMessageSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  complianceQueryFilterSchema,
} from './ai.validator';
import { sendResponse } from '../../common/utils/apiResponse';

const getParam = (params: Request['params'], key: string): string => String(params[key] || '');

export class AIController {
  private service: AIService;

  constructor(service = aiService) {
    this.service = service;
  }

  // ================= 1. WORKFORCE ANALYTICS & FLIGHT RISK =================

  getWorkforceAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getWorkforceAnalytics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Predictive workforce analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  listFlightRisks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = flightRiskQueryFilterSchema.parse(req.query);
      const data = await this.service.listFlightRisks(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Flight risk employees retrieved successfully',
        data: data.flightRisks,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getFlightRiskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getFlightRiskById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Flight risk record retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createFlightRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createFlightRiskSchema.parse(req.body);
      const data = await this.service.createFlightRisk(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Flight risk record created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateFlightRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateFlightRiskSchema.parse(req.body);
      const data = await this.service.updateFlightRisk(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Flight risk record updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  resolveFlightRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const resolvedBy = req.body?.resolvedBy || 'System Admin';
      const notes = req.body?.notes || 'Flight risk resolved with mitigation actions';
      const data = await this.service.resolveFlightRisk(id, resolvedBy, notes);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Flight risk resolved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  predictFlightRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.evaluateEmployeeFlightRisk(req.body || {});
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee flight risk evaluated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 2. SKILL GAP & PERFORMANCE =================

  listSkillGaps = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listSkillGaps();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Autonomous skill gap matrix retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getSkillGapById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getSkillGapById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Skill gap record retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createSkillGap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createSkillGapSchema.parse(req.body);
      const data = await this.service.createSkillGap(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Skill gap matrix item created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSkillGap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateSkillGapSchema.parse(req.body);
      const data = await this.service.updateSkillGap(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Skill gap record updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  listDevelopmentRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
      const data = await this.service.listDevelopmentRecommendations(employeeId);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Development recommendations retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createDevelopmentRecommendation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createDevelopmentRecommendationSchema.parse(req.body);
      const data = await this.service.createDevelopmentRecommendation(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Development recommendation created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDevelopmentRecommendation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateDevelopmentRecommendationSchema.parse(req.body);
      const data = await this.service.updateDevelopmentRecommendation(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Development recommendation updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 3. CONVERSATIONAL HR & EX =================

  getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = req.query.conversationId ? String(req.query.conversationId) : 'default-chat';
      const userId = (req.user as any)?.id || 'user-1';
      const userName = (req.user as any)?.name || 'Sarah Joseph';
      const data = await this.service.getConversation(conversationId, userId, userName);
      sendResponse({
        res,
        statusCode: 200,
        message: 'AI conversation history retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  sendChatMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = sendChatMessageSchema.parse(req.body);
      const data = await this.service.sendChatMessage(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'AI response generated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  clearConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = req.body?.conversationId || (req.query?.conversationId ? String(req.query.conversationId) : 'default-chat');
      const data = await this.service.clearConversation(conversationId);
      sendResponse({
        res,
        statusCode: 200,
        message: 'AI conversation history cleared successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getSentimentMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getSentimentMetrics();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Employee experience sentiment metrics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  syncKnowledgeBase = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.syncKnowledgeBase();
      sendResponse({
        res,
        statusCode: 200,
        message: 'AI Knowledge Base synchronized with global entities',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= 4. AUTOMATED COMPLIANCE =================

  listComplianceRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = complianceQueryFilterSchema.parse(req.query);
      const data = await this.service.listComplianceRecords(parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Automated compliance records retrieved successfully',
        data: data.complianceRecords,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getComplianceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.getComplianceById(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Compliance record retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createComplianceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createComplianceRecordSchema.parse(req.body);
      const data = await this.service.createComplianceRecord(parsed);
      sendResponse({
        res,
        statusCode: 201,
        message: 'Compliance record created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  updateComplianceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const parsed = updateComplianceRecordSchema.parse(req.body);
      const data = await this.service.updateComplianceRecord(id, parsed);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Compliance record updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteComplianceRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getParam(req.params, 'id');
      const data = await this.service.deleteComplianceRecord(id);
      sendResponse({
        res,
        statusCode: 200,
        message: 'Compliance record removed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  runComplianceScan = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.runComplianceScan();
      sendResponse({
        res,
        statusCode: 200,
        message: 'Automated compliance scan completed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AIController();
