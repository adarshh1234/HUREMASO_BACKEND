import { Router } from 'express';
import {
  // Financial Incentives
  getFinancialIncentiveByEmployee,
  listFinancialIncentives,
  upsertFinancialIncentive,
  createFinancialIncentive,
  exerciseEsop,
  updateBonusStatus,
  // Employee Development
  getEmployeeDevelopmentByEmployee,
  listEmployeeDevelopments,
  upsertEmployeeDevelopment,
  addLearningProgram,
  updateLearningProgram,
  deleteLearningProgram,
  addCertification,
  deleteCertification,
  // Health & Wellness
  getHealthWellnessByEmployee,
  listHealthWellness,
  upsertHealthWellness,
  submitHealthClaim,
  updateHealthClaimStatus,
  addInsuranceDependent,
  // Workplace Life Balance
  getWorkplaceLifeBalanceByEmployee,
  listWorkplaceLifeBalance,
  upsertWorkplaceLifeBalance,
  submitFringeClaim,
  updateFringeClaimStatus,
  registerFamilyEvent,
  applyChildCareStipend,
} from './wellness.controller';

const router = Router();

// ========================= FINANCIAL INCENTIVES =========================
// GET  /api/v1/wellness/financial-incentives                       - list all
// POST /api/v1/wellness/financial-incentives                       - create/upsert
// GET  /api/v1/wellness/financial-incentives/:employeeId           - get by employee
// PUT  /api/v1/wellness/financial-incentives/:employeeId           - update
// POST /api/v1/wellness/financial-incentives/:employeeId/exercise-esop  - exercise esop tranche
// PATCH /api/v1/wellness/financial-incentives/:employeeId/bonus-status  - update bonus status

router.get('/financial-incentives', listFinancialIncentives);
router.post('/financial-incentives', createFinancialIncentive);
router.get('/financial-incentives/:employeeId', getFinancialIncentiveByEmployee);
router.put('/financial-incentives/:employeeId', upsertFinancialIncentive);
router.post('/financial-incentives/:employeeId/exercise-esop', exerciseEsop);
router.patch('/financial-incentives/:employeeId/bonus-status', updateBonusStatus);

// ========================= EMPLOYEE DEVELOPMENT =========================
// GET  /api/v1/wellness/employee-development                       - list all
// GET  /api/v1/wellness/employee-development/:employeeId           - get by employee
// PUT  /api/v1/wellness/employee-development/:employeeId           - update
// POST /api/v1/wellness/employee-development/:employeeId/programs  - add learning program
// PUT  /api/v1/wellness/employee-development/:employeeId/programs/:programId - update program
// DELETE /api/v1/wellness/employee-development/:employeeId/programs/:programId - delete program
// POST /api/v1/wellness/employee-development/:employeeId/certifications - add certification
// DELETE /api/v1/wellness/employee-development/:employeeId/certifications/:certId - delete cert

router.get('/employee-development', listEmployeeDevelopments);
router.get('/employee-development/:employeeId', getEmployeeDevelopmentByEmployee);
router.put('/employee-development/:employeeId', upsertEmployeeDevelopment);
router.post('/employee-development/:employeeId/programs', addLearningProgram);
router.put('/employee-development/:employeeId/programs/:programId', updateLearningProgram);
router.delete('/employee-development/:employeeId/programs/:programId', deleteLearningProgram);
router.post('/employee-development/:employeeId/certifications', addCertification);
router.delete('/employee-development/:employeeId/certifications/:certId', deleteCertification);

// ========================= HEALTH & WELLNESS =========================
// GET  /api/v1/wellness/health                                     - list all
// GET  /api/v1/wellness/health/:employeeId                         - get by employee
// PUT  /api/v1/wellness/health/:employeeId                         - update
// POST /api/v1/wellness/health/:employeeId/claims                  - submit claim
// PATCH /api/v1/wellness/health/:employeeId/claims/:claimId        - update claim status
// POST /api/v1/wellness/health/:employeeId/dependents              - add dependent

router.get('/health', listHealthWellness);
router.get('/health/:employeeId', getHealthWellnessByEmployee);
router.put('/health/:employeeId', upsertHealthWellness);
router.post('/health/:employeeId/claims', submitHealthClaim);
router.patch('/health/:employeeId/claims/:claimId', updateHealthClaimStatus);
router.post('/health/:employeeId/dependents', addInsuranceDependent);

// ========================= WORKPLACE LIFE BALANCE =========================
// GET  /api/v1/wellness/workplace-balance                          - list all
// GET  /api/v1/wellness/workplace-balance/:employeeId              - get by employee
// PUT  /api/v1/wellness/workplace-balance/:employeeId              - update
// POST /api/v1/wellness/workplace-balance/:employeeId/fringe-claims - submit fringe claim
// PATCH /api/v1/wellness/workplace-balance/:employeeId/fringe-claims/:claimId - update claim status
// POST /api/v1/wellness/workplace-balance/:employeeId/family-events - register for family event
// POST /api/v1/wellness/workplace-balance/:employeeId/childcare-stipend - apply for childcare

router.get('/workplace-balance', listWorkplaceLifeBalance);
router.get('/workplace-balance/:employeeId', getWorkplaceLifeBalanceByEmployee);
router.put('/workplace-balance/:employeeId', upsertWorkplaceLifeBalance);
router.post('/workplace-balance/:employeeId/fringe-claims', submitFringeClaim);
router.patch('/workplace-balance/:employeeId/fringe-claims/:claimId', updateFringeClaimStatus);
router.post('/workplace-balance/:employeeId/family-events', registerFamilyEvent);
router.post('/workplace-balance/:employeeId/childcare-stipend', applyChildCareStipend);

export default router;
