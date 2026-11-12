import { Types, Document } from 'mongoose';

export type OnboardingStatus = 
  | 'Pending'
  | 'In Progress'
  | 'Offer Accepted'
  | 'Verification Pending'
  | 'Contract Signed'
  | 'Provisioning'
  | 'Ready to Join'
  | 'Completed';

export type VerificationCheckStatus = 'Verified' | 'Pending' | 'Flagged' | 'In Progress';

export interface IBackgroundVerification {
  legal: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
  pcc: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
  immigration: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
  biometrics: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
  credentials: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
  digital: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
  postHire: { status: VerificationCheckStatus; verifiedBy?: string; verifiedAt?: string; notes?: string };
}

export interface IAssessmentTrait {
  trait: string;
  score: string;
  desc: string;
}

export interface IOnboardingAssessments {
  psychometric: {
    geniusScore: number;
    cognitiveSpeed: string;
    completionTime: string;
    status: string;
    traits: IAssessmentTrait[];
  };
  language: { score: string; status: string; notes?: string };
  performance: { score: string; status: string; notes?: string };
  technical: { score: string; status: string; notes?: string };
  at: { score: string; status: string; notes?: string };
}

export interface IOnboardingOffer {
  roleTitle: string;
  baseSalary: string;
  equity: string;
  bonus: string;
  signOnBonus?: string;
  offerDate: string;
  acceptanceDate?: string;
  status: 'Draft' | 'Sent' | 'Offer Accepted' | 'Declined';
}

export interface IOnboardingDocuments {
  contract: { status: 'Pending' | 'Drafted' | 'Signed'; signedDate?: string; docUrl?: string };
  nda: { status: 'Pending' | 'Drafted' | 'Signed'; signedDate?: string; docUrl?: string };
  custom: Array<{ name: string; status: string; docUrl?: string }>;
}

export interface IOnboardingProvisions {
  laptop: { assigned: boolean; model?: string; serialNo?: string; status?: string };
  workstation: { assigned: boolean; deskNo?: string; location?: string };
  simCard: { assigned: boolean; number?: string };
  creditCard: { assigned: boolean; cardType?: string };
  car: { assigned: boolean; vehicleNo?: string };
  homeOffice: { assigned: boolean; allowance?: number };
}

export interface IOnboardingBuddyManager {
  buddyName: string;
  buddyRole: string;
  managerName: string;
  managerRole: string;
  department: string;
  meetingScheduled: boolean;
}

export interface ITrainingModule {
  title: string;
  duration: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface IOnboardingVisa {
  visaType: string;
  passportNo: string;
  expiryDate: string;
  country: string;
  status: 'Applied' | 'In Review' | 'Approved' | 'Issued' | 'Not Required';
}

export interface IOnboardingInsurance {
  provider: string;
  policyNumber: string;
  coverageAmount: string;
  dependentsCount: number;
  status: 'Active' | 'Pending Enrolment' | 'Underwriting';
}

export interface IOnboardingMisc {
  association: string;
  corporateCard: boolean;
  specialRequests?: string;
}

export interface IOnboardingCandidate {
  _id?: string | Types.ObjectId;
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  startDate: string;
  status: OnboardingStatus;
  backgroundVerification: IBackgroundVerification;
  assessments: IOnboardingAssessments;
  offer: IOnboardingOffer;
  documents: IOnboardingDocuments;
  provisions: IOnboardingProvisions;
  buddyManager: IOnboardingBuddyManager;
  training: ITrainingModule[];
  visa: IOnboardingVisa;
  insurance: IOnboardingInsurance;
  miscellaneous: IOnboardingMisc;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IOnboardingCandidateDocument = Document & IOnboardingCandidate;

export interface CreateOnboardingCandidateDTO {
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  startDate?: string;
  status?: OnboardingStatus;
  baseSalary?: string;
  equity?: string;
  buddyName?: string;
  managerName?: string;
}

export interface OnboardingQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OnboardingReportSummary {
  totalOnboarding: number;
  completedCount: number;
  inProgressCount: number;
  verificationPendingCount: number;
  averageOnboardingDays: number;
  complianceRate: number;
}
