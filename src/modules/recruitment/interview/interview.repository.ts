import { InterviewModel } from './interview.model';
import { IInterviewDocument, CreateInterviewDTO, UpdateInterviewDTO, InterviewQueryParams } from './interview.types';

export class InterviewRepository {
  async create(data: CreateInterviewDTO): Promise<IInterviewDocument> {
    const interview = new InterviewModel(data);
    return (await interview.save()).populate(['candidateId', 'vacancyId', 'applicationId']);
  }

  async findById(id: string): Promise<IInterviewDocument | null> {
    return InterviewModel.findById(id).populate(['candidateId', 'vacancyId', 'applicationId']);
  }

  async update(id: string, data: UpdateInterviewDTO): Promise<IInterviewDocument | null> {
    return InterviewModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate([
      'candidateId',
      'vacancyId',
      'applicationId',
    ]);
  }

  async delete(id: string): Promise<IInterviewDocument | null> {
    return InterviewModel.findByIdAndDelete(id);
  }

  async findAll(params: InterviewQueryParams): Promise<{ items: IInterviewDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { roundName: { $regex: params.search, $options: 'i' } },
        { notes: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.candidateId) {
      query.candidateId = params.candidateId;
    }

    if (params.vacancyId) {
      query.vacancyId = params.vacancyId;
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.interviewType) {
      query.interviewType = params.interviewType;
    }

    if (params.result) {
      query.result = params.result;
    }

    if (params.fromDate || params.toDate) {
      query.interviewDate = {};
      if (params.fromDate) {
        query.interviewDate.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        query.interviewDate.$lte = new Date(params.toDate);
      }
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'interviewDate';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      InterviewModel.find(query)
        .populate(['candidateId', 'vacancyId', 'applicationId'])
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      InterviewModel.countDocuments(query),
    ]);

    return { items, total };
  }
}

export const interviewRepository = new InterviewRepository();
