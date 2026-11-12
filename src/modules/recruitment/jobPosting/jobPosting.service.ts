import { JobPostingRepository, jobPostingRepository } from './jobPosting.repository';
import { CreateJobPostingDTO, UpdateJobPostingDTO, JobPostingQueryParams, IJobPosting } from './jobPosting.types';
import { AppError } from '../../../common/errors/AppError';

export class JobPostingService {
  constructor(private repo: JobPostingRepository = jobPostingRepository) {}

  async createJobPosting(dto: CreateJobPostingDTO): Promise<IJobPosting> {
    const payload = { ...dto };
    if (!payload.status) {
      payload.status = payload.platform === 'LetsGetIn' ? 'Live on Letgetin' : 'Draft';
    }
    const created = await this.repo.create(payload);
    return created.toJSON() as unknown as IJobPosting;
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
      status: 'Live on Letgetin',
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
    const { total } = await this.repo.findAll({ platform: 'LetsGetIn', status: 'Live on Letgetin' });
    return {
      connected: true,
      status: '100% Operational',
      platform: 'LetsGetIn Talent Network',
      activePostingsCount: total,
      lastSyncAt: new Date().toISOString(),
    };
  }
}

export const jobPostingService = new JobPostingService();
