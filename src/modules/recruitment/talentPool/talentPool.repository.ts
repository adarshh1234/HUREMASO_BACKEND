import { TalentPoolModel } from './talentPool.model';
import {
  ITalentPoolDocument,
  CreateTalentPoolDTO,
  UpdateTalentPoolDTO,
  TalentPoolQueryParams,
  ITalentPoolCandidateItem,
} from './talentPool.types';

export class TalentPoolRepository {
  async create(data: CreateTalentPoolDTO): Promise<ITalentPoolDocument> {
    const pool = new TalentPoolModel(data);
    return (await pool.save()).populate('candidates.candidateId');
  }

  async findById(id: string): Promise<ITalentPoolDocument | null> {
    return TalentPoolModel.findById(id).populate('candidates.candidateId');
  }

  async update(id: string, data: UpdateTalentPoolDTO): Promise<ITalentPoolDocument | null> {
    return TalentPoolModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate(
      'candidates.candidateId'
    );
  }

  async addCandidate(id: string, item: ITalentPoolCandidateItem): Promise<ITalentPoolDocument | null> {
    // Check if candidate already in pool to avoid duplicates
    const pool = await TalentPoolModel.findById(id);
    if (!pool) return null;

    const exists = pool.candidates.some((c) => c.candidateId.toString() === item.candidateId.toString());
    if (exists) {
      return pool.populate('candidates.candidateId');
    }

    pool.candidates.push(item);
    return (await pool.save()).populate('candidates.candidateId');
  }

  async removeCandidate(id: string, candidateId: string): Promise<ITalentPoolDocument | null> {
    return TalentPoolModel.findByIdAndUpdate(
      id,
      { $pull: { candidates: { candidateId } } },
      { new: true }
    ).populate('candidates.candidateId');
  }

  async delete(id: string): Promise<ITalentPoolDocument | null> {
    return TalentPoolModel.findByIdAndDelete(id);
  }

  async findAll(params: TalentPoolQueryParams): Promise<{ items: ITalentPoolDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { department: { $regex: params.search, $options: 'i' } },
        { tags: { $in: [new RegExp(params.search, 'i')] } },
      ];
    }

    if (params.department) {
      query.department = { $regex: params.department, $options: 'i' };
    }

    if (params.tag) {
      query.tags = { $in: [new RegExp(params.tag, 'i')] };
    }

    if (params.status) {
      query.status = params.status;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      TalentPoolModel.find(query)
        .populate('candidates.candidateId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      TalentPoolModel.countDocuments(query),
    ]);

    return { items, total };
  }
}

export const talentPoolRepository = new TalentPoolRepository();
