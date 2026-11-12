import { Schema, model } from 'mongoose';
import { IOnboardingCandidateDocument } from '../onboarding.types';

const defaultVerificationItem = {
  status: 'Pending',
  verifiedBy: '',
  verifiedAt: '',
  notes: '',
};

const trainingModuleSchema = new Schema(
  {
    title: { type: String, required: true },
    duration: { type: String, required: true },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  },
  { _id: false }
);

const assessmentTraitSchema = new Schema(
  {
    trait: { type: String, required: true },
    score: { type: String, required: true },
    desc: { type: String, required: true },
  },
  { _id: false }
);

const onboardingCandidateSchema = new Schema<IOnboardingCandidateDocument>(
  {
    candidateId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String, required: true },
    phone: { type: String },
    role: { type: String, required: true, index: true },
    department: { type: String, required: true, default: 'Engineering', index: true },
    startDate: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'Pending',
        'In Progress',
        'Offer Accepted',
        'Verification Pending',
        'Contract Signed',
        'Provisioning',
        'Ready to Join',
        'Completed',
      ],
      default: 'In Progress',
      index: true,
    },
    backgroundVerification: {
      legal: { type: Object, default: defaultVerificationItem },
      pcc: { type: Object, default: defaultVerificationItem },
      immigration: { type: Object, default: defaultVerificationItem },
      biometrics: { type: Object, default: defaultVerificationItem },
      credentials: { type: Object, default: defaultVerificationItem },
      digital: { type: Object, default: defaultVerificationItem },
      postHire: { type: Object, default: defaultVerificationItem },
    },
    assessments: {
      psychometric: {
        geniusScore: { type: Number, default: 94 },
        cognitiveSpeed: { type: String, default: '1.45x Fast' },
        completionTime: { type: String, default: '22 mins' },
        status: { type: String, default: 'Completed' },
        traits: {
          type: [assessmentTraitSchema],
          default: [
            { trait: 'Analytical Problem Solving', score: '96%', desc: 'Exceptional capacity for breaking down complex architectural challenges.' },
            { trait: 'Emotional Stability & Stress Tolerance', score: '91%', desc: 'High composure under tight project delivery deadlines.' },
            { trait: 'Team Collaboration & Empathy', score: '94%', desc: 'Strong active listening skills and collaborative mindset.' },
          ],
        },
      },
      language: { type: Object, default: { score: '98% Native C2', status: 'Passed', notes: 'Fluent in English and German' } },
      performance: { type: Object, default: { score: 'Top Tier 95%', status: 'Passed', notes: 'Demonstrated high aptitude in system design case study' } },
      technical: { type: Object, default: { score: '98%', status: 'Passed', notes: 'Full-stack TypeScript and React benchmark' } },
      at: { type: Object, default: { score: 'Verified A+', status: 'Passed', notes: 'Architecture and Threat modeling passed' } },
    },
    offer: {
      roleTitle: { type: String, default: '' },
      baseSalary: { type: String, default: '$165,000' },
      equity: { type: String, default: '0.15%' },
      bonus: { type: String, default: '15% Annual' },
      signOnBonus: { type: String, default: '$10,000' },
      offerDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
      acceptanceDate: { type: String },
      status: { type: String, enum: ['Draft', 'Sent', 'Offer Accepted', 'Declined'], default: 'Offer Accepted' },
    },
    documents: {
      contract: { type: Object, default: { status: 'Drafted', signedDate: '', docUrl: '' } },
      nda: { type: Object, default: { status: 'Drafted', signedDate: '', docUrl: '' } },
      custom: { type: Array, default: [] },
    },
    provisions: {
      laptop: { type: Object, default: { assigned: true, model: 'MacBook Pro 16" M3 Max', serialNo: 'C02G8901L34', status: 'Dispatched' } },
      workstation: { type: Object, default: { assigned: true, deskNo: 'Desk 4B-12', location: 'HQ Floor 4' } },
      simCard: { type: Object, default: { assigned: true, number: '+1 (555) 389-9921' } },
      creditCard: { type: Object, default: { assigned: false, cardType: 'Corporate Visa' } },
      car: { type: Object, default: { assigned: false, vehicleNo: '' } },
      homeOffice: { type: Object, default: { assigned: true, allowance: 1500 } },
    },
    buddyManager: {
      buddyName: { type: String, default: 'David Chen' },
      buddyRole: { type: String, default: 'Lead Frontend Architect' },
      managerName: { type: String, default: 'Sarah Jenkins' },
      managerRole: { type: String, default: 'VP of Engineering' },
      department: { type: String, default: 'Engineering' },
      meetingScheduled: { type: Boolean, default: true },
    },
    training: {
      type: [trainingModuleSchema],
      default: [
        { title: 'Corporate Security & Compliance 2026', duration: '45 mins', progress: 100, status: 'Completed' },
        { title: 'Engineering Tech Stack & Architecture Overview', duration: '2 hours', progress: 65, status: 'In Progress' },
        { title: 'HR Policies & Culture Handbook', duration: '30 mins', progress: 100, status: 'Completed' },
        { title: 'Data Privacy & GDPR Standards', duration: '40 mins', progress: 0, status: 'Not Started' },
      ],
    },
    visa: {
      visaType: { type: String, default: 'H-1B Specialty Work Visa' },
      passportNo: { type: String, default: 'P8920114B' },
      expiryDate: { type: String, default: '2029-08-15' },
      country: { type: String, default: 'United States' },
      status: { type: String, enum: ['Applied', 'In Review', 'Approved', 'Issued', 'Not Required'], default: 'Approved' },
    },
    insurance: {
      provider: { type: String, default: 'BlueCross Comprehensive Global Health' },
      policyNumber: { type: String, default: 'POL-90281489' },
      coverageAmount: { type: String, default: '$1,000,000' },
      dependentsCount: { type: Number, default: 2 },
      status: { type: String, enum: ['Active', 'Pending Enrolment', 'Underwriting'], default: 'Active' },
    },
    miscellaneous: {
      association: { type: String, default: 'IEEE & ACM Professional Member' },
      corporateCard: { type: Boolean, default: true },
      specialRequests: { type: String, default: 'Ergonomic standing desk & dual 4K monitors' },
    },
  },
  { timestamps: true }
);

onboardingCandidateSchema.index({ status: 1, department: 1 });

export const OnboardingCandidateModel = model<IOnboardingCandidateDocument>('OnboardingCandidate', onboardingCandidateSchema);
