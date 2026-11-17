import { JobPostingRepository, jobPostingRepository } from './jobPosting.repository';
import { CreateJobPostingDTO, UpdateJobPostingDTO, JobPostingQueryParams, IJobPosting } from './jobPosting.types';
import { VacancyModel } from '../vacancy/vacancy.model';
import { CandidateModel } from '../candidate/candidate.model';
import { AppError } from '../../../common/errors/AppError';

export class JobPostingService {
  constructor(private repo: JobPostingRepository = jobPostingRepository) {}

  async createJobPosting(dto: CreateJobPostingDTO): Promise<IJobPosting> {
    const payload = { ...dto };
    if (!payload.status) {
      payload.status = payload.platform === 'LetsGetIn' ? 'Live on Letgetin' : 'Draft';
    }

    const title = payload.jobTitle || payload.title || 'Position';
    payload.title = title;
    payload.jobTitle = title;

    // Automatically create or link the associated Vacancy if one does not exist
    if (!payload.vacancyId) {
      try {
        const existingVac = await VacancyModel.findOne({
          $or: [{ jobTitle: title }, { title: title }],
          department: payload.department,
          isArchived: false,
        });

        if (existingVac) {
          payload.vacancyId = existingVac._id as any;
        } else {
          const reqs =
            payload.qualifications ||
            (Array.isArray(payload.skills) ? payload.skills.join(', ') : payload.skills) ||
            '';
          const newVac = await VacancyModel.create({
            jobTitle: title,
            title,
            department: payload.department,
            location: payload.location || payload.officeLocation || 'Remote',
            locationType: payload.locationType || 'Remote / Hybrid',
            employmentType: payload.employmentType || 'Full-time',
            noOfOpenings: 1,
            numberOfPositions: 1,
            description: payload.description || '',
            jobDescription: payload.description || '',
            requirements: reqs,
            status: payload.status === 'Draft' ? 'Draft' : 'Available',
            datePosted: payload.postedDate || new Date().toISOString().split('T')[0],
            minSalary: payload.minSalary,
            maxSalary: payload.maxSalary,
            currency: payload.currency || 'USD',
          });
          payload.vacancyId = newVac._id as any;
        }
      } catch (err) {
        console.warn('Could not auto-link vacancy for job posting:', err);
      }
    }

    const created = await this.repo.create(payload);
    const json = created.toJSON() as unknown as IJobPosting;

    // If platform is LetsGetIn, generate stable platform identifier & live URL
    const id = json.id || (created as any)._id?.toString() || '';
    if (payload.platform === 'LetsGetIn' && (!json.platformPostId || !json.liveUrl)) {
      const platformPostId = `LGT-${id.slice(-6).toUpperCase()}`;
      const liveUrl = `https://letgetin.com/jobs/${id}`;
      const updated = await this.repo.update(id, { platformPostId, liveUrl });
      if (updated) {
        return updated.toJSON() as unknown as IJobPosting;
      }
    }

    return json;
  }

  async getJobPostingById(id: string): Promise<IJobPosting> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Job posting not found', 404);
    }
    return item.toJSON() as unknown as IJobPosting;
  }

  async updateJobPosting(id: string, dto: UpdateJobPostingDTO): Promise<IJobPosting> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Job posting not found', 404);
    }
    return updated.toJSON() as unknown as IJobPosting;
  }

  async publishJobPosting(id: string, platform = 'LetsGetIn'): Promise<IJobPosting> {
    const now = new Date();
    const isLetGetIn = platform === 'LetsGetIn' || platform === 'LetGetIn' || platform === 'Letgetin';
    const status = isLetGetIn ? 'Live on Letgetin' : 'Published';
    const liveUrl = isLetGetIn ? `https://letgetin.com/jobs/${id}` : undefined;
    const platformPostId = isLetGetIn ? `LGT-${id.slice(-6).toUpperCase()}` : undefined;

    return this.updateJobPosting(id, {
      status,
      platform: isLetGetIn ? 'LetsGetIn' : platform,
      liveUrl,
      platformPostId,
      postedDate: now.toISOString().split('T')[0],
      postedAt: now,
    });
  }

  async unpublishJobPosting(id: string): Promise<IJobPosting> {
    return this.updateJobPosting(id, { status: 'Draft' });
  }

  async closeJobPosting(id: string): Promise<IJobPosting> {
    return this.updateJobPosting(id, { status: 'Closed' });
  }

  async deleteJobPosting(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Job posting not found', 404);
    }
  }

  async getAllJobPostings(params: JobPostingQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IJobPosting),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getActiveLetGetInPostings(params: JobPostingQueryParams = {}) {
    return this.getAllJobPostings({
      ...params,
      platform: 'LetsGetIn',
      status: (params.status || { $in: ['Live on Letgetin', 'Published'] }) as any,
    });
  }

  async postToLetGetIn(dto: CreateJobPostingDTO): Promise<IJobPosting> {
    const now = new Date();
    const payload: CreateJobPostingDTO = {
      ...dto,
      platform: 'LetsGetIn',
      status: 'Live on Letgetin',
      closingDate: dto.closingDate,
    };
    const created = await this.createJobPosting(payload);
    const id = created.id || (created as any)._id?.toString() || '';
    if (id) {
      return this.publishJobPosting(id, 'LetsGetIn');
    }
    return created;
  }

  async syncLetGetInStatus() {
    const { items, total } = await this.repo.findAll({
      platform: 'LetsGetIn',
      status: ({ $in: ['Live on Letgetin', 'Published'] } as any),
      limit: 1000,
    });
    let totalApplicants = 0;
    let updatedRecords = 0;

    for (const job of items) {
      const queryOr: any[] = [];
      if (job.vacancyId) queryOr.push({ vacancyId: job.vacancyId });
      if (job.title) queryOr.push({ vacancy: job.title });
      if (job.jobTitle && job.jobTitle !== job.title) queryOr.push({ vacancy: job.jobTitle });

      const candCount = queryOr.length > 0
        ? await CandidateModel.countDocuments({ $or: queryOr, isArchived: false })
        : 0;

      totalApplicants += candCount;

      if (job.applicantsCount !== candCount) {
        await this.repo.update(job._id.toString(), { applicantsCount: candCount });
        updatedRecords++;
      }
    }

    return {
      connected: true,
      status: 'synchronized',
      operationalStatus: '100% Operational',
      platform: 'LetsGetIn Talent Network',
      activePostingsCount: total,
      jobsSynchronized: total,
      totalApplicants,
      updatedRecords,
      failedRecords: 0,
      lastSyncAt: new Date().toISOString(),
    };
  }
}

export const jobPostingService = new JobPostingService();
