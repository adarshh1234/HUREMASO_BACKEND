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

  async exerciseEsopTranche(employeeId: string, trancheNumber: number) {
    return FinancialIncentiveModel.findOneAndUpdate(
      { employeeId, 'vestingSchedule.trancheNumber': trancheNumber, 'vestingSchedule.status': 'Vested' },
      {
        $set: {
          'vestingSchedule.$.status': 'Exercised',
          'vestingSchedule.$.exercisedAt': new Date(),
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

  async addLearningProgram(employeeId: string, program: object) {
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $push: { learningPrograms: program } },
      { new: true }
    );
  },

  async updateLearningProgram(employeeId: string, programId: string, update: object) {
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId, 'learningPrograms._id': new Types.ObjectId(programId) },
      { $set: { 'learningPrograms.$': { ...update, _id: new Types.ObjectId(programId) } } },
      { new: true }
    );
  },

  async deleteLearningProgram(employeeId: string, programId: string) {
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $pull: { learningPrograms: { _id: new Types.ObjectId(programId) } } },
      { new: true }
    );
  },

  async addCertification(employeeId: string, cert: object) {
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $push: { certifications: cert } },
      { new: true }
    );
  },

  async deleteCertification(employeeId: string, certId: string) {
    return EmployeeDevelopmentModel.findOneAndUpdate(
      { employeeId },
      { $pull: { certifications: { _id: new Types.ObjectId(certId) } } },
      { new: true }
    );
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
      status: claimData.status || 'Pending',
    };
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      { $push: { healthClaims: claim } },
      { new: true }
    );
  },

  async updateClaimStatus(employeeId: string, claimId: string, status: string, notes?: string) {
    const update: Record<string, unknown> = {
      'healthClaims.$.status': status,
    };
    if (notes) update['healthClaims.$.notes'] = notes;
    if (status === 'Reimbursed' || status === 'Approved') {
      update['healthClaims.$.processedAt'] = new Date();
    }
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId, 'healthClaims.claimId': claimId },
      { $set: update },
      { new: true }
    );
  },

  async addDependent(employeeId: string, dependent: object) {
    return HealthWellnessModel.findOneAndUpdate(
      { employeeId },
      { $push: { insuranceDependents: dependent } },
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

  async updateFringeClaimStatus(employeeId: string, claimId: string, status: string) {
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId, 'fringeClaims.claimId': claimId },
      { $set: { 'fringeClaims.$.status': status } },
      { new: true }
    );
  },

  async registerFamilyEvent(employeeId: string, eventName: string) {
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $addToSet: { familyEventsRegistered: eventName } },
      { new: true }
    );
  },

  async applyChildCareStipend(employeeId: string) {
    return WorkplaceLifeBalanceModel.findOneAndUpdate(
      { employeeId },
      { $set: { childCareStipendActive: true } },
      { new: true }
    );
  },
};
