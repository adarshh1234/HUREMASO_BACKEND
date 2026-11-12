import { VacancyModel, IVacancyDocument } from './vacancy.model';
import { CreateVacancyDTO, UpdateVacancyDTO, VacancyQueryParams } from './vacancy.types';
import mongoose from 'mongoose';

export class VacancyRepository {
  async create(data: CreateVacancyDTO): Promise<IVacancyDocument> {
    return VacancyModel.create(data);
  }

  async findById(id: string): Promise<IVacancyDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return VacancyModel.findById(id).exec();
  }

  async update(id: string, data: UpdateVacancyDTO): Promise<IVacancyDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return VacancyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<IVacancyDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return VacancyModel.findByIdAndDelete(id).exec();
  }

  async findAll(params: VacancyQueryParams): Promise<{ items: IVacancyDocument[]; total: number }> {
    const filter: any = {};

    if (params.search) {
      const searchRegex = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { jobTitle: searchRegex },
        { department: searchRegex },
        { hiringManager: searchRegex },
        { description: searchRegex },
      ];
    }

    if (params.jobTitle) {
      filter.jobTitle = params.jobTitle;
    }

    if (params.department) {
      filter.department = params.department;
    }

    if (params.location) {
      filter.location = { $regex: params.location, $options: 'i' };
    }

    if (params.employmentType) {
      filter.employmentType = { $regex: params.employmentType, $options: 'i' };
    }

    if (params.hiringManager) {
      filter.hiringManager = params.hiringManager;
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
      VacancyModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      VacancyModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }
}

export const vacancyRepository = new VacancyRepository();
