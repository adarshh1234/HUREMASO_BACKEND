import { JobPostingModel, IJobPostingDocument } from './jobPosting.model';
import { CreateJobPostingDTO, UpdateJobPostingDTO, JobPostingQueryParams } from './jobPosting.types';
import mongoose from 'mongoose';

export class JobPostingRepository {
  async create(data: CreateJobPostingDTO): Promise<IJobPostingDocument> {
    return JobPostingModel.create(data);
  }

  async findById(id: string): Promise<IJobPostingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return JobPostingModel.findById(id).populate('vacancyId').exec();
  }

  async update(id: string, data: UpdateJobPostingDTO): Promise<IJobPostingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return JobPostingModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async incrementApplicantsCount(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await JobPostingModel.findByIdAndUpdate(id, { $inc: { applicantsCount: 1 } }).exec();
    }
  }

  async delete(id: string): Promise<IJobPostingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return JobPostingModel.findByIdAndDelete(id).exec();
  }

  async findAll(params: JobPostingQueryParams): Promise<{ items: IJobPostingDocument[]; total: number }> {
    const filter: any = {};

    if (params.search) {
      const searchRegex = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { department: searchRegex },
        { description: searchRegex },
      ];
    }

    if (params.department) {
      filter.department = params.department;
    }

    if (params.platform) {
      filter.platform = params.platform;
    }

    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }

    filter.isArchived = false;

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 50);
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      JobPostingModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      JobPostingModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }
}

export const jobPostingRepository = new JobPostingRepository();
