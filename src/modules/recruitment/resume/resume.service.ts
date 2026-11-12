import { ResumeRepository, resumeRepository } from './resume.repository';
import {
  CreateResumeDTO,
  UpdateResumeDTO,
  ResumeQueryParams,
  IResume,
  ParseCvRequestDTO,
} from './resume.types';
import { cvParserService } from './cvParser.service';
import { AppError } from '../../../common/errors/AppError';

export class ResumeService {
  constructor(private repo: ResumeRepository = resumeRepository) {}

  async createResume(dto: CreateResumeDTO): Promise<IResume> {
    const created = await this.repo.create(dto);
    return created.toJSON() as unknown as IResume;
  }

  async getResumeById(id: string): Promise<IResume> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new AppError('Resume not found', 404);
    }
    return item.toJSON() as unknown as IResume;
  }

  async updateResume(id: string, dto: UpdateResumeDTO): Promise<IResume> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Resume not found', 404);
    }
    return updated.toJSON() as unknown as IResume;
  }

  async deleteResume(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Resume not found', 404);
    }
  }

  async getAllResumes(params: ResumeQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IResume),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async parseAndProcessCv(dto: ParseCvRequestDTO): Promise<{
    parsedData: any;
    matchScore: number;
    resume?: IResume;
  }> {
    const rawText = dto.rawText || '';
    const parsed = cvParserService.parseText(rawText);
    const score = await cvParserService.calculateMatchScore(parsed, dto.vacancyId, dto.targetSkills);

    let resumeRecord: IResume | undefined;
    if (parsed.name || dto.fileName) {
      const candidateName = parsed.name || 'Candidate';
      const created = await this.repo.create({
        candidateName,
        email: parsed.email,
        phone: parsed.phone,
        title: parsed.title,
        skills: parsed.skills,
        experienceYears: parsed.experienceYears,
        education: parsed.education,
        workExperience: parsed.workExperience,
        rawText,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        matchedVacancyId: dto.vacancyId,
        matchScore: score,
        status: 'Parsed',
      });
      resumeRecord = created.toJSON() as unknown as IResume;
    }

    return {
      parsedData: parsed,
      matchScore: score,
      resume: resumeRecord,
    };
  }

  async matchWithVacancy(resumeId: string, vacancyId: string): Promise<IResume> {
    const resume = await this.repo.findById(resumeId);
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    const parsedData = resume.parsedData || {
      name: resume.candidateName,
      title: resume.title,
      skills: resume.skills,
      experienceYears: resume.experienceYears,
      education: resume.education,
      workExperience: resume.workExperience,
    };

    const matchScore = await cvParserService.calculateMatchScore(parsedData, vacancyId);
    const updated = await this.repo.update(resumeId, {
      matchedVacancyId: vacancyId,
      matchScore,
    });

    return updated!.toJSON() as unknown as IResume;
  }
}

export const resumeService = new ResumeService();
