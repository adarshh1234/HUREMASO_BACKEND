import { TalentPoolRepository, talentPoolRepository } from './talentPool.repository';
import {
  CreateTalentPoolDTO,
  UpdateTalentPoolDTO,
  AddCandidateToPoolDTO,
  TalentPoolQueryParams,
  ITalentPool,
} from './talentPool.types';
import { CandidateModel } from '../candidate/candidate.model';
import { VacancyModel } from '../vacancy/vacancy.model';
import { ApplicationModel } from '../application/application.model';
import { AppError } from '../../../common/errors/AppError';

export class TalentPoolService {
  constructor(private repo: TalentPoolRepository = talentPoolRepository) {}

  async createTalentPool(dto: CreateTalentPoolDTO): Promise<ITalentPool> {
    const created = await this.repo.create(dto);
    return created.toJSON() as unknown as ITalentPool;
  }

  async getTalentPoolById(id: string): Promise<ITalentPool> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Talent pool not found', 404);
    }
    return item.toJSON() as unknown as ITalentPool;
  }

  async updateTalentPool(id: string, dto: UpdateTalentPoolDTO): Promise<ITalentPool> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Talent pool not found', 404);
    }
    return updated.toJSON() as unknown as ITalentPool;
  }

  async deleteTalentPool(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Talent pool not found', 404);
    }
  }

  async addCandidate(poolId: string, dto: AddCandidateToPoolDTO): Promise<ITalentPool> {
    const candidate = await CandidateModel.findById(dto.candidateId);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const updated = await this.repo.addCandidate(poolId, {
      candidateId: dto.candidateId,
      addedAt: new Date(),
      notes: dto.notes,
      rating: dto.rating || 5,
    });

    if (!updated) {
      throw new AppError('Talent pool not found', 404);
    }

    return updated.toJSON() as unknown as ITalentPool;
  }

  async removeCandidate(poolId: string, candidateId: string): Promise<ITalentPool> {
    const updated = await this.repo.removeCandidate(poolId, candidateId);
    if (!updated) {
      throw new AppError('Talent pool not found', 404);
    }
    return updated.toJSON() as unknown as ITalentPool;
  }

  async getCandidates(poolId: string) {
    const pool = await this.repo.findById(poolId);
    if (!pool) {
      throw new AppError('Talent pool not found', 404);
    }

    const poolJson = pool.toJSON() as any;
    const candidates = (poolJson.candidates || []).map((item: any) => {
      const cand = item.candidateId || {};
      return {
        id: cand._id?.toString() || cand.id || '',
        name: cand.name || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Candidate',
        email: cand.email || '',
        phone: cand.phone || cand.contactNumber || '',
        skills: cand.skills || [],
        experience: cand.experience || cand.experienceYears || 0,
        status: cand.status || 'Screened',
        resumeUrl: cand.resumeUrl || '',
        rating: item.rating || 5,
        notes: item.notes || '',
        addedAt: item.addedAt,
      };
    });

    return {
      pool: {
        id: poolJson.id,
        name: poolJson.name,
        department: poolJson.department,
        tags: poolJson.tags,
        totalCandidates: candidates.length,
      },
      candidates,
    };
  }

  async associateCandidateWithJob(poolId: string, candidateId: string, vacancyId: string) {
    const pool = await this.repo.findById(poolId);
    if (!pool) {
      throw new AppError('Talent pool not found', 404);
    }

    const candidate = await CandidateModel.findById(candidateId);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const vacancy = await VacancyModel.findById(vacancyId);
    if (!vacancy) {
      throw new AppError('Vacancy not found', 404);
    }

    // Update candidate job association
    await CandidateModel.findByIdAndUpdate(candidateId, {
      $set: {
        vacancyId: vacancy._id,
        vacancy: vacancy.jobTitle || vacancy.title,
        status: 'Screened',
      },
    });

    // Create or update pipeline application
    let application = await ApplicationModel.findOne({
      candidateId: candidate._id,
      vacancyId: vacancy._id,
    });

    if (!application) {
      application = await ApplicationModel.create({
        candidateId: candidate._id,
        vacancyId: vacancy._id,
        status: 'Screening',
        stage: 'Screening',
        source: `Talent Pool (${pool.name})`,
        appliedDate: new Date().toISOString().split('T')[0],
      });
    }

    return {
      success: true,
      message: `Candidate ${candidate.name || candidate.email} associated with job "${vacancy.jobTitle || vacancy.title}"`,
      candidate: await CandidateModel.findById(candidateId),
      vacancy,
      application,
    };
  }

  async getAllTalentPools(params: TalentPoolQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as ITalentPool),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }
}

export const talentPoolService = new TalentPoolService();
