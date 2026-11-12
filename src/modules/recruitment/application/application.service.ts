import { ApplicationRepository, applicationRepository } from './application.repository';
import {
  CreateApplicationDTO,
  UpdateApplicationDTO,
  UpdateApplicationStatusDTO,
  ApplicationQueryParams,
  IApplication,
} from './application.types';
import { CandidateModel } from '../candidate/candidate.model';
import { VacancyModel } from '../vacancy/vacancy.model';
import { AppError } from '../../../common/errors/AppError';

export class ApplicationService {
  constructor(private repo: ApplicationRepository = applicationRepository) {}

  async createApplication(dto: CreateApplicationDTO): Promise<IApplication> {
    // Validate candidate exists
    const candidate = await CandidateModel.findById(dto.candidateId);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    // Validate vacancy exists
    const vacancy = await VacancyModel.findById(dto.vacancyId);
    if (!vacancy) {
      throw new AppError('Vacancy not found', 404);
    }

    // Check if duplicate application already exists
    const existing = await this.repo.findByCandidateAndVacancy(dto.candidateId, dto.vacancyId);
    if (existing) {
      throw new AppError('Candidate has already applied for this vacancy', 409);
    }

    const created = await this.repo.create(dto);

    // Update candidate's applied vacancy if not set
    if (!candidate.vacancyId) {
      await CandidateModel.findByIdAndUpdate(dto.candidateId, {
        $set: { vacancyId: dto.vacancyId, status: 'Application Initiated' },
      });
    }

    return created.toJSON() as unknown as IApplication;
  }

  async getApplicationById(id: string): Promise<IApplication> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Application not found', 404);
    }
    return item.toJSON() as unknown as IApplication;
  }

  async updateApplication(id: string, dto: UpdateApplicationDTO): Promise<IApplication> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Application not found', 404);
    }
    return updated.toJSON() as unknown as IApplication;
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDTO): Promise<IApplication> {
    const app = await this.repo.findById(id);
    if (!app) {
      throw new AppError('Application not found', 404);
    }

    const historyItem = {
      status: dto.status,
      stage: dto.stage || dto.status,
      changedAt: new Date(),
      changedBy: dto.changedBy || 'HR Admin',
      comment: dto.comment || `Status updated to ${dto.status}`,
    };

    const updated = await this.repo.addStatusHistory(id, historyItem);
    if (!updated) {
      throw new AppError('Failed to update application status', 500);
    }

    // Synchronize candidate status
    const candidateStatusMap: Record<string, string> = {
      Applied: 'Application Initiated',
      Screening: 'Shortlisted',
      Shortlisted: 'Shortlisted',
      'Interview Scheduled': 'Interview Scheduled',
      Interviewed: 'Interview Passed',
      Offered: 'Job Offered',
      Hired: 'Hired',
      Rejected: 'Rejected',
    };

    if (candidateStatusMap[dto.status] && app.candidateId) {
      const candId = typeof app.candidateId === 'object' ? app.candidateId._id || app.candidateId.id : app.candidateId;
      if (candId) {
        await CandidateModel.findByIdAndUpdate(candId, {
          $set: { status: candidateStatusMap[dto.status] },
        });
      }
    }

    return updated.toJSON() as unknown as IApplication;
  }

  async deleteApplication(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Application not found', 404);
    }
  }

  async getAllApplications(params: ApplicationQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IApplication),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getApplicationMetrics() {
    const counts = await this.repo.countByStatus();
    return counts;
  }
}

export const applicationService = new ApplicationService();
