import { CandidateModel, ICandidateDocument } from './candidate.model';
import { CreateCandidateDTO, UpdateCandidateDTO, CandidateQueryParams } from './candidate.types';
import mongoose from 'mongoose';

export class CandidateRepository {
  async create(data: CreateCandidateDTO): Promise<ICandidateDocument> {
    return CandidateModel.create(data);
  }

  async findById(id: string): Promise<ICandidateDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return CandidateModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<ICandidateDocument | null> {
    return CandidateModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async update(id: string, data: UpdateCandidateDTO): Promise<ICandidateDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return CandidateModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<ICandidateDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return CandidateModel.findByIdAndDelete(id).exec();
  }

  async findAll(params: CandidateQueryParams): Promise<{ items: ICandidateDocument[]; total: number }> {
    const filter: any = {};

    if (params.search) {
      const searchRegex = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { vacancy: searchRegex },
        { currentCompany: searchRegex },
        { skills: searchRegex },
      ];
    }

    if (params.vacancy) {
      filter.vacancy = params.vacancy;
    }

    if (params.hiringManager) {
      filter.hiringManager = params.hiringManager;
    }

    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }

    if (params.skills) {
      const skillArr = params.skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skillArr };
    }

    if ((params as any).jobTitle) {
      const jtRegex = new RegExp((params as any).jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: [{ jobTitle: jtRegex }, { vacancy: jtRegex }] });
    }

    if ((params as any).keywords) {
      const kwRegex = new RegExp((params as any).keywords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: kwRegex },
          { email: kwRegex },
          { vacancy: kwRegex },
          { skills: kwRegex },
          { notes: kwRegex },
          { education: kwRegex },
          { currentCompany: kwRegex },
          { currentDesignation: kwRegex },
        ],
      });
    }

    if ((params as any).dateFrom || (params as any).dateTo) {
      filter.dateApplied = {};
      if ((params as any).dateFrom) filter.dateApplied.$gte = (params as any).dateFrom;
      if ((params as any).dateTo) filter.dateApplied.$lte = (params as any).dateTo;
    }

    filter.isArchived = false;

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 50);
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      CandidateModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      CandidateModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }
}

export const candidateRepository = new CandidateRepository();
