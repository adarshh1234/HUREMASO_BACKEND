import { FeedbackRepository, feedbackRepository } from './feedback.repository';
import { CreateFeedbackDTO, UpdateFeedbackDTO, IFeedback } from './interview.types';
import { InterviewModel } from './interview.model';
import { CandidateModel } from '../candidate/candidate.model';
import { AppError } from '../../../common/errors/AppError';

export class FeedbackService {
  constructor(private repo: FeedbackRepository = feedbackRepository) {}

  async createFeedback(dto: CreateFeedbackDTO): Promise<IFeedback> {
    const payload = { ...dto };

    // 1. Resolve candidate
    let candidate = null;
    if (payload.candidateId) {
      candidate = await CandidateModel.findById(payload.candidateId);
    } else if (payload.candidateName) {
      candidate = await CandidateModel.findOne({
        $or: [
          { name: new RegExp(`^${payload.candidateName.trim()}$`, 'i') },
          { firstName: new RegExp(`^${payload.candidateName.trim()}$`, 'i') },
        ],
      });
      if (candidate) {
        payload.candidateId = candidate._id.toString();
      }
    }

    if (candidate) {
      if (!payload.candidateName) payload.candidateName = candidate.name;
      if (!payload.position) payload.position = candidate.jobTitle || candidate.vacancy || 'Engineering';
    }

    const resultStatus =
      payload.recommendation === 'Strong Hire' || payload.recommendation === 'Hire'
        ? 'Passed'
        : payload.recommendation === 'Reject'
        ? 'Failed'
        : 'On Hold';

    // 2. Resolve or auto-link interview
    if (payload.interviewId) {
      const interview = await InterviewModel.findById(payload.interviewId);
      if (interview) {
        await InterviewModel.findByIdAndUpdate(payload.interviewId, {
          $set: {
            feedbackSubmitted: true,
            status: 'Completed',
            rating: payload.overallRating,
            result: resultStatus,
          },
        });
      }
    } else if (candidate) {
      // Auto-create interview record to connect the complete workflow
      const autoInterview = await InterviewModel.create({
        candidateId: candidate._id,
        vacancyId: candidate.vacancyId,
        roundName: 'Technical & Culture Assessment',
        interviewDate: payload.interviewDate ? new Date(payload.interviewDate) : new Date(),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        interviewers: [{ name: payload.interviewerName || 'Interviewer' }],
        interviewType: 'Technical',
        status: 'Completed',
        feedbackSubmitted: true,
        rating: payload.overallRating,
        result: resultStatus,
      });
      payload.interviewId = autoInterview._id.toString();
    }

    const created = await this.repo.create(payload as any);

    // 3. Synchronize candidate status
    if (candidate) {
      const newStatus =
        payload.recommendation === 'Strong Hire' || payload.recommendation === 'Hire'
          ? 'Interview Passed'
          : payload.recommendation === 'Reject'
          ? 'Rejected'
          : 'Interview';
      await CandidateModel.findByIdAndUpdate(candidate._id, { $set: { status: newStatus } });
    }

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

  async getAllFeedback(params: { candidateId?: string; interviewId?: string; search?: string; status?: string; recommendation?: string }): Promise<IFeedback[]> {
    const items = await this.repo.findAll(params);
    return items.map((i) => i.toJSON() as unknown as IFeedback);
  }
}

export const feedbackService = new FeedbackService();
