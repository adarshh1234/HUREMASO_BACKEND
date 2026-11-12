import { FeedbackRepository, feedbackRepository } from './feedback.repository';
import { CreateFeedbackDTO, UpdateFeedbackDTO, IFeedback } from './interview.types';
import { InterviewModel } from './interview.model';
import { CandidateModel } from '../candidate/candidate.model';
import { AppError } from '../../../common/errors/AppError';

export class FeedbackService {
  constructor(private repo: FeedbackRepository = feedbackRepository) {}

  async createFeedback(dto: CreateFeedbackDTO): Promise<IFeedback> {
    const interview = await InterviewModel.findById(dto.interviewId);
    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    const candidate = await CandidateModel.findById(dto.candidateId);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const created = await this.repo.create(dto);

    // Update interview status to Completed and feedbackSubmitted = true
    const resultStatus =
      dto.recommendation === 'Strong Hire' || dto.recommendation === 'Hire'
        ? 'Passed'
        : dto.recommendation === 'Reject'
        ? 'Failed'
        : 'On Hold';

    await InterviewModel.findByIdAndUpdate(dto.interviewId, {
      $set: {
        feedbackSubmitted: true,
        status: 'Completed',
        rating: dto.overallRating,
        result: resultStatus,
      },
    });

    return created.toJSON() as unknown as IFeedback;
  }

  async getFeedbackById(id: string): Promise<IFeedback> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Feedback not found', 404);
    }
    return item.toJSON() as unknown as IFeedback;
  }

  async getFeedbackByInterview(interviewId: string): Promise<IFeedback[]> {
    const items = await this.repo.findByInterviewId(interviewId);
    return items.map((i) => i.toJSON() as unknown as IFeedback);
  }

  async getFeedbackByCandidate(candidateId: string): Promise<IFeedback[]> {
    const items = await this.repo.findByCandidateId(candidateId);
    return items.map((i) => i.toJSON() as unknown as IFeedback);
  }

  async updateFeedback(id: string, dto: UpdateFeedbackDTO): Promise<IFeedback> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Feedback not found', 404);
    }
    return updated.toJSON() as unknown as IFeedback;
  }

  async deleteFeedback(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Feedback not found', 404);
    }
  }

  async getAllFeedback(params: { candidateId?: string; interviewId?: string }): Promise<IFeedback[]> {
    const items = await this.repo.findAll(params);
    return items.map((i) => i.toJSON() as unknown as IFeedback);
  }
}

export const feedbackService = new FeedbackService();
