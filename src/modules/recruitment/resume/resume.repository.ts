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

    if ((params as any).minScore) {
      query.matchScore = { $gte: Number((params as any).minScore) };
    }

    if ((params as any).source) {
      query.source = (params as any).source;
    }

    if ((params as any).isVerifiedLetsGetIn !== undefined) {
      query.isVerifiedLetsGetIn = (params as any).isVerifiedLetsGetIn === true || (params as any).isVerifiedLetsGetIn === 'true';
    }

    if ((params as any).location) {
      query.location = { $regex: (params as any).location, $options: 'i' };
    }

    if ((params as any).role) {
      query.title = { $regex: (params as any).role, $options: 'i' };
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

  async countMetrics(): Promise<{
    totalResumes: number;
    verifiedCount: number;
    highMatchCount: number;
    shortlistedCount: number;
  }> {
    const [totalResumes, verifiedCount, highMatchCount, shortlistedCount] = await Promise.all([
      ResumeModel.countDocuments(),
      ResumeModel.countDocuments({ isVerifiedLetsGetIn: true }),
      ResumeModel.countDocuments({ matchScore: { $gte: 90 } }),
      ResumeModel.countDocuments({ status: 'Shortlisted' }),
    ]);

    return { totalResumes, verifiedCount, highMatchCount, shortlistedCount };
  }
}

export const resumeRepository = new ResumeRepository();
