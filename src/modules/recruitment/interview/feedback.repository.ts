import { FeedbackModel } from './feedback.model';
import { IFeedbackDocument, CreateFeedbackDTO, UpdateFeedbackDTO } from './interview.types';

export class FeedbackRepository {
  async create(data: CreateFeedbackDTO): Promise<IFeedbackDocument> {
    const feedback = new FeedbackModel(data);
    return (await feedback.save()).populate(['interviewId', 'candidateId', 'interviewerEmployeeId']);
  }

  async findById(id: string): Promise<IFeedbackDocument | null> {
    return FeedbackModel.findById(id).populate(['interviewId', 'candidateId', 'interviewerEmployeeId']);
  }

  async findByInterviewId(interviewId: string): Promise<IFeedbackDocument[]> {
    return FeedbackModel.find({ interviewId }).populate(['candidateId', 'interviewerEmployeeId']);
  }

  async findByCandidateId(candidateId: string): Promise<IFeedbackDocument[]> {
    return FeedbackModel.find({ candidateId }).populate(['interviewId', 'interviewerEmployeeId']);
  }

  async update(id: string, data: UpdateFeedbackDTO): Promise<IFeedbackDocument | null> {
    return FeedbackModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate([
      'interviewId',
      'candidateId',
      'interviewerEmployeeId',
    ]);
  }

  async delete(id: string): Promise<IFeedbackDocument | null> {
    return FeedbackModel.findByIdAndDelete(id);
  }

  async findAll(params: { candidateId?: string; interviewId?: string; search?: string; status?: string; recommendation?: string }): Promise<IFeedbackDocument[]> {
    const query: any = {};
    if (params.candidateId) query.candidateId = params.candidateId;
    if (params.interviewId) query.interviewId = params.interviewId;
    if (params.recommendation) query.recommendation = params.recommendation;
    if (params.status) query.recommendation = params.status;
    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query.$or = [
        { candidateName: { $regex: s, $options: 'i' } },
        { interviewerName: { $regex: s, $options: 'i' } },
        { position: { $regex: s, $options: 'i' } },
      ];
    }
    return FeedbackModel.find(query).populate(['interviewId', 'candidateId', 'interviewerEmployeeId']).sort({ submittedAt: -1, createdAt: -1 });
  }
}

export const feedbackRepository = new FeedbackRepository();
