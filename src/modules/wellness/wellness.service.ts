import {
  financialIncentiveRepo,
  employeeDevelopmentRepo,
  healthWellnessRepo,
  workplaceLifeBalanceRepo,
} from './wellness.repository';
import {
  IFinancialIncentive,
  IEmployeeDevelopment,
  IHealthWellness,
  IWorkplaceLifeBalance,
} from './wellness.types';

// ========================= DEFAULT SEED DATA HELPERS =========================

const getDefaultFinancialIncentive = (employeeId: string, employeeName: string, department: string): Partial<IFinancialIncentive> => ({
  employeeId,
  employeeName,
  department,
  grantedEsopShares: 2500,
  grantPrice: 12.5,
  currentFMV: 42.5,
  vestingSchedule: [
    { trancheNumber: 1, period: 'Tranche 1 (Year 1)', vestingDate: new Date('2024-10-15'), shares: 625, status: 'Vested' },
    { trancheNumber: 2, period: 'Tranche 2 (Year 2)', vestingDate: new Date('2025-10-15'), shares: 625, status: 'Vested' },
    { trancheNumber: 3, period: 'Tranche 3 (Year 3)', vestingDate: new Date('2026-10-15'), shares: 625, status: 'Granted' },
    { trancheNumber: 4, period: 'Tranche 4 (Year 4)', vestingDate: new Date('2027-10-15'), shares: 625, status: 'Granted' },
  ],
  bonusYear: new Date().getFullYear(),
  bonusMultiplier: 1.25,
  estimatedBonusAmount: 18500,
  bonusStatus: 'Approved',
  bonusTargetAchievement: 112,
  incentives: [
    { title: 'Project Milestone Alpha', target: '100% On-time delivery', reward: '$2,500 Spot Award', rewardAmount: 2500, status: 'Achieved', quarter: 'Q3-2026' },
    { title: 'Client Satisfaction Index', target: '> 95% CSAT Score', reward: '$1,500 Incentive', rewardAmount: 1500, status: 'In_Progress', quarter: 'Q3-2026' },
  ],
  financialLiteracySessionsAttended: 2,
});

const getDefaultEmployeeDevelopment = (employeeId: string, employeeName: string, department: string): Partial<IEmployeeDevelopment> => ({
  employeeId,
  employeeName,
  department,
  completedTrainingHours: 48,
  annualTargetHours: 60,
  learningAllowanceBalance: 1200,
  learningAllowanceCurrency: 'USD',
  learningPrograms: [
    { title: 'Strategic Product Leadership & Team Management', provider: 'Huremaso Learning Hub', totalModules: 8, completedModules: 6, progressPercent: 75, status: 'In_Progress' },
    { title: 'Advanced Cloud Security & Microservices Architecture', provider: 'Coursera Enterprise', totalModules: 10, completedModules: 4, progressPercent: 40, status: 'In_Progress' },
  ],
  certifications: [
    { name: 'AWS Solutions Architect', issuingOrganization: 'Amazon Web Services', issuedDate: new Date('2024-03-15'), status: 'Active' },
    { name: 'Project Management Professional (PMP)', issuingOrganization: 'PMI', issuedDate: new Date('2023-11-20'), status: 'Active' },
  ],
  careerGoal: 'Senior Engineering Lead',
  nextReviewDate: new Date('2026-12-01'),
});

const getDefaultHealthWellness = (employeeId: string, employeeName: string, department: string): Partial<IHealthWellness> => ({
  employeeId,
  employeeName,
  department,
  groupInsurancePolicyNumber: `GHI-${Math.floor(Math.random() * 9000) + 1000}-${new Date().getFullYear()}`,
  groupInsuranceSumInsured: 50000,
  groupInsuranceCurrency: 'USD',
  groupInsuranceExpiry: new Date('2027-01-01'),
  insuranceDependents: [
    { name: `${employeeName} (Self)`, relationship: 'Primary Insured', status: 'Covered' },
    { name: 'Spouse', relationship: 'Spouse', status: 'Covered' },
    { name: 'Child', relationship: 'Child', status: 'Covered' },
  ],
  healthClaims: [
    { claimId: 'CLM-901', date: new Date('2026-08-10'), type: 'Dental', description: 'Dental Consultation', amount: 150, currency: 'USD', status: 'Approved' },
    { claimId: 'CLM-882', date: new Date('2026-07-14'), type: 'Vision', description: 'Prescription Eyewear', amount: 220, currency: 'USD', status: 'Reimbursed' },
  ],
  eapSessionsAvailable: 12,
  eapSessionsUsed: 2,
  mindfulnessAppAccess: true,
  fitnessChallengeName: 'Monthly 100,000 Step Challenge',
  fitnessChallengeStepsGoal: 100000,
  fitnessChallengeCurrentSteps: 78400,
  fitnessChallengeRank: 14,
  fitnessChallengeStatus: 'Active',
});

const getDefaultWorkplaceLifeBalance = (employeeId: string, employeeName: string, department: string): Partial<IWorkplaceLifeBalance> => ({
  employeeId,
  employeeName,
  department,
  workScheduleType: 'Hybrid 3/2',
  officeDaysPerWeek: 3,
  coreHoursStart: '09:00',
  coreHoursEnd: '17:00',
  flexiBandStart: '08:00',
  flexiBandEnd: '10:00',
  remoteWorkLocation: 'Primary Residence (Verified High-Speed Network)',
  sabbaticalLeaveWeeks: 4,
  wellnessDaysTotal: 5,
  wellnessDaysUsed: 0,
  parentalLeaveWeeks: 16,
  childCareStipendMonthly: 400,
  childCareStipendCurrency: 'USD',
  childCareStipendActive: true,
  dormitoryAccessActive: true,
  familyEventsRegistered: [],
  fringeMonthlyInternetAllowance: 150,
  fringeMonthlyCommuteAllowance: 200,
  fringeTotalYTDReimbursed: 2800,
  fringeCurrency: 'USD',
  fringeClaims: [
    { claimId: 'FRG-401', date: new Date('2026-08-24'), title: 'Home Fiber Internet Bill', category: 'Connectivity', amount: 120, currency: 'USD', status: 'Approved' },
    { claimId: 'FRG-392', date: new Date('2026-08-12'), title: 'Monthly Transit Pass Reimbursement', category: 'Commute', amount: 180, currency: 'USD', status: 'Paid' },
    { claimId: 'FRG-380', date: new Date('2026-07-28'), title: 'Ergonomic Home Office Setup Allowance', category: 'Equipment', amount: 250, currency: 'USD', status: 'Paid' },
  ],
});

// ========================= SERVICE FUNCTIONS =========================

// ---------- Financial Incentives ----------

export const financialIncentiveService = {
  async getByEmployee(employeeId: string, employeeName = 'Employee', department = 'General') {
    let record = await financialIncentiveRepo.findByEmployee(employeeId);
    if (!record) {
      record = (await financialIncentiveRepo.create(
        getDefaultFinancialIncentive(employeeId, employeeName, department)
      )) as any;
    }
    return record;
  },

  async list(page = 1, limit = 20, search?: string) {
    const filters: Record<string, unknown> = {};
    if (search) {
      filters['$or'] = [
        { employeeName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    return financialIncentiveRepo.findAll(filters, page, limit);
  },

  async upsert(employeeId: string, data: Partial<IFinancialIncentive>) {
    return financialIncentiveRepo.upsertByEmployee(employeeId, data);
  },

  async exerciseEsop(employeeId: string, trancheNumber: number) {
    const updated = await financialIncentiveRepo.exerciseEsopTranche(employeeId, trancheNumber);
    if (!updated) throw new Error('Tranche not found or not yet vested');
    return updated;
  },

  async updateBonusStatus(employeeId: string, bonusStatus: string) {
    const updated = await financialIncentiveRepo.updateBonusStatus(employeeId, bonusStatus);
    if (!updated) throw new Error('Financial incentive record not found');
    return updated;
  },

  async delete(employeeId: string) {
    return financialIncentiveRepo.deleteByEmployee(employeeId);
  },
};

// ---------- Employee Development ----------

export const employeeDevelopmentService = {
  async getByEmployee(employeeId: string, employeeName = 'Employee', department = 'General') {
    let record = await employeeDevelopmentRepo.findByEmployee(employeeId);
    if (!record) {
      record = (await employeeDevelopmentRepo.upsertByEmployee(
        employeeId,
        getDefaultEmployeeDevelopment(employeeId, employeeName, department)
      )) as any;
    }
    return record;
  },

  async list(page = 1, limit = 20, search?: string) {
    const filters: Record<string, unknown> = {};
    if (search) {
      filters['$or'] = [
        { employeeName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    return employeeDevelopmentRepo.findAll(filters, page, limit);
  },

  async upsert(employeeId: string, data: Partial<IEmployeeDevelopment>) {
    return employeeDevelopmentRepo.upsertByEmployee(employeeId, data);
  },

  async addProgram(employeeId: string, programData: object) {
    const updated = await employeeDevelopmentRepo.addLearningProgram(employeeId, programData);
    if (!updated) throw new Error('Employee development record not found');
    return updated;
  },

  async updateProgram(employeeId: string, programId: string, data: object) {
    const updated = await employeeDevelopmentRepo.updateLearningProgram(employeeId, programId, data);
    if (!updated) throw new Error('Program not found');
    return updated;
  },

  async deleteProgram(employeeId: string, programId: string) {
    return employeeDevelopmentRepo.deleteLearningProgram(employeeId, programId);
  },

  async addCertification(employeeId: string, certData: object) {
    const updated = await employeeDevelopmentRepo.addCertification(employeeId, certData);
    if (!updated) throw new Error('Employee development record not found');
    return updated;
  },

  async deleteCertification(employeeId: string, certId: string) {
    return employeeDevelopmentRepo.deleteCertification(employeeId, certId);
  },
};

// ---------- Health & Wellness ----------

export const healthWellnessService = {
  async getByEmployee(employeeId: string, employeeName = 'Employee', department = 'General') {
    let record = await healthWellnessRepo.findByEmployee(employeeId);
    if (!record) {
      record = (await healthWellnessRepo.upsertByEmployee(
        employeeId,
        getDefaultHealthWellness(employeeId, employeeName, department)
      )) as any;
    }
    return record;
  },

  async list(page = 1, limit = 20, search?: string) {
    const filters: Record<string, unknown> = {};
    if (search) {
      filters['$or'] = [
        { employeeName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    return healthWellnessRepo.findAll(filters, page, limit);
  },

  async upsert(employeeId: string, data: Partial<IHealthWellness>) {
    return healthWellnessRepo.upsertByEmployee(employeeId, data);
  },

  async submitClaim(employeeId: string, claimData: object) {
    const updated = await healthWellnessRepo.submitClaim(employeeId, claimData);
    if (!updated) throw new Error('Health wellness record not found for employee');
    return updated;
  },

  async updateClaimStatus(employeeId: string, claimId: string, status: string, notes?: string) {
    const updated = await healthWellnessRepo.updateClaimStatus(employeeId, claimId, status, notes);
    if (!updated) throw new Error('Claim not found');
    return updated;
  },

  async addDependent(employeeId: string, dependent: object) {
    const updated = await healthWellnessRepo.addDependent(employeeId, dependent);
    if (!updated) throw new Error('Health wellness record not found');
    return updated;
  },
};

// ---------- Workplace Life Balance ----------

export const workplaceLifeBalanceService = {
  async getByEmployee(employeeId: string, employeeName = 'Employee', department = 'General') {
    let record = await workplaceLifeBalanceRepo.findByEmployee(employeeId);
    if (!record) {
      record = (await workplaceLifeBalanceRepo.upsertByEmployee(
        employeeId,
        getDefaultWorkplaceLifeBalance(employeeId, employeeName, department)
      )) as any;
    }
    return record;
  },

  async list(page = 1, limit = 20, search?: string) {
    const filters: Record<string, unknown> = {};
    if (search) {
      filters['$or'] = [
        { employeeName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    return workplaceLifeBalanceRepo.findAll(filters, page, limit);
  },

  async upsert(employeeId: string, data: Partial<IWorkplaceLifeBalance>) {
    return workplaceLifeBalanceRepo.upsertByEmployee(employeeId, data);
  },

  async submitFringeClaim(employeeId: string, claimData: object) {
    const updated = await workplaceLifeBalanceRepo.submitFringeClaim(employeeId, claimData);
    if (!updated) throw new Error('Workplace life balance record not found for employee');
    return updated;
  },

  async updateFringeClaimStatus(employeeId: string, claimId: string, status: string) {
    const updated = await workplaceLifeBalanceRepo.updateFringeClaimStatus(employeeId, claimId, status);
    if (!updated) throw new Error('Fringe claim not found');
    return updated;
  },

  async registerFamilyEvent(employeeId: string, eventName: string) {
    const updated = await workplaceLifeBalanceRepo.registerFamilyEvent(employeeId, eventName);
    if (!updated) throw new Error('Workplace life balance record not found');
    return updated;
  },

  async applyChildCareStipend(employeeId: string) {
    const updated = await workplaceLifeBalanceRepo.applyChildCareStipend(employeeId);
    if (!updated) throw new Error('Workplace life balance record not found');
    return updated;
  },
};
