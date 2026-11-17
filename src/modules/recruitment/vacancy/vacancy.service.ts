import { VacancyRepository, vacancyRepository } from './vacancy.repository';
import { CreateVacancyDTO, UpdateVacancyDTO, VacancyQueryParams, IVacancy } from './vacancy.types';
import { CandidateModel } from '../candidate/candidate.model';
import { AppError } from '../../../common/errors/AppError';

export class VacancyService {
  constructor(private repo: VacancyRepository = vacancyRepository) {}

  async createVacancy(dto: CreateVacancyDTO): Promise<IVacancy> {
    const jobTitle = dto.jobTitle || dto.title || '';
    const title = dto.title || dto.jobTitle || '';
    const description = dto.description || dto.jobDescription || '';
    const jobDescription = dto.jobDescription || dto.description || '';
    const count = dto.noOfOpenings || dto.numberOfPositions || (dto as any).numberOfOpenings || (dto as any).openPositions || (dto as any).openings || 1;
    const noOfOpenings = count;
    const numberOfPositions = count;
    const numberOfOpenings = count;
    const openings = count;

    const payload: any = {
      ...dto,
      jobTitle,
      title,
      description,
      jobDescription,
      noOfOpenings,
      numberOfPositions,
      numberOfOpenings,
      openings,
      hiringManager: dto.hiringManager || 'HR Manager',
    };

    const created = await this.repo.create(payload);
    return created.toJSON() as unknown as IVacancy;
  }

  async getVacancyById(id: string): Promise<IVacancy> {
    const vacancy = await this.repo.findById(id);
    if (!vacancy) {
      throw new AppError('Vacancy not found', 404);
    }
    const json: any = vacancy.toJSON();
    const candidates = await CandidateModel.find({
      $or: [
        { vacancyId: id },
        { vacancy: json.title },
        { vacancy: json.jobTitle },
      ],
    }).exec();
    const filled = candidates.filter(c => c.status === 'Hired' || c.status === 'Offered' || c.status === 'Selected').length;
    const openings = json.numberOfPositions || json.noOfOpenings || json.numberOfOpenings || 1;
    json.filledPositions = filled;
    json.remainingPositions = Math.max(0, openings - filled);
    return json as unknown as IVacancy;
  }

  async updateVacancy(id: string, dto: UpdateVacancyDTO): Promise<IVacancy> {
    const payload: any = { ...dto };
    const count = payload.numberOfPositions || payload.noOfOpenings || (payload as any).numberOfOpenings || (payload as any).openings;
    if (count !== undefined) {
      payload.numberOfPositions = count;
      payload.noOfOpenings = count;
      payload.numberOfOpenings = count;
      payload.openings = count;
    }
    const updated = await this.repo.update(id, payload);
    if (!updated) {
      throw new AppError('Vacancy not found', 404);
    }
    return updated.toJSON() as unknown as IVacancy;
  }

  async updateVacancyStatus(id: string, status: IVacancy['status']): Promise<IVacancy> {
    return this.updateVacancy(id, { status });
  }

  async deleteVacancy(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Vacancy not found', 404);
    }
  }

  async getAllVacancies(params: VacancyQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    const enriched = await Promise.all(
      items.map(async (vDoc) => {
        const v = vDoc.toJSON() as unknown as IVacancy;
        const openings = v.noOfOpenings || v.numberOfPositions || (v as any).numberOfOpenings || (v as any).openings || 1;
        const filled = await CandidateModel.countDocuments({
          $or: [
            { vacancyId: vDoc._id },
            { vacancy: v.jobTitle },
            { vacancy: v.title },
          ],
          status: { $in: ['Hired', 'Selected', 'Offered', 'Onboarding'] },
          isArchived: false,
        });
        const remaining = Math.max(0, openings - filled);
        return {
          ...v,
          openings,
          numberOfOpenings: openings,
          filledPositions: filled,
          remainingPositions: remaining,
        };
      })
    );
    return {
      items: enriched,
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getVacancyPipeline(id: string) {
    const vacancy = await this.getVacancyById(id);
    const candidates = await CandidateModel.find({
      $or: [
        { vacancyId: id },
        { vacancy: vacancy.jobTitle },
        { vacancy: vacancy.title },
      ],
      isArchived: false,
    }).lean().exec();

    const stageMap: Record<string, any[]> = {
      Applied: [],
      Screened: [],
      Shortlisted: [],
      Interview: [],
      Offered: [],
      Hired: [],
      Rejected: [],
    };

    candidates.forEach((cand) => {
      const status = cand.status || 'Applied';
      if (status.includes('Interview')) {
        stageMap.Interview.push(cand);
      } else if (status.includes('Offer') || status === 'Selected') {
        stageMap.Offered.push(cand);
      } else if (status === 'Hired' || status === 'Onboarding') {
        stageMap.Hired.push(cand);
      } else if (status === 'Rejected') {
        stageMap.Rejected.push(cand);
      } else if (status === 'Shortlisted') {
        stageMap.Shortlisted.push(cand);
      } else if (status === 'Screened') {
        stageMap.Screened.push(cand);
      } else {
        stageMap.Applied.push(cand);
      }
    });

    const openings = vacancy.noOfOpenings || vacancy.numberOfPositions || (vacancy as any).numberOfOpenings || (vacancy as any).openings || 1;
    const filled = stageMap.Hired.length + stageMap.Offered.length;
    const remaining = Math.max(0, openings - filled);

    return {
      vacancy: {
        ...vacancy,
        openings,
        numberOfOpenings: openings,
        filledPositions: filled,
        remainingPositions: remaining,
      },
      openings,
      numberOfOpenings: openings,
      totalApplicants: candidates.length,
      filledPositions: filled,
      remainingPositions: remaining,
      pipeline: {
        applied: stageMap.Applied.length,
        screened: stageMap.Screened.length,
        shortlisted: stageMap.Shortlisted.length,
        interview: stageMap.Interview.length,
        offered: stageMap.Offered.length,
        hired: stageMap.Hired.length,
        rejected: stageMap.Rejected.length,
      },
      stages: {
        applied: stageMap.Applied.length,
        screened: stageMap.Screened.length,
        shortlisted: stageMap.Shortlisted.length,
        interview: stageMap.Interview.length,
        offered: stageMap.Offered.length,
        hired: stageMap.Hired.length,
        rejected: stageMap.Rejected.length,
      },
      candidates: stageMap,
    };
  }
}

export const vacancyService = new VacancyService();
