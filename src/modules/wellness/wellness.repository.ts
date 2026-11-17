import { FilterQuery, Types } from 'mongoose';
import {
  FinancialIncentiveModel,
  EmployeeDevelopmentModel,
  HealthWellnessModel,
  WorkplaceLifeBalanceModel,
} from './wellness.model';
import {
  IFinancialIncentive,
  IEmployeeDevelopment,
  IHealthWellness,
  IWorkplaceLifeBalance,
  IHealthClaim,
  IFringeClaim,
  IWellnessStatsSummary,
} from './wellness.types';

// ========================= FINANCIAL INCENTIVES =========================

export const financialIncentiveRepo = {
  async findByEmployee(employeeId: string) {
    return FinancialIncentiveModel.findOne({ employeeId }).lean();
  },

  async findAll(filters: FilterQuery<IFinancialIncentive> = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FinancialIncentiveModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      FinancialIncentiveModel.countDocuments(filters),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async create(data: Partial<IFinancialIncentive>) {
    const doc = new FinancialIncentiveModel(data);
    return doc.save();
  },

  async upsertByEmployee(employeeId: string, data: Partial<IFinancialIncentive>) {
    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );
  },

  async createEsopGrant(
    employeeId: string,
    totalGrantedShares: number,
    grantPrice: number,
    currentFMV: number,
    tranchesCount = 4,
    grantDate?: string
  ) {
    const gDate = grantDate ? new Date(grantDate) : new Date();
    const sharesPerTranche = Math.floor(totalGrantedShares / tranchesCount);
    const remainder = totalGrantedShares % tranchesCount;

    const vestingSchedule = [];
    for (let i = 1; i <= tranchesCount; i++) {
      const vDate = new Date(gDate);
      vDate.setFullYear(vDate.getFullYear() + i);
      const isPast = vDate <= new Date();

      vestingSchedule.push({
        trancheNumber: i,
        period: `Tranche ${i} (Year ${i})`,
        vestingDate: vDate,
        shares: i === tranchesCount ? sharesPerTranche + remainder : sharesPerTranche,
        status: isPast ? 'Vested' : 'Granted',
      });
    }

    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId },
      {
        $set: {
          grantedEsopShares: totalGrantedShares,
          grantPrice,
          currentFMV,
          grantDate: gDate,
          vestingSchedule,
        },
      },
      { new: true, upsert: true }
    );
  },

  async exerciseEsopTranche(employeeId: string, trancheNumber: number) {
    const record = await FinancialIncentiveModel.findOne({ employeeId });
    if (!record) return null;

    const tranche = record.vestingSchedule.find(
      (t) => t.trancheNumber === trancheNumber && t.status === 'Vested'
    );
    if (!tranche) return null;

    const exerciseRecord = {
      id: `EX-${Date.now()}-${trancheNumber}`,
      trancheNumber,
      shares: tranche.shares,
      grantPrice: record.grantPrice,
      exercisePrice: record.grantPrice,
      exercisedAt: new Date(),
      totalCost: tranche.shares * record.grantPrice,
      estimatedValue: tranche.shares * record.currentFMV,
    };

    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId, 'vestingSchedule.trancheNumber': trancheNumber, 'vestingSchedule.status': 'Vested' },
      {
        $set: {
          'vestingSchedule.$.status': 'Exercised',
          'vestingSchedule.$.exercisedAt': new Date(),
        },
        $push: {
          exerciseHistory: exerciseRecord,
        },
      },
      { new: true }
    );
  },

  async updateBonusStatus(employeeId: string, bonusStatus: string) {
    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId },
      { $set: { bonusStatus } },
      { new: true }
    );
  },

  async addBonusPlan(employeeId: string, planData: any) {
    const plan = {
      ...planData,
      id: `BP-${Date.now()}`,
      submittedAt: new Date(),
    };
    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId },
      {
        $push: { bonusPlans: plan },
        $set: {
          bonusYear: plan.bonusYear || new Date().getFullYear(),
          bonusMultiplier: plan.bonusMultiplier || 1.0,
          estimatedBonusAmount: plan.estimatedBonusAmount || 0,
          bonusStatus: plan.status || 'Pending Approval',
          bonusTargetAchievement: plan.targetAchievement || 100,
        },
      },
      { new: true }
    );
  },

  async updateBonusPlanStatus(employeeId: string, planId: string, status: string, notes?: string) {
    const doc = await FinancialIncentiveModel.findOne({ employeeId });
    if (!doc) return null;
    const plan = doc.bonusPlans?.find((p: any) => p.id === planId || p._id?.toString() === planId);
    if (plan) {
      plan.status = status as any;
      doc.bonusStatus = status as any;
      if (status === 'Approved' || status === 'Paid') {
        plan.approvedAt = new Date();
      }
      if (notes) plan.notes = notes;
      doc.markModified('bonusPlans');
      return doc.save();
    }
    return doc;
  },

  async addIncentiveRecord(employeeId: string, incentive: any) {
    const record = {
      ...incentive,
      id: `INC-${Date.now()}`,
      status: incentive.status || 'Active',
    };
    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId },
      { $push: { incentives: record } },
      { new: true }
    );
  },

  async updateIncentiveStatus(employeeId: string, incentiveId: string, status: string) {
    const doc = await FinancialIncentiveModel.findOne({ employeeId });
    if (!doc) return null;
    const inc = doc.incentives?.find((i: any) => i.id === incentiveId || i._id?.toString() === incentiveId);
    if (inc) {
      inc.status = status as any;
      if (status === 'Achieved') inc.achievedAt = new Date();
      if (status === 'Approved') inc.approvedAt = new Date();
      doc.markModified('incentives');
      return doc.save();
    }
    return doc;
  },

  async addLiteracyProgram(employeeId: string, programData: any) {
    const prog = {
      ...programData,
      id: `LIT-${Date.now()}`,
      registered: false,
      attended: false,
    };
    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId },
      { $push: { financialLiteracyPrograms: prog } },
      { new: true }
    );
  },

  async enrollLiteracyProgram(employeeId: string, programId: string) {
    const doc = await FinancialIncentiveModel.findOne({ employeeId });
    if (!doc) return null;
    const prog = doc.financialLiteracyPrograms?.find((p: any) => p.id === programId || p._id?.toString() === programId);
    if (prog) {
      prog.registered = true;
      prog.completionDate = new Date();
      doc.financialLiteracySessionsAttended = (doc.financialLiteracySessionsAttended || 0) + 1;
      doc.markModified('financialLiteracyPrograms');
      return doc.save();
    }
    return doc;
  },

  async deleteByEmployee(employeeId: string) {
    return FinancialIncentiveModel.findOneAndDelete({ employeeId });
  },
};

// ========================= EMPLOYEE DEVELOPMENT =========================

export const employeeDevelopmentRepo = {
  async findByEmployee(employeeId: string) {
    return EmployeeDevelopmentModel.findOne({ employeeId }).lean();
  },

  async findAll(filters: FilterQuery<IEmployeeDevelopment> = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      EmployeeDevelopmentModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      EmployeeDevelopmentModel.countDocuments(filters),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async upsertByEmployee(employeeId: string, data: Partial<IEmployeeDevelopment>) {
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );
  },

  async addLearningProgram(employeeId: string, program: any) {
    const prog = {
      ...program,
      id: `LP-${Date.now()}`,
      trainingHours: program.trainingHours || 10,
    };
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      {
        $push: { learningPrograms: prog },
        $inc: { completedTrainingHours: prog.trainingHours || 0 },
      },
      { new: true }
    );
  },

  async updateLearningProgram(employeeId: string, programId: string, update: any) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    const prog = doc.learningPrograms?.find((p: any) => p.id === programId || p._id?.toString() === programId);
    if (prog) {
      Object.assign(prog, update);
      if (update.status === 'Completed') {
        prog.completionDate = new Date();
      }
      doc.markModified('learningPrograms');
      return doc.save();
    }
    return doc;
  },

  async deleteLearningProgram(employeeId: string, programId: string) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    doc.learningPrograms = (doc.learningPrograms || []).filter(
      (p: any) => p.id !== programId && p._id?.toString() !== programId
    );
    doc.markModified('learningPrograms');
    return doc.save();
  },

  async addCertification(employeeId: string, cert: any) {
    const c = {
      ...cert,
      id: `CRT-${Date.now()}`,
      status: cert.status || 'Active',
    };
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $push: { certifications: c } },
      { new: true }
    );
  },

  async updateCertification(employeeId: string, certId: string, update: any) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    const cert = doc.certifications?.find((c: any) => c.id === certId || c._id?.toString() === certId);
    if (cert) {
      Object.assign(cert, update);
      doc.markModified('certifications');
      return doc.save();
    }
    return doc;
  },

  async deleteCertification(employeeId: string, certId: string) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    doc.certifications = (doc.certifications || []).filter(
      (c: any) => c.id !== certId && c._id?.toString() !== certId
    );
    doc.markModified('certifications');
    return doc.save();
  },

  async requestMentorship(employeeId: string, mentorshipData: any) {
    const ment = {
      ...mentorshipData,
      status: 'Active',
      startDate: new Date(),
      sessions: [
        {
          id: `SES-1`,
          sessionDate: new Date().toISOString().slice(0, 10),
          topic: 'Initial Career Alignment & Goals Discussion',
          notes: 'Discussed key development areas, leadership milestones, and quarterly targets.',
          completed: true,
        },
      ],
    };
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      {
        $set: {
          mentorName: mentorshipData.mentorName,
          mentorship: ment,
        },
      },
      { new: true }
    );
  },

  async addMentorshipSession(employeeId: string, sessionData: any) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    if (!doc.mentorship) {
      doc.mentorship = {
        mentorName: 'Assigned Mentor',
        status: 'Active',
        objectives: 'Leadership & technical growth',
        durationMonths: 6,
        sessions: [],
      };
    }
    const sess = {
      ...sessionData,
      id: `SES-${Date.now()}`,
      completed: sessionData.completed ?? true,
    };
    if (!doc.mentorship.sessions) doc.mentorship.sessions = [];
    doc.mentorship.sessions.push(sess);
    doc.markModified('mentorship');
    return doc.save();
  },

  async updateMentorshipStatus(employeeId: string, status: string, feedback?: string) {
    const updateObj: Record<string, unknown> = {
      'mentorship.status': status,
    };
    if (feedback) updateObj['mentorship.mentorFeedback'] = feedback;
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $set: updateObj },
      { new: true }
    );
  },

  async addCareerGoal(employeeId: string, goalData: any) {
    const goal = {
      ...goalData,
      id: `CG-${Date.now()}`,
      status: goalData.status || 'In Progress',
    };
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      {
        $push: { careerGoals: goal },
        $set: { careerGoal: goal.title },
      },
      { new: true }
    );
  },

  async updateCareerGoal(employeeId: string, goalId: string, update: any) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    const goal = doc.careerGoals?.find((g: any) => g.id === goalId || g._id?.toString() === goalId);
    if (goal) {
      Object.assign(goal, update);
      doc.markModified('careerGoals');
      return doc.save();
    }
    return doc;
  },

  async deleteCareerGoal(employeeId: string, goalId: string) {
    const doc = await EmployeeDevelopmentModel.findOne({ employeeId });
    if (!doc) return null;
    doc.careerGoals = (doc.careerGoals || []).filter(
      (g: any) => g.id !== goalId && g._id?.toString() !== goalId
    );
    doc.markModified('careerGoals');
    return doc.save();
  },
};

// ========================= HEALTH & WELLNESS =========================

const generateClaimId = () => {
  const prefix = 'CLM';
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${num}`;
};

export const healthWellnessRepo = {
  async findByEmployee(employeeId: string) {
    return HealthWellnessModel.findOne({ employeeId }).lean();
  },

  async findAll(filters: FilterQuery<IHealthWellness> = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      HealthWellnessModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      HealthWellnessModel.countDocuments(filters),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async upsertByEmployee(employeeId: string, data: Partial<IHealthWellness>) {
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );
  },

  async submitClaim(employeeId: string, claimData: Partial<IHealthClaim>) {
    const claimId = claimData.claimId || generateClaimId();
    const claim = {
      ...claimData,
      claimId,
      date: claimData.date || new Date(),
      status: claimData.status || 'Submitted',
    };
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      { $push: { healthClaims: claim } },
      { new: true }
    );
  },

  async updateClaimStatus(employeeId: string, claimId: string, status: string, notes?: string, rejectionReason?: string) {
    const update: Record<string, unknown> = {
      'healthClaims.$.status': status,
    };
    if (notes) update['healthClaims.$.notes'] = notes;
    if (rejectionReason) update['healthClaims.$.rejectionReason'] = rejectionReason;
    if (status === 'Reimbursed' || status === 'Approved' || status === 'Paid') {
      update['healthClaims.$.processedAt'] = new Date();
    }
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId, 'healthClaims.claimId': claimId },
      { $set: update },
      { new: true }
    );
  },

  async addDependent(employeeId: string, dependent: any) {
    const dep = {
      ...dependent,
      id: `DEP-${Date.now()}`,
      status: dependent.status || 'Covered',
      coveredDate: new Date().toISOString().slice(0, 10),
    };
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      { $push: { insuranceDependents: dep } },
      { new: true }
    );
  },

  async updateDependent(employeeId: string, dependentId: string, update: any) {
    const doc = await HealthWellnessModel.findOne({ employeeId });
    if (!doc) return null;
    const dep = doc.insuranceDependents?.find((d: any) => d.id === dependentId || d._id?.toString() === dependentId);
    if (dep) {
      Object.assign(dep, update);
      doc.markModified('insuranceDependents');
      return doc.save();
    }
    return doc;
  },

  async removeDependent(employeeId: string, dependentId: string) {
    const doc = await HealthWellnessModel.findOne({ employeeId });
    if (!doc) return null;
    doc.insuranceDependents = (doc.insuranceDependents || []).filter(
      (d: any) => d.id !== dependentId && d._id?.toString() !== dependentId
    );
    doc.markModified('insuranceDependents');
    return doc.save();
  },

  async bookCounselling(employeeId: string, apptData: any) {
    const appt = {
      ...apptData,
      id: `COUN-${Date.now()}`,
      status: 'Scheduled',
    };
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      {
        $push: { counsellingAppointments: appt },
        $inc: { eapSessionsUsed: 1 },
      },
      { new: true }
    );
  },

  async cancelCounselling(employeeId: string, appointmentId: string) {
    const doc = await HealthWellnessModel.findOne({ employeeId });
    if (!doc) return null;
    const appt = doc.counsellingAppointments?.find((a: any) => a.id === appointmentId || a._id?.toString() === appointmentId);
    if (appt) {
      appt.status = 'Cancelled';
      doc.eapSessionsUsed = Math.max((doc.eapSessionsUsed || 1) - 1, 0);
      doc.markModified('counsellingAppointments');
      return doc.save();
    }
    return doc;
  },

  async logFitnessActivity(employeeId: string, activityData: any) {
    const act = {
      ...activityData,
      id: `FIT-${Date.now()}`,
    };
    const stepsToAdd = Number(activityData.stepsCount) || 0;
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      {
        $push: { fitnessActivities: act },
        $inc: {
          fitnessChallengeCurrentSteps: stepsToAdd,
          fitnessRewardPoints: Math.round(stepsToAdd / 100),
        },
      },
      { new: true }
    );
  },

  async enrollFitnessChallenge(employeeId: string, challengeName: string, stepsGoal: number) {
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      {
        $set: {
          fitnessChallengeName: challengeName,
          fitnessChallengeStepsGoal: stepsGoal,
          fitnessChallengeStatus: 'Active',
        },
      },
      { new: true }
    );
  },
};

// ========================= WORKPLACE LIFE BALANCE =========================

const generateFringeClaimId = () => {
  const prefix = 'FRG';
  const num = Math.floor(Math.random() * 9000) + 100;
  return `${prefix}-${num}`;
};

export const workplaceLifeBalanceRepo = {
  async findByEmployee(employeeId: string) {
    return WorkplaceLifeBalanceModel.findOne({ employeeId }).lean();
  },

  async findAll(filters: FilterQuery<IWorkplaceLifeBalance> = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      WorkplaceLifeBalanceModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      WorkplaceLifeBalanceModel.countDocuments(filters),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async upsertByEmployee(employeeId: string, data: Partial<IWorkplaceLifeBalance>) {
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );
  },

  async requestScheduleChange(employeeId: string, requestData: any) {
    const req = {
      ...requestData,
      id: `FLEX-${Date.now()}`,
      status: 'Pending',
      requestDate: new Date().toISOString().slice(0, 10),
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { scheduleChangeRequests: req } },
      { new: true }
    );
  },

  async reviewScheduleChange(employeeId: string, requestId: string, status: 'Approved' | 'Rejected') {
    const doc = await WorkplaceLifeBalanceModel.findOne({ employeeId });
    if (!doc) return null;

    const reqItem = (doc.scheduleChangeRequests || []).find(
      (r: any) => String(r._id) === requestId || r.id === requestId
    );
    if (reqItem) {
      reqItem.status = status;
      reqItem.reviewedAt = new Date().toISOString().slice(0, 10);
      if (status === 'Approved') {
        doc.workScheduleType = reqItem.requestedSchedule;
        doc.officeDaysPerWeek = reqItem.officeDays || 3;
      }
      doc.markModified('scheduleChangeRequests');
      return doc.save();
    }
    return doc;
  },

  async requestPaidLeave(employeeId: string, leaveData: any) {
    const req = {
      ...leaveData,
      id: `LV-${Date.now()}`,
      status: 'Pending',
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { paidLeaveRequests: req } },
      { new: true }
    );
  },

  async reviewPaidLeave(employeeId: string, leaveId: string, status: string, rejectionReason?: string) {
    const doc = await WorkplaceLifeBalanceModel.findOne({ employeeId });
    if (!doc) return null;

    const reqItem = (doc.paidLeaveRequests || []).find(
      (l: any) => String(l._id) === leaveId || l.id === leaveId
    );
    if (reqItem) {
      reqItem.status = status as any;
      if (rejectionReason) reqItem.rejectionReason = rejectionReason;
      if (status === 'Approved' && reqItem.leaveType === 'Wellness Day') {
        doc.wellnessDaysUsed = (doc.wellnessDaysUsed || 0) + (reqItem.daysCount || 1);
      }
      doc.markModified('paidLeaveRequests');
      return doc.save();
    }
    return doc;
  },

  async requestAccommodation(employeeId: string, reqData: any) {
    const req = {
      ...reqData,
      id: `ACC-${Date.now()}`,
      status: 'Pending',
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { accommodationRequests: req } },
      { new: true }
    );
  },

  async reviewAccommodation(employeeId: string, requestId: string, status: string, allocatedRoomNumber?: string) {
    const doc = await WorkplaceLifeBalanceModel.findOne({ employeeId });
    if (!doc) return null;

    const reqItem = (doc.accommodationRequests || []).find(
      (a: any) => String(a._id) === requestId || a.id === requestId
    );
    if (reqItem) {
      reqItem.status = status as any;
      if (allocatedRoomNumber) reqItem.allocatedRoomNumber = allocatedRoomNumber;
      if (status === 'Allocated') doc.dormitoryAccessActive = true;
      doc.markModified('accommodationRequests');
      return doc.save();
    }
    return doc;
  },

  async requestChildCare(employeeId: string, reqData: any) {
    const req = {
      ...reqData,
      id: `CC-${Date.now()}`,
      status: 'Pending',
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { childCareRequests: req } },
      { new: true }
    );
  },

  async reviewChildCare(employeeId: string, requestId: string, status: string) {
    const doc = await WorkplaceLifeBalanceModel.findOne({ employeeId });
    if (!doc) return null;

    const reqItem = (doc.childCareRequests || []).find(
      (c: any) => String(c._id) === requestId || c.id === requestId
    );
    if (reqItem) {
      reqItem.status = status as any;
      if (status === 'Enrolled' || status === 'Approved') doc.childCareStipendActive = true;
      doc.markModified('childCareRequests');
      return doc.save();
    }
    return doc;
  },

  async createFamilyEvent(employeeId: string, eventData: any) {
    const ev = {
      ...eventData,
      id: `FE-${Date.now()}`,
      registered: false,
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { familyEvents: ev } },
      { new: true }
    );
  },

  async registerFamilyEvent(employeeId: string, eventIdOrTitle: string) {
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      {
        $addToSet: { familyEventsRegistered: eventIdOrTitle },
      },
      { new: true }
    );
  },

  async requestFamilySupport(employeeId: string, supportData: any) {
    const req = {
      ...supportData,
      id: `FS-${Date.now()}`,
      status: 'Submitted',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { familySupportRequests: req } },
      { new: true }
    );
  },

  async submitFringeClaim(employeeId: string, claimData: Partial<IFringeClaim>) {
    const claimId = claimData.claimId || generateFringeClaimId();
    const claim = {
      ...claimData,
      claimId,
      date: claimData.date || new Date(),
      status: claimData.status || 'Pending',
    };
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $push: { fringeClaims: claim } },
      { new: true }
    );
  },

  async updateFringeClaimStatus(employeeId: string, claimId: string, status: string, rejectionReason?: string) {
    const updateObj: Record<string, unknown> = {
      'fringeClaims.$.status': status,
    };
    if (rejectionReason) updateObj['fringeClaims.$.rejectionReason'] = rejectionReason;

    const res = await WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId, 'fringeClaims.claimId': claimId },
      { $set: updateObj },
      { new: true }
    );

    // If paid or approved, update YTD reimbursed
    if (status === 'Paid' && res) {
      const claim = res.fringeClaims?.find((c: any) => c.claimId === claimId);
      if (claim) {
        await WorkplaceLifeBalanceModel.findOneAndUpdate(
          { employeeId },
          { $inc: { fringeTotalYTDReimbursed: claim.amount || 0 } }
        );
      }
    }

    return res;
  },

  async applyChildCareStipend(employeeId: string) {
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $set: { childCareStipendActive: true } },
      { new: true }
    );
  },
};

// ========================= AGGREGATED STATS =========================

export const wellnessStatsRepo = {
  async getSummaryStats(employeeId?: string): Promise<IWellnessStatsSummary> {
    const filter = employeeId ? { employeeId } : {};

    const [fiList, devList, hwList, wbList] = await Promise.all([
      FinancialIncentiveModel.find(filter).lean(),
      EmployeeDevelopmentModel.find(filter).lean(),
      HealthWellnessModel.find(filter).lean(),
      WorkplaceLifeBalanceModel.find(filter).lean(),
    ]);

    // Financial
    const totalGrantedEsopShares = fiList.reduce((acc, f) => acc + (f.grantedEsopShares || 0), 0);
    const totalVestedShares = fiList.reduce((acc, f) => {
      const vestedInSchedule = (f.vestingSchedule || [])
        .filter((t) => t.status === 'Vested' || t.status === 'Exercised')
        .reduce((s, t) => s + (t.shares || 0), 0);
      return acc + vestedInSchedule;
    }, 0);
    const totalPortfolioValue = fiList.reduce(
      (acc, f) => acc + (f.grantedEsopShares || 0) * (f.currentFMV || 0),
      0
    );
    const totalBonusAmount = fiList.reduce((acc, f) => acc + (f.estimatedBonusAmount || 0), 0);
    const activeIncentivesCount = fiList.reduce(
      (acc, f) => acc + (f.incentives || []).filter((i) => i.status === 'Active' || i.status === 'In_Progress').length,
      0
    );

    // Development
    const totalCompletedTrainingHours = devList.reduce((acc, d) => acc + (d.completedTrainingHours || 0), 0);
    const totalActiveCertifications = devList.reduce(
      (acc, d) => acc + (d.certifications || []).filter((c) => c.status === 'Active').length,
      0
    );
    const learningAllowanceBalance = devList.reduce((acc, d) => acc + (d.learningAllowanceBalance || 0), 0);
    const enrolledProgramsCount = devList.reduce((acc, d) => acc + (d.learningPrograms || []).length, 0);
    const completedProgramsCount = devList.reduce(
      (acc, d) => acc + (d.learningPrograms || []).filter((p) => p.status === 'Completed').length,
      0
    );
    const completionRate =
      enrolledProgramsCount > 0 ? Math.round((completedProgramsCount / enrolledProgramsCount) * 100) : 0;

    // Health
    const activeInsurancePoliciesCount = hwList.filter((h) => h.groupInsurancePolicyNumber).length;
    const coveredDependentsCount = hwList.reduce(
      (acc, h) => acc + (h.insuranceDependents || []).filter((d) => d.status === 'Covered').length,
      0
    );
    const pendingHealthClaimsCount = hwList.reduce(
      (acc, h) => acc + (h.healthClaims || []).filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length,
      0
    );
    const approvedHealthClaimsCount = hwList.reduce(
      (acc, h) => acc + (h.healthClaims || []).filter((c) => c.status === 'Approved' || c.status === 'Paid').length,
      0
    );
    const wellnessParticipationScore = hwList.length > 0 ? 88 : 0;

    // Workplace
    const activeFlexibleSchedulesCount = wbList.filter((w) => w.workScheduleType).length;
    const pendingLeaveRequestsCount = wbList.reduce(
      (acc, w) => acc + (w.paidLeaveRequests || []).filter((l) => l.status === 'Pending').length,
      0
    );
    const accommodationOccupancyCount = wbList.reduce(
      (acc, w) => acc + (w.accommodationRequests || []).filter((a) => a.status === 'Allocated').length,
      0
    );
    const childcareEnrolledCount = wbList.reduce(
      (acc, w) => acc + (w.childCareRequests || []).filter((c) => c.status === 'Enrolled').length,
      0
    );
    const totalFringeReimbursed = wbList.reduce((acc, w) => acc + (w.fringeTotalYTDReimbursed || 0), 0);

    return {
      totalGrantedEsopShares,
      totalVestedShares,
      totalPortfolioValue,
      totalBonusAmount,
      activeIncentivesCount,
      totalCompletedTrainingHours,
      totalActiveCertifications,
      learningAllowanceBalance,
      enrolledProgramsCount,
      completionRate,
      activeInsurancePoliciesCount,
      coveredDependentsCount,
      pendingHealthClaimsCount,
      approvedHealthClaimsCount,
      wellnessParticipationScore,
      activeFlexibleSchedulesCount,
      pendingLeaveRequestsCount,
      accommodationOccupancyCount,
      childcareEnrolledCount,
      totalFringeReimbursed,
    };
  },
};
