import { Router } from 'express';
import {
  // Financial Incentives
  getFinancialIncentiveByEmployee,
  listFinancialIncentives,
  upsertFinancialIncentive,
  createFinancialIncentive,
  createEsopGrant,
  exerciseEsop,
  updateBonusStatus,
  addBonusPlan,
  updateBonusPlanStatus,
  addIncentiveRecord,
  updateIncentiveStatus,
  addLiteracyProgram,
  enrollLiteracyProgram,
  // Employee Development
  getEmployeeDevelopmentByEmployee,
  listEmployeeDevelopments,
  upsertEmployeeDevelopment,
  addLearningProgram,
  updateLearningProgram,
  deleteLearningProgram,
  addCertification,
  updateCertification,
  deleteCertification,
  requestMentorship,
  addMentorshipSession,
  updateMentorshipStatus,
  addCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
  // Health & Wellness
  getHealthWellnessByEmployee,
  listHealthWellness,
  upsertHealthWellness,
  submitHealthClaim,
  updateHealthClaimStatus,
  addInsuranceDependent,
  updateInsuranceDependent,
  removeInsuranceDependent,
  bookCounselling,
  cancelCounselling,
  logFitnessActivity,
  enrollFitnessChallenge,
  // Workplace Life Balance
  getWorkplaceLifeBalanceByEmployee,
  listWorkplaceLifeBalance,
  upsertWorkplaceLifeBalance,
  requestScheduleChange,
  reviewScheduleChange,
  requestPaidLeave,
  reviewPaidLeave,
  requestAccommodation,
  reviewAccommodation,
  requestChildCare,
  reviewChildCare,
  createFamilyEvent,
  registerFamilyEvent,
  requestFamilySupport,
  submitFringeClaim,
  updateFringeClaimStatus,
  applyChildCareStipend,
  // Stats
  getWellnessSummaryStats,
} from './wellness.controller';

const router = Router();

// ========================= STATS SUMMARY =========================
router.get('/stats/summary', getWellnessSummaryStats);

// ========================= FINANCIAL INCENTIVES =========================
router.get('/financial-incentives', listFinancialIncentives);
router.post('/financial-incentives', createFinancialIncentive);
router.get('/financial-incentives/:employeeId', getFinancialIncentiveByEmployee);
router.put('/financial-incentives/:employeeId', upsertFinancialIncentive);
router.post('/financial-incentives/:employeeId/esop-grant', createEsopGrant);
router.post('/financial-incentives/:employeeId/exercise-esop', exerciseEsop);
router.patch('/financial-incentives/:employeeId/bonus-status', updateBonusStatus);
router.post('/financial-incentives/:employeeId/bonus-plans', addBonusPlan);
router.patch('/financial-incentives/:employeeId/bonus-plans/:planId', updateBonusPlanStatus);
router.post('/financial-incentives/:employeeId/incentives', addIncentiveRecord);
router.patch('/financial-incentives/:employeeId/incentives/:incentiveId', updateIncentiveStatus);
router.post('/financial-incentives/:employeeId/literacy-programs', addLiteracyProgram);
router.post('/financial-incentives/:employeeId/literacy-programs/:programId/enroll', enrollLiteracyProgram);

// ========================= EMPLOYEE DEVELOPMENT =========================
router.get('/employee-development', listEmployeeDevelopments);
router.get('/employee-development/:employeeId', getEmployeeDevelopmentByEmployee);
router.put('/employee-development/:employeeId', upsertEmployeeDevelopment);
router.post('/employee-development/:employeeId/programs', addLearningProgram);
router.put('/employee-development/:employeeId/programs/:programId', updateLearningProgram);
router.delete('/employee-development/:employeeId/programs/:programId', deleteLearningProgram);
router.post('/employee-development/:employeeId/certifications', addCertification);
router.patch('/employee-development/:employeeId/certifications/:certId', updateCertification);
router.delete('/employee-development/:employeeId/certifications/:certId', deleteCertification);
router.post('/employee-development/:employeeId/mentorship/request', requestMentorship);
router.post('/employee-development/:employeeId/mentorship/sessions', addMentorshipSession);
router.patch('/employee-development/:employeeId/mentorship/status', updateMentorshipStatus);
router.post('/employee-development/:employeeId/career-goals', addCareerGoal);
router.patch('/employee-development/:employeeId/career-goals/:goalId', updateCareerGoal);
router.delete('/employee-development/:employeeId/career-goals/:goalId', deleteCareerGoal);

// ========================= HEALTH & WELLNESS =========================
router.get('/health', listHealthWellness);
router.get('/health/:employeeId', getHealthWellnessByEmployee);
router.put('/health/:employeeId', upsertHealthWellness);
router.post('/health/:employeeId/claims', submitHealthClaim);
router.patch('/health/:employeeId/claims/:claimId', updateHealthClaimStatus);
router.post('/health/:employeeId/dependents', addInsuranceDependent);
router.put('/health/:employeeId/dependents/:dependentId', updateInsuranceDependent);
router.delete('/health/:employeeId/dependents/:dependentId', removeInsuranceDependent);
router.post('/health/:employeeId/counselling/book', bookCounselling);
router.patch('/health/:employeeId/counselling/:appointmentId/cancel', cancelCounselling);
router.post('/health/:employeeId/fitness/log', logFitnessActivity);
router.post('/health/:employeeId/fitness/enroll', enrollFitnessChallenge);

// ========================= WORKPLACE LIFE BALANCE =========================
router.get('/workplace-balance', listWorkplaceLifeBalance);
router.get('/workplace-balance/:employeeId', getWorkplaceLifeBalanceByEmployee);
router.put('/workplace-balance/:employeeId', upsertWorkplaceLifeBalance);
router.post('/workplace-balance/:employeeId/schedule-requests', requestScheduleChange);
router.patch('/workplace-balance/:employeeId/schedule-requests/:requestId', reviewScheduleChange);
router.post('/workplace-balance/:employeeId/leave-requests', requestPaidLeave);
router.patch('/workplace-balance/:employeeId/leave-requests/:leaveId', reviewPaidLeave);
router.post('/workplace-balance/:employeeId/accommodation-requests', requestAccommodation);
router.patch('/workplace-balance/:employeeId/accommodation-requests/:requestId', reviewAccommodation);
router.post('/workplace-balance/:employeeId/childcare-requests', requestChildCare);
router.patch('/workplace-balance/:employeeId/childcare-requests/:requestId', reviewChildCare);
router.post('/workplace-balance/:employeeId/family-events', createFamilyEvent);
router.post('/workplace-balance/:employeeId/family-events/register', registerFamilyEvent);
router.post('/workplace-balance/:employeeId/family-support', requestFamilySupport);
router.post('/workplace-balance/:employeeId/fringe-claims', submitFringeClaim);
router.patch('/workplace-balance/:employeeId/fringe-claims/:claimId', updateFringeClaimStatus);
router.post('/workplace-balance/:employeeId/childcare-stipend', applyChildCareStipend);

export default router;
