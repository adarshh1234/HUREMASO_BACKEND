import { FilterQuery } from 'mongoose';
import { PerformanceAppraisalModel } from './performanceAppraisal.model';
import { AppraisalCycleModel } from './appraisalCycle.model';
import {
  IPerformanceAppraisalRecord,
  IPerformanceAppraisalDocument,
  AppraisalQueryParams,
  AppraisalReportsSummary,
  IFeedback360Item,
} from './performanceAppraisal.types';
import {
  IAppraisalCycle,
  IAppraisalCycleDocument,
  CreateAppraisalCycleDTO,
} from './appraisalCycle.types';
import { escapeRegex } from '../../common/utils/regex';

export class PerformanceAppraisalRepository {
  async findAll(params: AppraisalQueryParams): Promise<{ items: IPerformanceAppraisalDocument[]; total: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPerformanceAppraisalDocument> = {};

    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }

    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }

    if (params.cycle && params.cycle !== 'All') {
      filter.cycle = params.cycle;
    }

    if (params.employeeId) {
      filter.employeeId = params.employeeId;
    }

    if (params.search && params.search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(params.search.trim()), 'i');
      filter.$or = [
        { employeeName: searchRegex },
        { role: searchRegex },
        { department: searchRegex },
        { recordId: searchRegex },
        { cycle: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      PerformanceAppraisalModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      PerformanceAppraisalModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<IPerformanceAppraisalDocument | null> {
    return PerformanceAppraisalModel.findById(id).exec();
  }

  async findByRecordId(recordId: string): Promise<IPerformanceAppraisalDocument | null> {
    return PerformanceAppraisalModel.findOne({ recordId }).exec();
  }

  async findByEmployeeAndCycle(employeeId: string, cycle: string): Promise<IPerformanceAppraisalDocument | null> {
    return PerformanceAppraisalModel.findOne({ employeeId, cycle }).exec();
  }

  async create(data: Partial<IPerformanceAppraisalRecord>): Promise<IPerformanceAppraisalDocument> {
    const doc = new PerformanceAppraisalModel(data);
    return doc.save();
  }

  async updateById(
    id: string,
    data: Partial<IPerformanceAppraisalRecord>
  ): Promise<IPerformanceAppraisalDocument | null> {
    return PerformanceAppraisalModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await PerformanceAppraisalModel.findByIdAndDelete(id).exec();
    return res !== null;
  }

  async add360Feedback(id: string, feedback: IFeedback360Item): Promise<IPerformanceAppraisalDocument | null> {
    return PerformanceAppraisalModel.findByIdAndUpdate(
      id,
      { $push: { feedback360: feedback } },
      { new: true, runValidators: true }
    ).exec();
  }

  async getReportsSummary(): Promise<AppraisalReportsSummary> {
    const records = await PerformanceAppraisalModel.find({}).exec();
    const total = records.length;
    if (total === 0) {
      return {
        totalAppraisals: 0,
        completedAppraisals: 0,
        averageAiScore: 0,
        averagePunctuality: 0,
        topPerformersCount: 0,
        hiPoNominatedCount: 0,
        averageRetentionRiskPct: 0,
      };
    }

    const completed = records.filter((r) => r.status === 'Completed' || r.status === 'Approved').length;
    const avgScore = records.reduce((acc, r) => acc + (r.reportsAi?.overallAiScore || 4.5), 0) / total;
    const avgPunctuality = records.reduce((acc, r) => acc + (r.attendanceTime?.punctualityScore || 95), 0) / total;
    const topPerformers = records.filter((r) => (r.reportsAi?.overallAiScore || 0) >= 4.7).length;
    const hiPo = records.filter((r) => r.strategy?.hipoTrack?.nominated).length;
    const avgRisk = records.reduce((acc, r) => acc + (r.analyticsAi?.attritionRiskPct || 2.5), 0) / total;

    return {
      totalAppraisals: total,
      completedAppraisals: completed,
      averageAiScore: Number(avgScore.toFixed(2)),
      averagePunctuality: Number(avgPunctuality.toFixed(1)),
      topPerformersCount: topPerformers,
      hiPoNominatedCount: hiPo,
      averageRetentionRiskPct: Number(avgRisk.toFixed(1)),
    };
  }

  // --- Appraisal Cycle Management ---
  async findAllCycles(): Promise<IAppraisalCycleDocument[]> {
    return AppraisalCycleModel.find({}).sort({ createdAt: -1 }).exec();
  }

  async findCycleById(id: string): Promise<IAppraisalCycleDocument | null> {
    return AppraisalCycleModel.findById(id).exec();
  }

  async findCycleByCycleId(cycleId: string): Promise<IAppraisalCycleDocument | null> {
    return AppraisalCycleModel.findOne({ cycleId }).exec();
  }

  async createCycle(data: Partial<IAppraisalCycle>): Promise<IAppraisalCycleDocument> {
    const cycle = new AppraisalCycleModel(data);
    return cycle.save();
  }

  async updateCycleById(id: string, data: Partial<IAppraisalCycle>): Promise<IAppraisalCycleDocument | null> {
    return AppraisalCycleModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async deleteCycleById(id: string): Promise<boolean> {
    const res = await AppraisalCycleModel.findByIdAndDelete(id).exec();
    return res !== null;
  }
}

export const performanceAppraisalRepository = new PerformanceAppraisalRepository();
