import { onboardingCandidateRepository, OnboardingCandidateRepository } from './onboardingCandidate.repository';
import { IOnboardingCandidateDocument, CreateOnboardingCandidateDTO, OnboardingQueryParams, OnboardingReportSummary } from '../onboarding.types';
import { AppError } from '../../../common/errors/AppError';

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

  async update(id: string, data: Partial<IOnboardingCandidateDocument>): Promise<IOnboardingCandidateDocument> {
    await this.getById(id);
    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async updateVerification(
    id: string,
    checkType: 'legal' | 'pcc' | 'immigration' | 'biometrics' | 'credentials' | 'digital' | 'postHire',
    status: 'Verified' | 'Pending' | 'Flagged' | 'In Progress',
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

  async updateOffer(id: string, offerData: any): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const offer = { ...candidate.offer, ...offerData };
    const updated = await this.repo.update(id, { offer });
    return updated!;
  }

  async updateDocument(id: string, docType: 'contract' | 'nda', status: 'Pending' | 'Drafted' | 'Signed', signedDate?: string, docUrl?: string): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const documents = { ...candidate.documents };
    documents[docType] = {
      status,
      signedDate: signedDate || (status === 'Signed' ? new Date().toISOString().split('T')[0] : ''),
      docUrl: docUrl || documents[docType]?.docUrl || `/docs/${docType}/${candidate.name.toLowerCase().replace(/\s+/g, '_')}_${docType}.pdf`,
    };
    const updated = await this.repo.update(id, { documents });
    return updated!;
  }

  async updateProvisions(id: string, provisionsData: any): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const provisions = { ...candidate.provisions, ...provisionsData };
    const updated = await this.repo.update(id, { provisions });
    return updated!;
  }

  async updateBuddyManager(id: string, buddyData: any): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const buddyManager = { ...candidate.buddyManager, ...buddyData };
    const updated = await this.repo.update(id, { buddyManager });
    return updated!;
  }

  async updateTraining(id: string, modules: any[]): Promise<IOnboardingCandidateDocument> {
    await this.getById(id);
    const updated = await this.repo.update(id, { training: modules });
    return updated!;
  }

  async updateVisa(id: string, visaData: any): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const visa = { ...candidate.visa, ...visaData };
    const updated = await this.repo.update(id, { visa });
    return updated!;
  }

  async updateInsurance(id: string, insuranceData: any): Promise<IOnboardingCandidateDocument> {
    const candidate = await this.getById(id);
    const insurance = { ...candidate.insurance, ...insuranceData };
    const updated = await this.repo.update(id, { insurance });
    return updated!;
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
