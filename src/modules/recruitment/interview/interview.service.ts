import { InterviewRepository, interviewRepository } from './interview.repository';
import {
  CreateInterviewDTO,
  UpdateInterviewDTO,
  InterviewQueryParams,
  IInterview,
} from './interview.types';
import { CandidateModel } from '../candidate/candidate.model';
import { VacancyModel } from '../vacancy/vacancy.model';
import { ApplicationModel } from '../application/application.model';
import { NotificationService } from '../../notification/notification.service';
import { NotificationChannel, RecipientType } from '../../notification/notification.types';
import { AppError } from '../../../common/errors/AppError';

export class InterviewService {
  private notificationService: NotificationService;

  constructor(
    private repo: InterviewRepository = interviewRepository,
    notificationService?: NotificationService
  ) {
    this.notificationService = notificationService || new NotificationService();
  }

  async createInterview(dto: CreateInterviewDTO): Promise<IInterview> {
    const candidate = await CandidateModel.findById(dto.candidateId);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    if (dto.vacancyId) {
      const vacancy = await VacancyModel.findById(dto.vacancyId);
      if (!vacancy) {
        throw new AppError('Vacancy not found', 404);
      }
    }

    const created = await this.repo.create({
      ...dto,
      status: dto.status || 'Scheduled',
      result: 'Pending',
    });

    // Synchronize candidate status
    await CandidateModel.findByIdAndUpdate(dto.candidateId, {
      $set: { status: 'Interview Scheduled' },
    });

    // Synchronize application status if applicationId provided
    if (dto.applicationId) {
      await ApplicationModel.findByIdAndUpdate(dto.applicationId, {
        $set: {
          status: 'Interview Scheduled',
          currentStage: dto.roundName,
        },
        $push: {
          statusHistory: {
            status: 'Interview Scheduled',
            stage: dto.roundName,
            changedAt: new Date(),
            changedBy: 'System',
            comment: `Interview scheduled for ${new Date(dto.interviewDate).toLocaleDateString()} (${dto.roundName})`,
          },
        },
      });
    }

    // Attempt to create interview notification
    try {
      const candName = candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
      await this.notificationService.createNotification({
        subject: `Interview Scheduled: ${candName}`,
        message: `Round '${dto.roundName}' has been scheduled on ${new Date(dto.interviewDate).toLocaleDateString()} at ${dto.startTime || 'TBD'}. Mode: ${dto.mode || 'Online'}.`,
        channel: NotificationChannel.EMAIL,
        recipients: candidate.email || 'Candidate',
        recipientType: RecipientType.ALL_EMPLOYEES,
      });
    } catch {
      // Notification creation shouldn't block interview creation
    }

    return created.toJSON() as unknown as IInterview;
  }

  async getInterviewById(id: string): Promise<IInterview> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Interview not found', 404);
    }
    return item.toJSON() as unknown as IInterview;
  }

  async updateInterview(id: string, dto: UpdateInterviewDTO): Promise<IInterview> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Interview not found', 404);
    }

    // If interview result is updated
    if (dto.result && updated.candidateId) {
      const candId = typeof updated.candidateId === 'object' ? updated.candidateId._id || updated.candidateId.id : updated.candidateId;
      if (candId) {
        if (dto.result === 'Passed') {
          await CandidateModel.findByIdAndUpdate(candId, { $set: { status: 'Interview Passed' } });
        } else if (dto.result === 'Failed') {
          await CandidateModel.findByIdAndUpdate(candId, { $set: { status: 'Interview Failed' } });
        }
      }
    }

    return updated.toJSON() as unknown as IInterview;
  }

  async deleteInterview(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Interview not found', 404);
    }
  }

  async getAllInterviews(params: InterviewQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IInterview),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }
}

export const interviewService = new InterviewService();
