import {
  financialIncentiveRepo,
  employeeDevelopmentRepo,
  healthWellnessRepo,
  workplaceLifeBalanceRepo,
  wellnessStatsRepo,
} from './wellness.repository';
import {
  IFinancialIncentive,
  IEmployeeDevelopment,
  IHealthWellness,
  IWorkplaceLifeBalance,
  IWellnessStatsSummary,
} from './wellness.types';

// ========================= DEFAULT SEED DATA HELPERS =========================

const getDefaultFinancialIncentive = (employeeId: string, employeeName: string, department: string): Partial<IFinancialIncentive> => ({
  employeeId,
  employeeName,
  department,
  grantedEsopShares: 2500,
  grantPrice: 12.5,
  currentFMV: 42.5,
  grantDate: new Date('2023-10-15'),
  vestingSchedule: [
    { trancheNumber: 1, period: 'Tranche 1 (Year 1)', vestingDate: new Date('2024-10-15'), shares: 625, status: 'Vested' },
    { trancheNumber: 2, period: 'Tranche 2 (Year 2)', vestingDate: new Date('2025-10-15'), shares: 625, status: 'Vested' },
    { trancheNumber: 3, period: 'Tranche 3 (Year 3)', vestingDate: new Date('2026-10-15'), shares: 625, status: 'Granted' },
    { trancheNumber: 4, period: 'Tranche 4 (Year 4)', vestingDate: new Date('2027-10-15'), shares: 625, status: 'Granted' },
  ],
  exerciseHistory: [],
  bonusYear: new Date().getFullYear(),
  bonusMultiplier: 1.25,
  estimatedBonusAmount: 18500,
  bonusStatus: 'Approved',
  bonusTargetAchievement: 112,
  bonusPlans: [
    {
      id: 'BP-1',
      planName: 'Annual Executive Innovation & Retention Plan',
      bonusYear: new Date().getFullYear(),
      targetMetrics: 'Delivery of Next-Gen Architecture & 99.9% Uptime',
      targetAchievement: 112,
      bonusMultiplier: 1.25,
      estimatedBonusAmount: 18500,
      status: 'Approved',
      submittedAt: new Date(),
    },
  ],
  incentives: [
    { title: 'Project Milestone Alpha', target: '100% On-time delivery', reward: '$2,500 Spot Award', rewardAmount: 2500, status: 'Achieved', quarter: 'Q3-2026' },
    { title: 'Client Satisfaction Index', target: '> 95% CSAT Score', reward: '$1,500 Incentive', rewardAmount: 1500, status: 'In_Progress', quarter: 'Q3-2026' },
  ],
  financialLiteracySessionsAttended: 2,
  financialLiteracyPrograms: [
    {
      id: 'LIT-1',
      title: 'Personal Tax Planning & Deductions 2026',
      date: '2026-09-12',
      speaker: 'Senior Tax Consultant',
      category: 'Taxation & Deductions',
      topics: 'Capital gains, retirement allowances, deductions',
      registered: true,
      attended: true,
    },
    {
      id: 'LIT-2',
      title: 'Investment Strategies: 401(k) & Mutual Funds',
      date: '2026-09-24',
      speaker: 'Certified Wealth Planner',
      category: 'Wealth Management',
      topics: 'Index funds, diversification, risk management',
      registered: true,
      attended: true,
    },
    {
      id: 'LIT-3',
      title: 'Retirement Planning & Pension Optimization',
      date: '2026-10-15',
      speaker: 'Certified Financial Planner',
      category: 'Retirement',
      topics: 'Retirement accounts, post-career budgeting',
      registered: false,
      attended: false,
    },
  ],
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
    { title: 'Strategic Product Leadership & Team Management', provider: 'Huremaso Learning Hub', totalModules: 8, completedModules: 6, progressPercent: 75, status: 'In_Progress', trainingHours: 20 },
    { title: 'Advanced Cloud Security & Microservices Architecture', provider: 'Coursera Enterprise', totalModules: 10, completedModules: 4, progressPercent: 40, status: 'In_Progress', trainingHours: 28 },
  ],
  certifications: [
    { name: 'AWS Solutions Architect', issuingOrganization: 'Amazon Web Services', issuedDate: new Date('2024-03-15'), status: 'Active' },
    { name: 'Project Management Professional (PMP)', issuingOrganization: 'PMI', issuedDate: new Date('2023-11-20'), status: 'Active' },
  ],
  mentorName: 'David Vance',
  mentorId: 'EMP-009',
  mentorship: {
    mentorId: 'EMP-009',
    mentorName: 'David Vance',
    menteeId: employeeId,
    menteeName: employeeName,
    status: 'Active',
    objectives: 'Engineering leadership development, cross-functional collaboration, and technical system design.',
    durationMonths: 6,
    startDate: new Date('2026-06-01'),
    sessions: [
      {
        id: 'SES-1',
        sessionDate: '2026-07-15',
        time: '10:00 AM',
        topic: 'Engineering OKRs & Team Scalability',
        notes: 'Discussed architectural review boards and mentoring junior engineers.',
        feedback: 'Excellent engagement and thoughtful roadmap formulation.',
        completed: true,
      },
      {
        id: 'SES-2',
        sessionDate: '2026-08-20',
        time: '02:00 PM',
        topic: 'Stakeholder Communications & Executive Presence',
        notes: 'Review of quarterly engineering presentation to the board.',
        feedback: 'Clear progress on presentation structure.',
        completed: true,
      },
    ],
  },
  careerGoal: 'Senior Engineering Director',
  careerGoals: [
    {
      id: 'CG-1',
      title: 'Senior Engineering Director',
      targetDate: '2027-04-30',
      status: 'In Progress',
      milestones: [
        { id: 'M-1', title: 'Lead end-to-end architecture migration', completed: true, dueDate: '2026-09-30' },
        { id: 'M-2', title: 'Mentor 3 senior engineers into tech leads', completed: false, dueDate: '2026-12-15' },
        { id: 'M-3', title: 'Complete Executive Management Executive Certificate', completed: false, dueDate: '2027-03-15' },
      ],
      managerFeedback: 'Consistently demonstrates strong ownership and technical vision.',
      reviewDate: '2026-11-15',
    },
  ],
  nextReviewDate: new Date('2026-12-01'),
});

const getDefaultHealthWellness = (employeeId: string, employeeName: string, department: string): Partial<IHealthWellness> => ({
  employeeId,
  employeeName,
  department,
  groupInsurancePolicyNumber: `GHI-8849-2026`,
  groupInsuranceSumInsured: 50000,
  groupInsuranceCurrency: 'USD',
  groupInsuranceEffective: new Date('2026-01-01'),
  groupInsuranceExpiry: new Date('2027-01-01'),
  groupInsuranceStatus: 'Active',
  insuranceDependents: [
    { name: `${employeeName} (Self)`, relationship: 'Primary Insured', status: 'Covered', coveredDate: '2026-01-01' },
    { name: 'Michael Johnson', relationship: 'Spouse', status: 'Covered', coveredDate: '2026-01-01' },
    { name: 'Emma Johnson', relationship: 'Child', status: 'Covered', coveredDate: '2026-01-01' },
  ],
  annualReimbursementAllowance: 5000,
  healthClaims: [
    { claimId: 'CLM-901', date: new Date('2026-08-10'), type: 'Dental', description: 'Dental Cleaning & Preventive Care', amount: 150, currency: 'USD', status: 'Approved' },
    { claimId: 'CLM-882', date: new Date('2026-07-14'), type: 'Vision', description: 'Annual Optical Exam & Lenses', amount: 220, currency: 'USD', status: 'Paid' },
  ],
  eapSessionsAvailable: 12,
  eapSessionsUsed: 2,
  mindfulnessAppAccess: true,
  counsellingAppointments: [
    {
      id: 'COUN-1',
      counsellorName: 'Dr. Helen Carter (Licensed EAP Specialist)',
      appointmentDate: '2026-09-08',
      appointmentTime: '11:00 AM',
      topic: 'Workplace Stress Management & Focus Techniques',
      status: 'Completed',
    },
  ],
  fitnessChallengeName: 'Corporate 100,000 Step Monthly Challenge',
  fitnessChallengeStepsGoal: 100000,
  fitnessChallengeCurrentSteps: 78400,
  fitnessChallengeRank: 14,
  fitnessChallengeStatus: 'Active',
  fitnessActivities: [
    { id: 'FIT-1', activityName: 'Morning Cardio Run', date: '2026-08-25', durationMinutes: 45, stepsCount: 6500, caloriesBurned: 380 },
    { id: 'FIT-2', activityName: 'Weekend Mountain Trail Hike', date: '2026-08-28', durationMinutes: 90, stepsCount: 12400, caloriesBurned: 720 },
  ],
  fitnessRewardPoints: 784,
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
  scheduleChangeRequests: [
    {
      id: 'FLEX-1',
      requestedSchedule: 'Hybrid',
      officeDays: 3,
      remoteDays: 2,
      coreHours: '09:00 - 17:00',
      reason: 'Standard hybrid agreement renewal for Q3/Q4.',
      status: 'Approved',
      requestDate: '2026-07-01',
      reviewedAt: '2026-07-03',
    },
  ],
  sabbaticalLeaveWeeks: 4,
  wellnessDaysTotal: 5,
  wellnessDaysUsed: 1,
  parentalLeaveWeeks: 16,
  paidLeaveRequests: [
    {
      id: 'LV-1',
      leaveType: 'Wellness Day',
      startDate: '2026-07-24',
      endDate: '2026-07-24',
      daysCount: 1,
      reason: 'Personal mental recharge and wellness day.',
      status: 'Approved',
    },
  ],
  childCareStipendMonthly: 400,
  childCareStipendCurrency: 'USD',
  childCareStipendActive: true,
  childCareRequests: [
    {
      id: 'CC-1',
      childName: 'Emma Johnson',
      childAge: 4,
      facilityName: 'Bright Horizons Early Education Center',
      requestedMonthlyStipend: 400,
      status: 'Enrolled',
    },
  ],
  dormitoryAccessActive: true,
  accommodationRequests: [
    {
      id: 'ACC-1',
      facilityName: 'Corporate Tech Campus Residences - Tower B',
      roomType: 'Single Studio',
      checkInDate: '2026-10-01',
      checkOutDate: '2026-10-14',
      reason: 'On-site presence during major cloud infrastructure cutover.',
      status: 'Allocated',
      allocatedRoomNumber: 'Studio 402',
    },
  ],
  familyEventsRegistered: ['Annual Family Sports & Picnic Day 2026'],
  familyEvents: [
    {
      id: 'FE-1',
      title: 'Annual Family Sports & Picnic Day 2026',
      date: '2026-09-19',
      location: 'Riverside Community Park & Pavilion',
      description: 'Outdoor corporate gathering with children activities, sports tournaments, and barbecue.',
      registered: true,
      attendeesCount: 4,
    },
    {
      id: 'FE-2',
      title: 'Bring Your Kids to Work Day & Tech Fair',
      date: '2026-10-24',
      location: 'Corporate HQ Main Atrium & Lab',
      description: 'Hands-on robotics workshops, coding games, and office tours for employee children.',
      registered: false,
      attendeesCount: 0,
    },
  ],
  familySupportRequests: [],
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

  async createEsopGrant(
    employeeId: string,
    totalShares: number,
    grantPrice: number,
    currentFMV: number,
    tranchesCount = 4,
    grantDate?: string
  ) {
    return financialIncentiveRepo.createEsopGrant(
      employeeId,
      totalShares,
      grantPrice,
      currentFMV,
      tranchesCount,
      grantDate
    );
  },

  async exerciseEsop(employeeId: string, trancheNumber: number) {
    const updated = await financialIncentiveRepo.exerciseEsopTranche(employeeId, trancheNumber);
    if (!updated) throw new Error('Tranche not found, already exercised, or not yet vested');
    return updated;
  },

  async updateBonusStatus(employeeId: string, bonusStatus: string) {
    const updated = await financialIncentiveRepo.updateBonusStatus(employeeId, bonusStatus);
    if (!updated) throw new Error('Financial incentive record not found');
    return updated;
  },

  async addBonusPlan(employeeId: string, planData: any) {
    return financialIncentiveRepo.addBonusPlan(employeeId, planData);
  },

  async updateBonusPlanStatus(employeeId: string, planId: string, status: string, notes?: string) {
    const updated = await financialIncentiveRepo.updateBonusPlanStatus(employeeId, planId, status, notes);
    if (!updated) throw new Error('Bonus plan not found');
    return updated;
  },

  async addIncentiveRecord(employeeId: string, incentiveData: any) {
    return financialIncentiveRepo.addIncentiveRecord(employeeId, incentiveData);
  },

  async updateIncentiveStatus(employeeId: string, incentiveId: string, status: string) {
    const updated = await financialIncentiveRepo.updateIncentiveStatus(employeeId, incentiveId, status);
    if (!updated) throw new Error('Incentive record not found');
    return updated;
  },

  async addLiteracyProgram(employeeId: string, programData: any) {
    return financialIncentiveRepo.addLiteracyProgram(employeeId, programData);
  },

  async enrollLiteracyProgram(employeeId: string, programId: string) {
    const updated = await financialIncentiveRepo.enrollLiteracyProgram(employeeId, programId);
    if (!updated) throw new Error('Literacy program not found');
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

  async updateCertification(employeeId: string, certId: string, updateData: object) {
    const updated = await employeeDevelopmentRepo.updateCertification(employeeId, certId, updateData);
    if (!updated) throw new Error('Certification not found');
    return updated;
  },

  async deleteCertification(employeeId: string, certId: string) {
    return employeeDevelopmentRepo.deleteCertification(employeeId, certId);
  },

  async requestMentorship(employeeId: string, mentorshipData: any) {
    return employeeDevelopmentRepo.requestMentorship(employeeId, mentorshipData);
  },

  async addMentorshipSession(employeeId: string, sessionData: any) {
    return employeeDevelopmentRepo.addMentorshipSession(employeeId, sessionData);
  },

  async updateMentorshipStatus(employeeId: string, status: string, feedback?: string) {
    return employeeDevelopmentRepo.updateMentorshipStatus(employeeId, status, feedback);
  },

  async addCareerGoal(employeeId: string, goalData: any) {
    return employeeDevelopmentRepo.addCareerGoal(employeeId, goalData);
  },

  async updateCareerGoal(employeeId: string, goalId: string, updateData: any) {
    return employeeDevelopmentRepo.updateCareerGoal(employeeId, goalId, updateData);
  },

  async deleteCareerGoal(employeeId: string, goalId: string) {
    return employeeDevelopmentRepo.deleteCareerGoal(employeeId, goalId);
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

  async updateClaimStatus(employeeId: string, claimId: string, status: string, notes?: string, rejectionReason?: string) {
    const updated = await healthWellnessRepo.updateClaimStatus(employeeId, claimId, status, notes, rejectionReason);
    if (!updated) throw new Error('Claim not found');
    return updated;
  },

  async addDependent(employeeId: string, dependent: object) {
    const updated = await healthWellnessRepo.addDependent(employeeId, dependent);
    if (!updated) throw new Error('Health wellness record not found');
    return updated;
  },

  async updateDependent(employeeId: string, dependentId: string, update: object) {
    const updated = await healthWellnessRepo.updateDependent(employeeId, dependentId, update);
    if (!updated) throw new Error('Dependent not found');
    return updated;
  },

  async removeDependent(employeeId: string, dependentId: string) {
    return healthWellnessRepo.removeDependent(employeeId, dependentId);
  },

  async bookCounselling(employeeId: string, apptData: any) {
    return healthWellnessRepo.bookCounselling(employeeId, apptData);
  },

  async cancelCounselling(employeeId: string, appointmentId: string) {
    return healthWellnessRepo.cancelCounselling(employeeId, appointmentId);
  },

  async logFitnessActivity(employeeId: string, activityData: any) {
    return healthWellnessRepo.logFitnessActivity(employeeId, activityData);
  },

  async enrollFitnessChallenge(employeeId: string, challengeName: string, stepsGoal: number) {
    return healthWellnessRepo.enrollFitnessChallenge(employeeId, challengeName, stepsGoal);
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

  async requestScheduleChange(employeeId: string, reqData: any) {
    return workplaceLifeBalanceRepo.requestScheduleChange(employeeId, reqData);
  },

  async reviewScheduleChange(employeeId: string, requestId: string, status: 'Approved' | 'Rejected') {
    const updated = await workplaceLifeBalanceRepo.reviewScheduleChange(employeeId, requestId, status);
    if (!updated) throw new Error('Schedule change request not found');
    return updated;
  },

  async requestPaidLeave(employeeId: string, leaveData: any) {
    return workplaceLifeBalanceRepo.requestPaidLeave(employeeId, leaveData);
  },

  async reviewPaidLeave(employeeId: string, leaveId: string, status: string, rejectionReason?: string) {
    const updated = await workplaceLifeBalanceRepo.reviewPaidLeave(employeeId, leaveId, status, rejectionReason);
    if (!updated) throw new Error('Paid leave request not found');
    return updated;
  },

  async requestAccommodation(employeeId: string, reqData: any) {
    return workplaceLifeBalanceRepo.requestAccommodation(employeeId, reqData);
  },

  async reviewAccommodation(employeeId: string, requestId: string, status: string, allocatedRoomNumber?: string) {
    const updated = await workplaceLifeBalanceRepo.reviewAccommodation(employeeId, requestId, status, allocatedRoomNumber);
    if (!updated) throw new Error('Accommodation request not found');
    return updated;
  },

  async requestChildCare(employeeId: string, reqData: any) {
    return workplaceLifeBalanceRepo.requestChildCare(employeeId, reqData);
  },

  async reviewChildCare(employeeId: string, requestId: string, status: string) {
    const updated = await workplaceLifeBalanceRepo.reviewChildCare(employeeId, requestId, status);
    if (!updated) throw new Error('Child care request not found');
    return updated;
  },

  async createFamilyEvent(employeeId: string, eventData: any) {
    return workplaceLifeBalanceRepo.createFamilyEvent(employeeId, eventData);
  },

  async registerFamilyEvent(employeeId: string, eventIdOrTitle: string) {
    return workplaceLifeBalanceRepo.registerFamilyEvent(employeeId, eventIdOrTitle);
  },

  async requestFamilySupport(employeeId: string, supportData: any) {
    return workplaceLifeBalanceRepo.requestFamilySupport(employeeId, supportData);
  },

  async submitFringeClaim(employeeId: string, claimData: object) {
    const updated = await workplaceLifeBalanceRepo.submitFringeClaim(employeeId, claimData);
    if (!updated) throw new Error('Workplace life balance record not found for employee');
    return updated;
  },

  async updateFringeClaimStatus(employeeId: string, claimId: string, status: string, rejectionReason?: string) {
    const updated = await workplaceLifeBalanceRepo.updateFringeClaimStatus(employeeId, claimId, status, rejectionReason);
    if (!updated) throw new Error('Fringe claim not found');
    return updated;
  },

  async applyChildCareStipend(employeeId: string) {
    const updated = await workplaceLifeBalanceRepo.applyChildCareStipend(employeeId);
    if (!updated) throw new Error('Workplace life balance record not found');
    return updated;
  },
};

// ---------- Aggregated Summary Stats ----------

export const wellnessStatsService = {
  async getSummaryStats(employeeId?: string): Promise<IWellnessStatsSummary> {
    return wellnessStatsRepo.getSummaryStats(employeeId);
  },
};
