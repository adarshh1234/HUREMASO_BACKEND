import { CandidateRepository, candidateRepository } from './candidate.repository';
import { CreateCandidateDTO, UpdateCandidateDTO, CandidateQueryParams, ICandidate } from './candidate.types';
import { AppError } from '../../../common/errors/AppError';
import { employeeService } from '../../employee/employee.service';
import { createEmployeeSchema } from '../../employee/employee.validator';

export class CandidateService {
  constructor(private repo: CandidateRepository = candidateRepository) {}

  async createCandidate(dto: CreateCandidateDTO): Promise<ICandidate> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing && !existing.isArchived) {
      throw new AppError(`A candidate with email "${dto.email}" already exists`, 409);
    }

    const payload = { ...dto };
    if (!payload.name && (payload.firstName || payload.lastName)) {
      payload.name = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
    }
    if (!payload.phone && payload.contactNumber) {
      payload.phone = payload.contactNumber;
    }

    const created = await this.repo.create(payload as any);
    return created.toJSON() as unknown as ICandidate;
  }

  async getCandidateById(id: string): Promise<ICandidate> {
    const candidate = await this.repo.findById(id);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }
    return candidate.toJSON() as unknown as ICandidate;
  }

  async updateCandidate(id: string, dto: UpdateCandidateDTO): Promise<ICandidate> {
    if (dto.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing && existing._id.toString() !== id) {
        throw new AppError(`Email "${dto.email}" is already taken by another candidate`, 409);
      }
    }
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Candidate not found', 404);
    }
    return updated.toJSON() as unknown as ICandidate;
  }

  async updateCandidateStatus(id: string, status: ICandidate['status']): Promise<ICandidate> {
    return this.updateCandidate(id, { status });
  }

  async deleteCandidate(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new AppError('Candidate not found', 404);
    }
  }

  async getAllCandidates(params: CandidateQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as ICandidate),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async convertToEmployee(
    candidateId: string,
    options?: {
      departmentId?: string;
      jobTitleId?: string;
      department?: string;
      jobTitle?: string;
      location?: string;
      employeeId?: string;
      category?: string;
    }
  ) {
    const candidate = await this.getCandidateById(candidateId);

    const fullName = candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
    const nameParts = fullName.split(' ');
    const firstName = candidate.firstName || nameParts[0] || 'Candidate';
    const lastName = candidate.lastName || nameParts.slice(1).join(' ') || 'Employee';

    const validatedEmployeeData = createEmployeeSchema.parse({
      employeeId: options?.employeeId,
      firstName,
      lastName,
      name: fullName,
      email: candidate.email,
      phone: candidate.phone || candidate.contactNumber || '+1-555-0199',
      departmentId: options?.departmentId,
      jobTitleId: options?.jobTitleId,
      department: options?.department || 'Engineering',
      jobTitle: options?.jobTitle || candidate.jobTitle || 'Software Engineer',
      location: options?.location || candidate.location || 'Headquarters',
      employmentStatus: 'Full-Time Permanent',
      attendanceStatus: 'Present',
      category: (options?.category as any) || 'staff',
    });

    const createdEmployee = await employeeService.createEmployee(validatedEmployeeData);

    const empId = createdEmployee._id?.toString() || createdEmployee.id?.toString() || createdEmployee.employeeId;
    await this.updateCandidate(candidateId, {
      status: 'Hired',
      employeeId: empId,
    });

    const updatedCandidate = await this.getCandidateById(candidateId);

    return {
      employee: createdEmployee,
      candidate: updatedCandidate,
    };
  }

  async progressStage(id: string, stage: string, notes?: string): Promise<ICandidate> {
    const validStages = [
      'Applied',
      'Application Initiated',
      'Screened',
      'Shortlisted',
      'Interview',
      'Interview Scheduled',
      'Interview Passed',
      'Interview Failed',
      'Selected',
      'Offered',
      'Job Offered',
      'Onboarding',
      'Hired',
      'Rejected',
    ];

    if (!validStages.includes(stage)) {
      throw new AppError(`Invalid stage: ${stage}. Valid stages are: ${validStages.join(', ')}`, 400);
    }

    const candidate = await this.getCandidateById(id);
    const existingNotes = candidate.notes ? `${candidate.notes}\n` : '';
    const noteEntry = notes ? `[${new Date().toISOString().split('T')[0]}] Stage -> ${stage}: ${notes}` : `[${new Date().toISOString().split('T')[0]}] Stage -> ${stage}`;
    const updatedNotes = `${existingNotes}${noteEntry}`;

    return this.updateCandidate(id, {
      status: stage as any,
      notes: updatedNotes,
    });
  }

  async getPipelineMetrics(vacancyId?: string) {
    const filter: any = { isArchived: false };
    if (vacancyId) {
      filter.vacancyId = vacancyId;
    }

    const candidates = await this.repo.findAll({ ...filter, limit: 10000 });
    const all = candidates.items;

    let applied = 0;
    let screened = 0;
    let shortlisted = 0;
    let interview = 0;
    let offered = 0;
    let hired = 0;
    let rejected = 0;

    all.forEach((cand) => {
      const s = cand.status || 'Applied';
      if (s === 'Hired' || s === 'Onboarding') hired++;
      else if (s.includes('Offer') || s === 'Selected') offered++;
      else if (s.includes('Interview')) interview++;
      else if (s === 'Shortlisted') shortlisted++;
      else if (s === 'Screened') screened++;
      else if (s === 'Rejected') rejected++;
      else applied++;
    });

    const total = all.length;
    const interviewCount = interview + offered + hired;
    const offeredCount = offered + hired;

    return {
      totalCandidates: total,
      stages: {
        applied,
        screened,
        shortlisted,
        interview,
        offered,
        hired,
        rejected,
      },
      conversionRates: {
        applicationToInterviewRate: total > 0 ? Number(((interviewCount / total) * 100).toFixed(1)) : 0,
        interviewToOfferRate: interviewCount > 0 ? Number(((offeredCount / interviewCount) * 100).toFixed(1)) : 0,
        offerAcceptanceRate: offeredCount > 0 ? Number(((hired / offeredCount) * 100).toFixed(1)) : 0,
      },
    };
  }
}

export const candidateService = new CandidateService();
