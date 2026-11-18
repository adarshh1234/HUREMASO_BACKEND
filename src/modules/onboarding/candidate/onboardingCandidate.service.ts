import { onboardingCandidateRepository, OnboardingCandidateRepository } from './onboardingCandidate.repository';
import {
  IOnboardingCandidateDocument,
  CreateOnboardingCandidateDTO,
  OnboardingQueryParams,
  OnboardingReportSummary,
  IOnboardingOffer,
  IOnboardingProvisions,
  IOnboardingBuddyManager,
  ITrainingModule,
  IOnboardingVisa,
  IOnboardingInsurance,
  VerificationCheckStatus,
} from '../onboarding.types';
import { AppError } from '../../../common/errors/AppError';
import { employeeService } from '../../employee/employee.service';
import { employeeRepository } from '../../employee/employee.repository';
import { createEmployeeSchema } from '../../employee/employee.validator';

export class OnboardingCandidateService {
  constructor(private repo: OnboardingCandidateRepository = onboardingCandidateRepository) {}

  async getAll(query: OnboardingQueryParams): Promise<{ items: IOnboardingCandidateDocument[]; total: number }> {
    return this.repo.findAll(query);
  }

  async getById(id: string): Promise<IOnboardingCandidateDocument> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw AppError.notFound(`Onboarding candidate with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: CreateOnboardingCandidateDTO): Promise<IOnboardingCandidateDocument> {
    const candidateId = `ONB-${Math.floor(100 + Math.random() * 900)}`;
    const startDate = data.startDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    return this.repo.create({
      ...data,
      candidateId,
      startDate,
      status: data.status || 'Offer Accepted',
      offer: {
        roleTitle: data.role,
        baseSalary: data.baseSalary || '$150,000',
        equity: data.equity || '0.10%',
        bonus: '10% Annual',
        offerDate: new Date().toISOString().split('T')[0],
        status: 'Offer Accepted',
      },
      buddyManager: {
        buddyName: data.buddyName || 'Team Lead',
        buddyRole: 'Senior Engineer',
        managerName: data.managerName || 'Engineering Director',
        managerRole: 'Director',
        department: data.department,
        meetingScheduled: false,
      },
    });
  }

  validateReadyToJoin(candidate: IOnboardingCandidateDocument): { valid: boolean; missingRequirements: string[] } {
    const missing: string[] = [];
    const bg = candidate.backgroundVerification;
    if (bg) {
      for (const [key, val] of Object.entries(bg)) {
        if (val && typeof val === 'object' && 'status' in val && val.status === 'Flagged') {
          missing.push(`Background verification is flagged for ${key}`);
        }
      }
    }

    if (candidate.documents?.contract?.status !== 'Signed') {
      missing.push('Employment Contract must be signed');
    }
    if (candidate.documents?.nda?.status !== 'Signed') {
      missing.push('NDA must be signed');
    }

    return {
      valid: missing.length === 0,
      missingRequirements: missing,
    };
  }

  async update(id: string, data: Partial<IOnboardingCandidateDocument>): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    if (data.status === 'Ready to Join') {
      const validation = this.validateReadyToJoin(candidate);
      if (!validation.valid) {
        throw AppError.badRequest(
          `Cannot mark candidate as 'Ready to Join': ${validation.missingRequirements.join('; ')}`
        );
      }
    }
    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async updateVerification(
    id: string,
    checkType: 'legal' | 'pcc' | 'immigration' | 'biometrics' | 'credentials' | 'digital' | 'postHire',
    status: VerificationCheckStatus,
    notes?: string,
    verifiedBy?: string
  ): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const bg = { ...candidate.backgroundVerification };
    bg[checkType] = {
      status,
      notes: notes || bg[checkType]?.notes || '',
      verifiedBy: verifiedBy || (status === 'Verified' ? 'First Advantage API' : ''),
      verifiedAt: status === 'Verified' ? new Date().toISOString().split('T')[0] : '',
    };
    const updated = await this.repo.update(id, { backgroundVerification: bg });
    return updated!;
  }

  async updateOffer(id: string, offerData: Partial<IOnboardingOffer>): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const offer = { ...candidate.offer, ...offerData };
    const updated = await this.repo.update(id, { offer });
    return updated!;
  }

  async updateDocument(id: string, docType: 'contract' | 'nda' | 'custom', status: 'Pending' | 'Drafted' | 'Signed', signedDate?: string, docUrl?: string): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const documents = { ...candidate.documents };
    if (docType === 'contract' || docType === 'nda') {
      documents[docType] = {
        status,
        signedDate: signedDate || (status === 'Signed' ? new Date().toISOString().split('T')[0] : ''),
        docUrl: docUrl || documents[docType]?.docUrl || `/docs/${docType}/${candidate.name.toLowerCase().replace(/\s+/g, '_')}_${docType}.pdf`,
      };
    }
    const updated = await this.repo.update(id, { documents });
    return updated!;
  }

  async updateProvisions(id: string, provisionsData: Partial<IOnboardingProvisions>): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const provisions = { ...candidate.provisions, ...provisionsData };
    const updated = await this.repo.update(id, { provisions });
    return updated!;
  }

  async updateBuddyManager(id: string, buddyData: Partial<IOnboardingBuddyManager>): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const buddyManager = { ...candidate.buddyManager, ...buddyData };
    const updated = await this.repo.update(id, { buddyManager });
    return updated!;
  }

  async updateTraining(id: string, modules: ITrainingModule[]): Promise<IOnboardingCandidateDocument> {
    await this.getById(id);
    const updated = await this.repo.update(id, { training: modules });
    return updated!;
  }

  async updateVisa(id: string, visaData: Partial<IOnboardingVisa>): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const visa = { ...candidate.visa, ...visaData };
    const updated = await this.repo.update(id, { visa });
    return updated!;
  }

  async updateInsurance(id: string, insuranceData: Partial<IOnboardingInsurance>): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const insurance = { ...candidate.insurance, ...insuranceData };
    const updated = await this.repo.update(id, { insurance });
    return updated!;
  }

  async convertToEmployee(id: string): Promise<{ employee: unknown; candidate: IOnboardingCandidateDocument }> {
    const candidate = await this.getById(id);
    const nameParts = candidate.name.trim().split(' ');
    const firstName = nameParts[0] || 'Employee';
    const lastName = nameParts.slice(1).join(' ') || 'Onboarded';

    const validatedEmployeeData = createEmployeeSchema.parse({
      firstName,
      lastName,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || '+1-555-0199',
      department: candidate.department || 'Engineering',
      jobTitle: candidate.role || 'Software Engineer',
      location: 'Headquarters',
      employmentStatus: 'Full-Time Permanent',
      attendanceStatus: 'Present',
      category: 'staff',
    });

    let createdEmployee;
    try {
      createdEmployee = await employeeService.createEmployee(validatedEmployeeData);
    } catch {
      const existing = await employeeRepository.findByEmail(candidate.email);
      if (existing) {
        createdEmployee = existing;
      } else {
        throw AppError.badRequest(`Could not create employee for ${candidate.name}`);
      }
    }

    const updated = await this.repo.update(id, { status: 'Completed' });
    return {
      employee: createdEmployee,
      candidate: updated!,
    };
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async getReportsSummary(): Promise<OnboardingReportSummary> {
    return this.repo.getReportsSummary();
  }
}

export const onboardingCandidateService = new OnboardingCandidateService();
