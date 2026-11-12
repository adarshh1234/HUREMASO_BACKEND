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
    const noOfOpenings = dto.noOfOpenings || dto.numberOfPositions || (dto as any).openPositions || 1;
    const numberOfPositions = dto.numberOfPositions || dto.noOfOpenings || (dto as any).openPositions || 1;

    const payload: any = {
      ...dto,
      jobTitle,
      title,
      description,
      jobDescription,
      noOfOpenings,
      numberOfPositions,
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
    return vacancy.toJSON() as unknown as IVacancy;
  }

  async updateVacancy(id: string, dto: UpdateVacancyDTO): Promise<IVacancy> {
    const updated = await this.repo.update(id, dto);
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
    return {
      items: items.map((i) => i.toJSON() as unknown as IVacancy),
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

    return {
      vacancy,
      totalApplicants: candidates.length,
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
