import { Request, Response } from 'express';
import {
  financialIncentiveService,
  employeeDevelopmentService,
  healthWellnessService,
  workplaceLifeBalanceService,
  wellnessStatsService,
} from './wellness.service';
import {
  createFinancialIncentiveSchema,
  updateFinancialIncentiveSchema,
  esopGrantSchema,
  exerciseEsopSchema,
  updateBonusStatusSchema,
  addBonusPlanSchema,
  addIncentiveRecordSchema,
  addLiteracyProgramSchema,
  updateEmployeeDevelopmentSchema,
  addLearningProgramSchema,
  updateLearningProgramSchema,
  addCertificationSchema,
  updateCertificationSchema,
  requestMentorshipSchema,
  addMentorshipSessionSchema,
  addCareerGoalSchema,
  updateCareerGoalSchema,
  updateHealthWellnessSchema,
  submitHealthClaimSchema,
  updateHealthClaimStatusSchema,
  addInsuranceDependentSchema,
  counsellingBookingSchema,
  fitnessActivitySchema,
  updateWorkplaceLifeBalanceSchema,
  scheduleChangeRequestSchema,
  paidLeaveRequestSchema,
  accommodationRequestSchema,
  childCareRequestSchema,
  familyEventSchema,
  familySupportRequestSchema,
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

export const createEsopGrant = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = esopGrantSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const shares = parsed.data.totalGrantedShares ?? parsed.data.shares ?? 0;
    if (shares <= 0) return err(res, 'Granted shares must be greater than 0');
    const grantDateStr =
      parsed.data.grantDate instanceof Date
        ? parsed.data.grantDate.toISOString()
        : parsed.data.grantDate;
    const data = await financialIncentiveService.createEsopGrant(
      employeeId,
      shares,
      parsed.data.grantPrice,
      parsed.data.currentFMV,
      parsed.data.tranchesCount,
      grantDateStr
    );
    ok(res, data, 'ESOP grant created and vesting schedule generated');
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

export const addBonusPlan = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addBonusPlanSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.addBonusPlan(employeeId, parsed.data);
    created(res, data, 'Bonus plan submitted successfully');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateBonusPlanStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const planId = p(req.params, 'planId');
    const { status, notes } = req.body;
    if (!status) return err(res, 'Status is required');
    const data = await financialIncentiveService.updateBonusPlanStatus(employeeId, planId, status, notes);
    ok(res, data, `Bonus plan status updated to ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const addIncentiveRecord = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addIncentiveRecordSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.addIncentiveRecord(employeeId, parsed.data);
    created(res, data, 'Incentive program recorded');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateIncentiveStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const incentiveId = p(req.params, 'incentiveId');
    const { status } = req.body;
    if (!status) return err(res, 'Status is required');
    const data = await financialIncentiveService.updateIncentiveStatus(employeeId, incentiveId, status);
    ok(res, data, `Incentive status updated to ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const addLiteracyProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addLiteracyProgramSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await financialIncentiveService.addLiteracyProgram(employeeId, parsed.data);
    created(res, data, 'Financial literacy workshop added');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const enrollLiteracyProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const programId = p(req.params, 'programId');
    const data = await financialIncentiveService.enrollLiteracyProgram(employeeId, programId);
    ok(res, data, 'Enrolled in financial literacy session');
  } catch (e: any) {
    err(res, e.message, 500);
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
    created(res, data, 'Program enrolled');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateLearningProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const programId = p(req.params, 'programId');
    const parsed = updateLearningProgramSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.updateProgram(employeeId, programId, parsed.data);
    ok(res, data, 'Program updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const deleteLearningProgram = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const programId = p(req.params, 'programId');
    const data = await employeeDevelopmentService.deleteProgram(employeeId, programId);
    ok(res, data, 'Program removed');
  } catch (e: any) {
    err(res, e.message, 500);
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
    err(res, e.message, 500);
  }
};

export const updateCertification = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const certId = p(req.params, 'certId');
    const parsed = updateCertificationSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.updateCertification(employeeId, certId, parsed.data);
    ok(res, data, 'Certification updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const certId = p(req.params, 'certId');
    const data = await employeeDevelopmentService.deleteCertification(employeeId, certId);
    ok(res, data, 'Certification removed');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const requestMentorship = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = requestMentorshipSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.requestMentorship(employeeId, parsed.data);
    ok(res, data, 'Mentorship requested and assigned');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const addMentorshipSession = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addMentorshipSessionSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.addMentorshipSession(employeeId, parsed.data);
    created(res, data, 'Mentorship session logged');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateMentorshipStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const { status, feedback } = req.body;
    if (!status) return err(res, 'Status is required');
    const data = await employeeDevelopmentService.updateMentorshipStatus(employeeId, status, feedback);
    ok(res, data, `Mentorship marked as ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const addCareerGoal = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addCareerGoalSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.addCareerGoal(employeeId, parsed.data);
    created(res, data, 'Career goal created');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateCareerGoal = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const goalId = p(req.params, 'goalId');
    const parsed = updateCareerGoalSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await employeeDevelopmentService.updateCareerGoal(employeeId, goalId, parsed.data);
    ok(res, data, 'Career goal updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const deleteCareerGoal = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const goalId = p(req.params, 'goalId');
    const data = await employeeDevelopmentService.deleteCareerGoal(employeeId, goalId);
    ok(res, data, 'Career goal removed');
  } catch (e: any) {
    err(res, e.message, 500);
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
    ok(res, data, 'Health wellness record updated');
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
    created(res, data, 'Medical claim submitted');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateHealthClaimStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const claimId = p(req.params, 'claimId');
    const parsed = updateHealthClaimStatusSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.updateClaimStatus(
      employeeId,
      claimId,
      parsed.data.status,
      parsed.data.notes,
      parsed.data.rejectionReason
    );
    ok(res, data, `Claim status updated to ${parsed.data.status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const addInsuranceDependent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = addInsuranceDependentSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.addDependent(employeeId, parsed.data);
    created(res, data, 'Dependent added to policy');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateInsuranceDependent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const dependentId = p(req.params, 'dependentId');
    const data = await healthWellnessService.updateDependent(employeeId, dependentId, req.body);
    ok(res, data, 'Dependent updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const removeInsuranceDependent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const dependentId = p(req.params, 'dependentId');
    const data = await healthWellnessService.removeDependent(employeeId, dependentId);
    ok(res, data, 'Dependent removed from policy');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const bookCounselling = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = counsellingBookingSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.bookCounselling(employeeId, parsed.data);
    created(res, data, 'Counselling appointment scheduled');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const cancelCounselling = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const appointmentId = p(req.params, 'appointmentId');
    const data = await healthWellnessService.cancelCounselling(employeeId, appointmentId);
    ok(res, data, 'Counselling appointment cancelled');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const logFitnessActivity = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = fitnessActivitySchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await healthWellnessService.logFitnessActivity(employeeId, parsed.data);
    created(res, data, 'Fitness activity logged');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const enrollFitnessChallenge = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const { challengeName, stepsGoal } = req.body;
    if (!challengeName || !stepsGoal) return err(res, 'Challenge name and steps goal are required');
    const data = await healthWellnessService.enrollFitnessChallenge(employeeId, challengeName, Number(stepsGoal));
    ok(res, data, 'Enrolled in corporate fitness challenge');
  } catch (e: any) {
    err(res, e.message, 500);
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
    ok(res, data, 'Workplace balance record updated');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const requestScheduleChange = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = scheduleChangeRequestSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.requestScheduleChange(employeeId, parsed.data);
    created(res, data, 'Schedule change request submitted');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const reviewScheduleChange = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const requestId = p(req.params, 'requestId');
    const { status } = req.body;
    if (status !== 'Approved' && status !== 'Rejected') {
      return err(res, 'Status must be Approved or Rejected');
    }
    const data = await workplaceLifeBalanceService.reviewScheduleChange(employeeId, requestId, status);
    ok(res, data, `Schedule change request marked as ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const requestPaidLeave = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = paidLeaveRequestSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.requestPaidLeave(employeeId, parsed.data);
    created(res, data, 'Paid leave request submitted');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const reviewPaidLeave = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const leaveId = p(req.params, 'leaveId');
    const { status, rejectionReason } = req.body;
    if (!status) return err(res, 'Status is required');
    const data = await workplaceLifeBalanceService.reviewPaidLeave(employeeId, leaveId, status, rejectionReason);
    ok(res, data, `Leave request marked as ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const requestAccommodation = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = accommodationRequestSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.requestAccommodation(employeeId, parsed.data);
    created(res, data, 'Accommodation request submitted');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const reviewAccommodation = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const requestId = p(req.params, 'requestId');
    const { status, allocatedRoomNumber } = req.body;
    if (!status) return err(res, 'Status is required');
    const data = await workplaceLifeBalanceService.reviewAccommodation(
      employeeId,
      requestId,
      status,
      allocatedRoomNumber
    );
    ok(res, data, `Accommodation request marked as ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const requestChildCare = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = childCareRequestSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.requestChildCare(employeeId, parsed.data);
    created(res, data, 'Childcare assistance request submitted');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const reviewChildCare = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const requestId = p(req.params, 'requestId');
    const { status } = req.body;
    if (!status) return err(res, 'Status is required');
    const data = await workplaceLifeBalanceService.reviewChildCare(employeeId, requestId, status);
    ok(res, data, `Childcare request marked as ${status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const createFamilyEvent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = familyEventSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.createFamilyEvent(employeeId, parsed.data);
    created(res, data, 'Family event added');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const registerFamilyEvent = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const { eventName } = req.body;
    if (!eventName) return err(res, 'Event name is required');
    const data = await workplaceLifeBalanceService.registerFamilyEvent(employeeId, eventName);
    ok(res, data, 'Registered for family event');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const requestFamilySupport = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const parsed = familySupportRequestSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.requestFamilySupport(employeeId, parsed.data);
    created(res, data, 'Family support request submitted');
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
    created(res, data, 'Fringe claim submitted');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const updateFringeClaimStatus = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const claimId = p(req.params, 'claimId');
    const parsed = updateFringeClaimStatusSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const data = await workplaceLifeBalanceService.updateFringeClaimStatus(
      employeeId,
      claimId,
      parsed.data.status,
      parsed.data.rejectionReason
    );
    ok(res, data, `Fringe claim status updated to ${parsed.data.status}`);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

export const applyChildCareStipend = async (req: Request, res: Response) => {
  try {
    const employeeId = p(req.params, 'employeeId');
    const data = await workplaceLifeBalanceService.applyChildCareStipend(employeeId);
    ok(res, data, 'Childcare stipend applied');
  } catch (e: any) {
    err(res, e.message, 500);
  }
};

// ========================= STATS SUMMARY =========================

export const getWellnessSummaryStats = async (req: Request, res: Response) => {
  try {
    const employeeId = q(req.query, 'employeeId');
    const stats = await wellnessStatsService.getSummaryStats(employeeId);
    ok(res, stats);
  } catch (e: any) {
    err(res, e.message, 500);
  }
};
