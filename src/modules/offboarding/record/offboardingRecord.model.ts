import { Schema, model } from 'mongoose';
import { IOffboardingRecordDocument } from '../offboarding.types';

const milestoneSchema = new Schema(
  {
    date: { type: String, required: true },
    event: { type: String, required: true },
    detail: { type: String, required: true },
  },
  { _id: false }
);

const assetItemSchema = new Schema(
  {
    name: { type: String, required: true },
    tag: { type: String, required: true },
    category: { type: String, default: 'Hardware' },
    status: { type: String, enum: ['Possessed', 'Pending Return', 'Returned', 'Missing', 'Damaged'], default: 'Possessed' },
    returnDate: { type: String },
    deductionCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const dependencyItemSchema = new Schema(
  {
    task: { type: String, required: true },
    category: { type: String, enum: ['Access', 'Handover', 'Admin'], default: 'Access' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Signed Off'], default: 'Completed' },
  },
  { _id: false }
);

const offboardingRecordSchema = new Schema<IOffboardingRecordDocument>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true, index: true },
    employeeId: { type: String, index: true },
    role: { type: String, required: true, index: true },
    department: { type: String, required: true, default: 'Engineering', index: true },
    exitDate: { type: String, required: true },
    separationType: {
      type: String,
      enum: ['Resignation', 'Termination', 'Mutual Separation', 'Retirement'],
      default: 'Resignation',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Initiated',
        'Notice Period',
        'Clearance In Progress',
        'Settlement Pending',
        'Settled',
        'Completed',
      ],
      default: 'Notice Period',
      index: true,
    },
    documents: {
      resignationLetter: {
        type: Object,
        default: {
          status: 'Submitted',
          noticeDuration: '30 Days',
          reason: 'Pursuing higher studies & career transition',
          submittedDate: () => new Date().toISOString().split('T')[0],
          docUrl: '',
        },
      },
      terminationLetter: {
        type: Object,
        default: {
          status: 'Not Applicable',
          terminationType: '',
          severanceDetails: '',
          issuedDate: '',
          docUrl: '',
        },
      },
    },
    performance: {
      milestones: {
        type: [milestoneSchema],
        default: [
          { date: 'March 2023', event: 'Joined Huremaso as Senior Engineer', detail: 'Onboarded into Core Platform Team' },
          { date: 'January 2024', event: 'Promoted to Principal Software Engineer', detail: 'Led UI Micro-frontend Redesign' },
          { date: 'June 2025', event: 'Received Excellence Award', detail: 'Delivered High-Availability Architecture' },
        ],
      },
      overallRating: { type: Number, default: 4.85 },
      exitScore: { type: String, default: 'Highly Recommended' },
      rehireEligible: { type: Boolean, default: true },
      projectHandoverComplete: { type: Boolean, default: true },
      experienceCertificateIssued: { type: Boolean, default: true },
    },
    settlement: {
      type: Object,
      default: {
        grossPayout: 28450,
        encashableLeaveDays: 14,
        leaveEncashmentAmount: 7600,
        gratuityAmount: 14850,
        tenureServed: '3 Years 6 Months',
        gratuityFormula: '21 Days per Year',
        noticePeriodSalary: 13750,
        noticeDays: 30,
        pendingSalaryAmount: 0,
        pendingExpenseAmount: 1250,
        deductions: 0,
        netPayout: 28450,
        status: 'Approved',
        disbursedDate: '',
      },
    },
    legal: {
      type: Object,
      default: {
        chequeVoucherNo: 'CHQ-2026-OFF-8841',
        chequeAmount: 28450,
        chequeStatus: 'Prepared',
        visaCancellationStatus: 'In Progress',
        visaGracePeriodDays: 30,
        insuranceDelisted: true,
        pccStatus: 'Clear',
        nocIssued: true,
      },
    },
    assets: {
      items: {
        type: [assetItemSchema],
        default: [
          { name: 'MacBook Pro M3 Max 64GB', tag: 'ASSET-2026-IT-901', category: 'Hardware', status: 'Pending Return', deductionCost: 0 },
          { name: 'Dual Dell 27" 4K Monitors', tag: 'ASSET-2026-IT-902', category: 'Hardware', status: 'Pending Return', deductionCost: 0 },
          { name: 'YubiKey 5C NFC Token', tag: 'ASSET-2026-IT-903', category: 'Security Token', status: 'Returned', returnDate: '2026-08-20', deductionCost: 0 },
          { name: 'Smart Keycard Badge', tag: 'ASSET-SEC-402', category: 'Access Card', status: 'Returned', returnDate: '2026-08-20', deductionCost: 0 },
        ],
      },
      dependencies: {
        type: [dependencyItemSchema],
        default: [
          { task: 'GitHub Repository Admin Access Revocation', category: 'Access', status: 'Completed' },
          { task: 'AWS Cloud Console IAM Account Deactivation', category: 'Access', status: 'Completed' },
          { task: 'Project Architecture Knowledge Transfer Session', category: 'Handover', status: 'Signed Off' },
        ],
      },
      inspectionPassed: { type: Boolean, default: true },
      totalDeductions: { type: Number, default: 0 },
      clearedBy: { type: String, default: 'Marcus Vance' },
      clearedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
      isFullyCleared: { type: Boolean, default: true },
    },
    travel: {
      type: Object,
      default: {
        repatriationTicketRequired: true,
        airline: 'Emirates Business Class',
        destination: 'London Heathrow (LHR)',
        flightDate: '2026-10-15',
        ticketStatus: 'Issued',
        excessBaggageAllowance: 1500,
        allowanceStatus: 'Approved',
      },
    },
  },
  { timestamps: true }
);

offboardingRecordSchema.index({ status: 1, department: 1 });

export const OffboardingRecordModel = model<IOffboardingRecordDocument>('OffboardingRecord', offboardingRecordSchema);
