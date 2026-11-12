import { ResumeModel } from './resume.model';
import { IResumeDocument, CreateResumeDTO, UpdateResumeDTO, ResumeQueryParams } from './resume.types';

export class ResumeRepository {
  async create(data: CreateResumeDTO): Promise<IResumeDocument> {
    const resume = new ResumeModel(data);
    return (await resume.save()).populate(['candidateId', 'matchedVacancyId']);
  }

  async findById(id: string): Promise<IResumeDocument | null> {
    return ResumeModel.findById(id).populate(['candidateId', 'matchedVacancyId']);
  }

  async update(id: string, data: UpdateResumeDTO): Promise<IResumeDocument | null> {
    return ResumeModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate([
      'candidateId',
      'matchedVacancyId',
    ]);
  }

  async delete(id: string): Promise<IResumeDocument | null> {
    return ResumeModel.findByIdAndDelete(id);
  }

  async findAll(params: ResumeQueryParams): Promise<{ items: IResumeDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { candidateName: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { title: { $regex: params.search, $options: 'i' } },
        { skills: { $in: [new RegExp(params.search, 'i')] } },
      ];
    }

    if (params.skill) {
      query.skills = { $in: [new RegExp(params.skill, 'i')] };
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.matchedVacancyId) {
      query.matchedVacancyId = params.matchedVacancyId;
    }

    if (params.minExperience) {
      query.experienceYears = { $gte: Number(params.minExperience) };
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      ResumeModel.find(query)
        .populate(['candidateId', 'matchedVacancyId'])
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      ResumeModel.countDocuments(query),
    ]);

    return { items, total };
  }
}

export const resumeRepository = new ResumeRepository();
