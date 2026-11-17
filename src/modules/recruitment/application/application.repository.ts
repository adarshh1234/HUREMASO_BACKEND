import { ApplicationModel } from './application.model';
import {
  IApplicationDocument,
  CreateApplicationDTO,
  UpdateApplicationDTO,
  ApplicationQueryParams,
  IStatusHistoryItem,
} from './application.types';
import { CandidateModel } from '../candidate/candidate.model';
import { VacancyModel } from '../vacancy/vacancy.model';

export class ApplicationRepository {
  async create(data: CreateApplicationDTO): Promise<IApplicationDocument> {
    const initialStatus = data.status || 'Applied';
    const initialStage = data.currentStage || 'Initial Screening';
    const statusHistory: IStatusHistoryItem[] = [
      {
        status: initialStatus,
        stage: initialStage,
        changedAt: new Date(),
        changedBy: 'System',
        comment: 'Application submitted',
      },
    ];

    const application = new ApplicationModel({
      ...data,
      status: initialStatus,
      currentStage: initialStage,
      statusHistory,
    });
    return (await application.save()).populate(['candidateId', 'vacancyId', 'jobPostingId']);
  }

  async findById(id: string): Promise<IApplicationDocument | null> {
    return ApplicationModel.findById(id).populate(['candidateId', 'vacancyId', 'jobPostingId']);
  }

  async findByCandidateAndVacancy(candidateId: string, vacancyId: string): Promise<IApplicationDocument | null> {
    return ApplicationModel.findOne({ candidateId, vacancyId });
  }

  async update(id: string, data: UpdateApplicationDTO): Promise<IApplicationDocument | null> {
    return ApplicationModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate([
      'candidateId',
      'vacancyId',
      'jobPostingId',
    ]);
  }

  async addStatusHistory(
    id: string,
    historyItem: IStatusHistoryItem,
    additionalUpdates: Partial<UpdateApplicationDTO> = {}
  ): Promise<IApplicationDocument | null> {
    return ApplicationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: historyItem.status,
          ...(historyItem.stage ? { currentStage: historyItem.stage } : {}),
          ...additionalUpdates,
        },
        $push: { statusHistory: historyItem },
      },
      { new: true }
    ).populate(['candidateId', 'vacancyId', 'jobPostingId']);
  }

  async delete(id: string): Promise<IApplicationDocument | null> {
    return ApplicationModel.findByIdAndDelete(id);
  }

  async findAll(params: ApplicationQueryParams): Promise<{ items: IApplicationDocument[]; total: number }> {
    const query: any = {};

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      const [candIds, vacIds] = await Promise.all([
        CandidateModel.find({
          $or: [
            { name: { $regex: s, $options: 'i' } },
            { firstName: { $regex: s, $options: 'i' } },
            { lastName: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
          ],
        }).select('_id').lean(),
        VacancyModel.find({
          $or: [
            { title: { $regex: s, $options: 'i' } },
            { jobTitle: { $regex: s, $options: 'i' } },
            { department: { $regex: s, $options: 'i' } },
          ],
        }).select('_id').lean(),
      ]);

      query.$or = [
        { candidateId: { $in: candIds.map((c) => c._id) } },
        { vacancyId: { $in: vacIds.map((v) => v._id) } },
        { currentStage: { $regex: s, $options: 'i' } },
        { status: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } },
      ];
    }

    if (params.status) {
      // support lenient status matching e.g. "Shot listed" -> "Shortlisted"
      const st = params.status === 'Shot listed' ? 'Shortlisted' : params.status;
      query.status = { $regex: `^${st}$`, $options: 'i' };
    }

    if (params.vacancyId) {
      query.vacancyId = params.vacancyId;
    }

    if ((params as any).department) {
      const vacsInDept = await VacancyModel.find({
        department: { $regex: (params as any).department, $options: 'i' },
      }).select('_id').lean();
      query.vacancyId = { $in: vacsInDept.map((v) => v._id) };
    }

    if (params.candidateId) {
      query.candidateId = params.candidateId;
    }

    if (params.jobPostingId) {
      query.jobPostingId = params.jobPostingId;
    }

    if (params.currentStage) {
      query.currentStage = { $regex: params.currentStage, $options: 'i' };
    }

    if ((params as any).fromDate || (params as any).dateRange) {
      const fromStr = (params as any).fromDate || (params as any).dateRange;
      const parsedDate = new Date(fromStr);
      if (!isNaN(parsedDate.getTime())) {
        query.appliedDate = { $gte: parsedDate };
      }
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'appliedDate';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      ApplicationModel.find(query)
        .populate(['candidateId', 'vacancyId', 'jobPostingId'])
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      ApplicationModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const agg = await ApplicationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = {};
    agg.forEach((item) => {
      result[item._id] = item.count;
    });
    return result;
  }
}

export const applicationRepository = new ApplicationRepository();
