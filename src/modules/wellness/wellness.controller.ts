import { Request, Response } from 'express';
import {
  financialIncentiveService,
  employeeDevelopmentService,
  healthWellnessService,
  workplaceLifeBalanceService,
} from './wellness.service';
import {
  createFinancialIncentiveSchema,
  updateFinancialIncentiveSchema,
  exerciseEsopSchema,
  updateBonusStatusSchema,
  updateEmployeeDevelopmentSchema,
  addLearningProgramSchema,
  addCertificationSchema,
  updateHealthWellnessSchema,
  submitHealthClaimSchema,
  updateHealthClaimStatusSchema,
  updateWorkplaceLifeBalanceSchema,
  submitFringeClaimSchema,
  updateFringeClaimStatusSchema,
} from './wellness.validator';

const ok = (res: Response, data: unknown, message = 'Success') =>
  res.status(200).json({ success: true, message, data });

const created = (res: Response, data: unknown, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

const err = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

const p = (params: Request['params'], key: string): string => String(params[key] || '');
const q = (query: Request['query'], key: string): string | undefined => {
  const val = query[key];
  if (val === undefined || val === null) return undefined;
  return Array.isArray(val) ? String(val[0]) : String(val);
};

// ========================= FINANCIAL INCENTIVES =========================

export const getFinancialIncentiveByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const employeeName = q(req.query, 'employeeName');
    const department = q(req.query, 'department');
    const data = await financialIncentiveService.getByEmployee(employeeId, employeeName, department);
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const listFinancialIncentives = async (req: Request, res: Response) => {
  try {
    const page = q(req.query, 'page');
    const limit = q(req.query, 'limit');
    const search = q(req.query, 'search');
    const data = await financialIncentiveService.list(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search
    );
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const upsertFinancialIncentive = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = updateFinancialIncentiveSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.upsert(employeeId, parsed.data as any);
    ok(res, data, 'Financial incentive record updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const createFinancialIncentive = async (req: Request, res: Response) => {
  try {
    const parsed = createFinancialIncentiveSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.upsert(parsed.data.employeeId, parsed.data as any);
    created(res, data, 'Financial incentive record created');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const exerciseEsop = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = exerciseEsopSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.exerciseEsop(employeeId, parsed.data.trancheNumber);
    ok(res, data, 'ESOP options exercised successfully');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const updateBonusStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = updateBonusStatusSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.updateBonusStatus(employeeId, parsed.data.bonusStatus);
    ok(res, data, 'Bonus status updated');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

// ========================= EMPLOYEE DEVELOPMENT =========================

export const getEmployeeDevelopmentByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const employeeName = q(req.query, 'employeeName');
    const department = q(req.query, 'department');
    const data = await employeeDevelopmentService.getByEmployee(employeeId, employeeName, department);
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const listEmployeeDevelopments = async (req: Request, res: Response) => {
  try {
    const page = q(req.query, 'page');
    const limit = q(req.query, 'limit');
    const search = q(req.query, 'search');
    const data = await employeeDevelopmentService.list(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search
    );
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const upsertEmployeeDevelopment = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = updateEmployeeDevelopmentSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.upsert(employeeId, parsed.data as any);
    ok(res, data, 'Development record updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const addLearningProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addLearningProgramSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.addProgram(employeeId, parsed.data);
    created(res, data, 'Learning program added');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const updateLearningProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const programId = p(req.params, 'programId');
    const data = await employeeDevelopmentService.updateProgram(employeeId, programId, req.body);
    ok(res, data, 'Learning program updated');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const deleteLearningProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const programId = p(req.params, 'programId');
    const data = await employeeDevelopmentService.deleteProgram(employeeId, programId);
    ok(res, data, 'Learning program removed');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const addCertification = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addCertificationSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.addCertification(employeeId, parsed.data);
    created(res, data, 'Certification added');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const certId = p(req.params, 'certId');
    const data = await employeeDevelopmentService.deleteCertification(employeeId, certId);
    ok(res, data, 'Certification removed');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

// ========================= HEALTH & WELLNESS =========================

export const getHealthWellnessByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const employeeName = q(req.query, 'employeeName');
    const department = q(req.query, 'department');
    const data = await healthWellnessService.getByEmployee(employeeId, employeeName, department);
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const listHealthWellness = async (req: Request, res: Response) => {
  try {
    const page = q(req.query, 'page');
    const limit = q(req.query, 'limit');
    const search = q(req.query, 'search');
    const data = await healthWellnessService.list(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search
    );
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const upsertHealthWellness = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = updateHealthWellnessSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.upsert(employeeId, parsed.data as any);
    ok(res, data, 'Health & wellness record updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const submitHealthClaim = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = submitHealthClaimSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.submitClaim(employeeId, parsed.data);
    created(res, data, 'Health claim submitted successfully');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const updateHealthClaimStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const claimId = p(req.params, 'claimId');
    const parsed = updateHealthClaimStatusSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.updateClaimStatus(employeeId, claimId, parsed.data.status, parsed.data.notes);
    ok(res, data, 'Health claim status updated');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const addInsuranceDependent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const data = await healthWellnessService.addDependent(employeeId, req.body);
    created(res, data, 'Dependent added to insurance');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

// ========================= WORKPLACE LIFE BALANCE =========================

export const getWorkplaceLifeBalanceByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const employeeName = q(req.query, 'employeeName');
    const department = q(req.query, 'department');
    const data = await workplaceLifeBalanceService.getByEmployee(employeeId, employeeName, department);
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const listWorkplaceLifeBalance = async (req: Request, res: Response) => {
  try {
    const page = q(req.query, 'page');
    const limit = q(req.query, 'limit');
    const search = q(req.query, 'search');
    const data = await workplaceLifeBalanceService.list(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search
    );
    ok(res, data);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const upsertWorkplaceLifeBalance = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = updateWorkplaceLifeBalanceSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.upsert(employeeId, parsed.data as any);
    ok(res, data, 'Workplace life balance record updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const submitFringeClaim = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = submitFringeClaimSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.submitFringeClaim(employeeId, parsed.data);
    created(res, data, 'Fringe claim submitted successfully');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const updateFringeClaimStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const claimId = p(req.params, 'claimId');
    const parsed = updateFringeClaimStatusSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.updateFringeClaimStatus(employeeId, claimId, parsed.data.status);
    ok(res, data, 'Fringe claim status updated');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const registerFamilyEvent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const { eventName } = req.body as { eventName?: string };
    if (!eventName) return err(res, 'Event name is required');
    const data = await workplaceLifeBalanceService.registerFamilyEvent(employeeId, eventName);
    ok(res, data, 'Registered for family event');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};

export const applyChildCareStipend = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const data = await workplaceLifeBalanceService.applyChildCareStipend(employeeId);
    ok(res, data, 'Childcare stipend application submitted');
  } catch (e: any) {
    err(res, e.message, 400);
  }
};
