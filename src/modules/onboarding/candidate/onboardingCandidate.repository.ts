import { OnboardingCandidateModel } from './onboardingCandidate.model';
import { IOnboardingCandidateDocument, OnboardingQueryParams, OnboardingReportSummary } from '../onboarding.types';
import { escapeRegex } from '../../../common/utils/regex';

export class OnboardingCandidateRepository {
  async create(data: Partial<IOnboardingCandidateDocument>): Promise<IOnboardingCandidateDocument> {
    const item = new OnboardingCandidateModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IOnboardingCandidateDocument | null> {
    return OnboardingCandidateModel.findById(id);
  }

  async update(id: string, data: Partial<IOnboardingCandidateDocument>): Promise<IOnboardingCandidateDocument | null> {
    return OnboardingCandidateModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IOnboardingCandidateDocument | null> {
    return OnboardingCandidateModel.findByIdAndDelete(id);
  }

  async findAll(params: OnboardingQueryParams = {}): Promise<{ items: IOnboardingCandidateDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { role: regex },
        { department: regex },
        { candidateId: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.department && params.department !== 'All') {
      query.department = new RegExp(`^${escapeRegex(params.department)}$`, 'i');
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      OnboardingCandidateModel.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      OnboardingCandidateModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getReportsSummary(): Promise<OnboardingReportSummary> {
    await this.seedIfEmpty();
    const items = await OnboardingCandidateModel.find();
    const totalOnboarding = items.length;
    const completedCount = items.filter((i) => i.status === 'Completed').length;
    const inProgressCount = items.filter((i) => i.status === 'In Progress' || i.status === 'Offer Accepted' || i.status === 'Contract Signed').length;
    const verificationPendingCount = items.filter((i) => i.status === 'Verification Pending' || i.status === 'Pending').length;

    let totalChecks = 0;
    let verifiedChecks = 0;
    for (const item of items) {
      const bg = item.backgroundVerification;
      if (bg) {
        const checks = [bg.legal, bg.pcc, bg.immigration, bg.biometrics, bg.credentials, bg.digital, bg.postHire];
        for (const check of checks) {
          if (check) {
            totalChecks++;
            if (check.status === 'Verified') {
              verifiedChecks++;
            }
          }
        }
      }
    }
    const complianceRate = totalChecks > 0 ? Math.round((verifiedChecks / totalChecks) * 1000) / 10 : 100;

    let totalDays = 0;
    let countDays = 0;
    for (const item of items) {
      if (item.offer?.offerDate && item.startDate) {
        const start = new Date(item.startDate);
        const offer = new Date(item.offer.offerDate);
        if (!isNaN(start.getTime()) && !isNaN(offer.getTime()) && start.getTime() > offer.getTime()) {
          const diffDays = Math.round((start.getTime() - offer.getTime()) / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
          countDays++;
        }
      }
    }
    const averageOnboardingDays = countDays > 0 ? Math.round(totalDays / countDays) : 14;

    return {
      totalOnboarding,
      completedCount,
      inProgressCount,
      verificationPendingCount,
      averageOnboardingDays,
      complianceRate,
    };
  }

  async seedIfEmpty(): Promise<void> {
    const count = await OnboardingCandidateModel.countDocuments();
    if (count > 0) return;

    await OnboardingCandidateModel.insertMany([
      {
        candidateId: 'ONB-001',
        name: 'Aisha Kumar',
        email: 'aisha.kumar@example.com',
        phone: '+1 (555) 234-5678',
        role: 'Senior Frontend Engineer',
        department: 'Engineering',
        startDate: 'Sept 15, 2026',
        status: 'Offer Accepted',
        backgroundVerification: {
          legal: { status: 'Verified', verifiedBy: 'First Advantage API', verifiedAt: '2026-08-20', notes: 'Clear background' },
          pcc: { status: 'Verified', verifiedBy: 'First Advantage API', verifiedAt: '2026-08-20', notes: 'Clear police record' },
          immigration: { status: 'Verified', verifiedBy: 'USCIS Gateway', verifiedAt: '2026-08-21', notes: 'H-1B transfer approved' },
          biometrics: { status: 'Verified', verifiedBy: 'BioMatch Pro', verifiedAt: '2026-08-22', notes: 'Identity verified' },
          credentials: { status: 'Verified', verifiedBy: 'DegreeCheck Global', verifiedAt: '2026-08-22', notes: 'MS Computer Science verified' },
          digital: { status: 'Verified', verifiedBy: 'RiskAudit AI', verifiedAt: '2026-08-23', notes: 'Clean public profile' },
          postHire: { status: 'Pending', verifiedBy: '', verifiedAt: '', notes: 'Scheduled after 30 days' },
        },
        offer: {
          roleTitle: 'Senior Frontend Engineer',
          baseSalary: '$165,000',
          equity: '0.15%',
          bonus: '15% Annual Performance',
          signOnBonus: '$10,000',
          offerDate: '2026-08-10',
          acceptanceDate: '2026-08-14',
          status: 'Offer Accepted',
        },
        documents: {
          contract: { status: 'Signed', signedDate: '2026-08-15', docUrl: '/docs/contracts/aisha_contract.pdf' },
          nda: { status: 'Signed', signedDate: '2026-08-15', docUrl: '/docs/nda/aisha_nda.pdf' },
          custom: [],
        },
        provisions: {
          laptop: { assigned: true, model: 'MacBook Pro 16" M3 Max', serialNo: 'C02G8901L34', status: 'Dispatched' },
          workstation: { assigned: true, deskNo: 'Desk 4B-12', location: 'HQ Floor 4' },
          simCard: { assigned: true, number: '+1 (555) 389-9921' },
          creditCard: { assigned: true, cardType: 'Corporate Visa' },
          car: { assigned: false, vehicleNo: '' },
          homeOffice: { assigned: true, allowance: 1500 },
        },
        buddyManager: {
          buddyName: 'David Chen',
          buddyRole: 'Lead Frontend Architect',
          managerName: 'Sarah Jenkins',
          managerRole: 'VP of Engineering',
          department: 'Engineering',
          meetingScheduled: true,
        },
        visa: {
          visaType: 'H-1B Specialty Work Visa',
          passportNo: 'P8920114B',
          expiryDate: '2029-08-15',
          country: 'United States',
          status: 'Approved',
        },
        insurance: {
          provider: 'BlueCross Comprehensive Global Health',
          policyNumber: 'POL-90281489',
          coverageAmount: '$1,000,000',
          dependentsCount: 2,
          status: 'Active',
        },
        miscellaneous: {
          association: 'IEEE & ACM Professional Member',
          corporateCard: true,
          specialRequests: 'Ergonomic standing desk & dual 4K monitors',
        },
      },
      {
        candidateId: 'ONB-002',
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '+1 (555) 345-6789',
        role: 'Product Manager',
        department: 'Product',
        startDate: 'Sept 20, 2026',
        status: 'Verification Pending',
        backgroundVerification: {
          legal: { status: 'In Progress', verifiedBy: 'First Advantage API', verifiedAt: '', notes: 'Processing court records' },
          pcc: { status: 'Pending', verifiedBy: '', verifiedAt: '', notes: 'Awaiting local precinct' },
          immigration: { status: 'Verified', verifiedBy: 'USCIS Gateway', verifiedAt: '2026-08-22', notes: 'Citizen' },
          biometrics: { status: 'Verified', verifiedBy: 'BioMatch Pro', verifiedAt: '2026-08-22', notes: 'Match 100%' },
          credentials: { status: 'Verified', verifiedBy: 'DegreeCheck Global', verifiedAt: '2026-08-22', notes: 'MBA Stanford verified' },
          digital: { status: 'In Progress', verifiedBy: 'RiskAudit AI', verifiedAt: '', notes: 'Social scan in progress' },
          postHire: { status: 'Pending', verifiedBy: '', verifiedAt: '', notes: 'Pending start date' },
        },
        offer: {
          roleTitle: 'Product Manager',
          baseSalary: '$150,000',
          equity: '0.10%',
          bonus: '10% Annual',
          offerDate: '2026-08-12',
          status: 'Offer Accepted',
        },
        documents: {
          contract: { status: 'Drafted', signedDate: '', docUrl: '' },
          nda: { status: 'Drafted', signedDate: '', docUrl: '' },
          custom: [],
        },
        provisions: {
          laptop: { assigned: true, model: 'Lenovo ThinkPad X1 Carbon Gen 11', serialNo: 'PF-289012', status: 'Configured' },
          workstation: { assigned: true, deskNo: 'Desk 3A-08', location: 'HQ Floor 3' },
          simCard: { assigned: false, number: '' },
          creditCard: { assigned: false, cardType: '' },
          car: { assigned: false, vehicleNo: '' },
          homeOffice: { assigned: true, allowance: 1200 },
        },
        buddyManager: {
          buddyName: 'Rachel Green',
          buddyRole: 'Senior Product Manager',
          managerName: 'Alex Rivera',
          managerRole: 'Director of Product',
          department: 'Product',
          meetingScheduled: true,
        },
        visa: {
          visaType: 'US Citizen',
          passportNo: 'A7829102C',
          expiryDate: '2032-11-20',
          country: 'United States',
          status: 'Not Required',
        },
        insurance: {
          provider: 'Aetna International Gold',
          policyNumber: 'AET-7829102',
          coverageAmount: '$750,000',
          dependentsCount: 1,
          status: 'Pending Enrolment',
        },
        miscellaneous: {
          association: 'Product Management Guild',
          corporateCard: false,
          specialRequests: 'Noise-canceling headphones',
        },
      },
      {
        candidateId: 'ONB-003',
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1 (555) 456-7890',
        role: 'DevOps Specialist',
        department: 'Infrastructure',
        startDate: 'Oct 01, 2026',
        status: 'Contract Signed',
        backgroundVerification: {
          legal: { status: 'Verified', verifiedBy: 'First Advantage API', verifiedAt: '2026-08-18', notes: 'Clear' },
          pcc: { status: 'Verified', verifiedBy: 'First Advantage API', verifiedAt: '2026-08-18', notes: 'Clear' },
          immigration: { status: 'Verified', verifiedBy: 'GlobalPass', verifiedAt: '2026-08-19', notes: 'O-1 Visa approved' },
          biometrics: { status: 'Verified', verifiedBy: 'BioMatch Pro', verifiedAt: '2026-08-19', notes: 'Clear' },
          credentials: { status: 'Verified', verifiedBy: 'DegreeCheck Global', verifiedAt: '2026-08-20', notes: 'BS Computer Engineering' },
          digital: { status: 'Verified', verifiedBy: 'RiskAudit AI', verifiedAt: '2026-08-20', notes: 'Clear' },
          postHire: { status: 'Pending', verifiedBy: '', verifiedAt: '', notes: '' },
        },
        offer: {
          roleTitle: 'DevOps Specialist',
          baseSalary: '$170,000',
          equity: '0.18%',
          bonus: '12% Annual',
          offerDate: '2026-08-08',
          acceptanceDate: '2026-08-11',
          status: 'Offer Accepted',
        },
        documents: {
          contract: { status: 'Signed', signedDate: '2026-08-12', docUrl: '/docs/contracts/elena_contract.pdf' },
          nda: { status: 'Signed', signedDate: '2026-08-12', docUrl: '/docs/nda/elena_nda.pdf' },
          custom: [],
        },
        provisions: {
          laptop: { assigned: true, model: 'MacBook Pro 16" M3 Max', serialNo: 'C02H1102K88', status: 'Ready for Pickup' },
          workstation: { assigned: true, deskNo: 'Desk 4A-01', location: 'HQ Floor 4' },
          simCard: { assigned: true, number: '+1 (555) 890-1122' },
          creditCard: { assigned: true, cardType: 'Corporate Visa' },
          car: { assigned: false, vehicleNo: '' },
          homeOffice: { assigned: true, allowance: 1500 },
        },
        buddyManager: {
          buddyName: 'Liam O’Connor',
          buddyRole: 'Principal Cloud Engineer',
          managerName: 'Sarah Jenkins',
          managerRole: 'VP of Engineering',
          department: 'Infrastructure',
          meetingScheduled: true,
        },
        visa: {
          visaType: 'O-1 Extraordinary Ability',
          passportNo: 'E9018273D',
          expiryDate: '2030-05-10',
          country: 'United States',
          status: 'Approved',
        },
        insurance: {
          provider: 'BlueCross Comprehensive Global Health',
          policyNumber: 'POL-90281490',
          coverageAmount: '$1,000,000',
          dependentsCount: 0,
          status: 'Active',
        },
        miscellaneous: {
          association: 'Cloud Native Computing Foundation Ambassador',
          corporateCard: true,
          specialRequests: 'Linux dev workstation and YubiKeys',
        },
      },
    ]);
  }
}

export const onboardingCandidateRepository = new OnboardingCandidateRepository();
