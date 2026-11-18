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

const careerHistorySchema = new Schema(
  {
    period: { type: String, required: true },
    position: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, enum: ['Joining', 'Promotion', 'Transfer', 'Milestone'], default: 'Milestone' },
    details: { type: String, required: true },
  },
  { _id: false }
);

const appraisalSchema = new Schema(
  {
    cycle: { type: String, required: true },
    rating: { type: Number, required: true },
    managerFeedback: { type: String, required: true },
    achievements: { type: String, required: true },
    strengths: { type: String },
    improvements: { type: String },
    date: { type: String, required: true },
  },
  { _id: false }
);

const referenceSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    company: { type: String, required: true },
    contactInfo: { type: String, required: true },
    relationship: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Verified', 'Flagged'], default: 'Pending' },
    notes: { type: String },
  },
  { _id: false }
);

const assetItemSchema = new Schema(
  {
    name: { type: String, required: true },
    tag: { type: String, required: true },
    category: { type: String, default: 'Hardware' },
    status: { type: String, enum: ['Possessed', 'Pending Return', 'Returned', 'Missing', 'Damaged'], default: 'Possessed' },
    assignedDate: { type: String },
    condition: { type: String, default: 'Good' },
    returnDate: { type: String },
    returnCondition: { type: String },
    deductionCost: { type: Number, default: 0 },
    verifiedBy: { type: String },
  },
  { _id: false }
);

const dependencyItemSchema = new Schema(
  {
    task: { type: String, required: true },
    category: { type: String, enum: ['Access', 'Handover', 'Admin'], default: 'Access' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Signed Off'], default: 'Completed' },
    serviceName: { type: String },
  },
  { _id: false }
);

const missingAssetItemSchema = new Schema(
  {
    name: { type: String, required: true },
    tag: { type: String, required: true },
    reportedDate: { type: String, required: true },
    investigator: { type: String, required: true },
    explanation: { type: String, required: true },
    deductionApproved: { type: Boolean, default: false },
    deductionAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const customFieldSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'date', 'number', 'dropdown', 'checkbox'], default: 'text' },
    value: { type: Schema.Types.Mixed, default: '' },
    options: { type: [String], default: [] },
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
    lastWorkingDate: { type: String },
    resignationDate: { type: String },
    hrPersonnel: { type: String, default: 'HR Operations Lead' },
    separationType: {
      type: String,
      enum: ['Resignation', 'Termination', 'Mutual Separation', 'Retirement', 'Other'],
      default: 'Resignation',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Initiated',
        'Notice Period',
        'In Progress',
        'Pending Clearance',
        'Clearance In Progress',
        'Pending Settlement',
        'Settlement Pending',
        'Settled',
        'Completed',
        'Cancelled',
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
          resignationDate: () => new Date().toISOString().split('T')[0],
          lastWorkingDate: () => new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          letterContent: '',
          docUrl: '',
        },
      },
      terminationLetter: {
        type: Object,
        default: {
          status: 'Not Applicable',
          terminationType: '',
          terminationReason: '',
          effectiveDate: '',
          severanceDetails: '',
          issuedDate: '',
          letterContent: '',
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
      history: {
        type: [careerHistorySchema],
        default: [
          { period: '2023 - 2024', position: 'Senior Software Engineer', department: 'Engineering', type: 'Joining', details: 'Full-stack platform scaling' },
          { period: '2024 - 2025', position: 'Lead Software Engineer', department: 'Engineering', type: 'Promotion', details: 'Microservices architecture ownership' },
          { period: '2025 - 2026', position: 'Principal Software Engineer', department: 'Engineering', type: 'Promotion', details: 'Core system stability and high availability leadership' },
        ],
      },
      appraisals: {
        type: [appraisalSchema],
        default: [
          { cycle: 'FY2024 Annual Appraisal', rating: 4.8, managerFeedback: 'Exemplary leadership and technical execution', achievements: 'Delivered 99.99% uptime for core HR portal', strengths: 'System design, mentoring', improvements: 'Cross-functional project management', date: 'Dec 2024' },
          { cycle: 'FY2025 Mid-Year Review', rating: 4.9, managerFeedback: 'Outstanding contribution to platform migration', achievements: 'Reduced latency by 45%', strengths: 'Execution velocity, teamwork', improvements: 'Continuous documentation', date: 'June 2025' },
        ],
      },
      references: {
        type: [referenceSchema],
        default: [
          { name: 'Dr. Robert Ross', designation: 'VP of Engineering', company: 'Huremaso Global', contactInfo: 'robert.ross@huremaso.internal', relationship: 'Direct Supervisor (3 Years)', status: 'Verified', notes: 'Highly recommended for senior engineering leadership roles' },
          { name: 'Elena Rostova', designation: 'Principal Architect', company: 'Huremaso Global', contactInfo: 'elena.rostova@huremaso.internal', relationship: 'Technical Peer & Project Co-Lead', status: 'Verified', notes: 'Excellent technical and architectural collaborator' },
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
        basicSalary: 11000,
        unpaidSalary: 0,
        allowances: 2750,
        bonuses: 2500,
        otherCompensation: 1200,
        grossPayout: 28450,
        encashableLeaveDays: 14,
        leaveEncashmentAmount: 7600,
        gratuityAmount: 14850,
        tenureServed: '3 Years 6 Months',
        gratuityFormula: '21 Days per Year',
        noticePeriodSalary: 13750,
        noticePeriodDeduction: 0,
        noticeDays: 30,
        pendingSalaryAmount: 0,
        pendingExpenseAmount: 1250,
        otherBenefits: 2500,
        assetDeductions: 0,
        otherDeductions: 0,
        deductions: 0,
        netPayout: 28450,
        currency: 'USD',
        status: 'Approved',
        disbursedDate: '',
        paymentReference: '',
        auditHistory: [
          { action: 'Settlement Generated', changedBy: 'Finance System', date: new Date().toISOString().split('T')[0], notes: 'Automated initial exit calculation' },
          { action: 'Audited & Approved', changedBy: 'Payroll Lead', date: new Date().toISOString().split('T')[0], notes: 'Verified PTO and gratuity formula' },
        ],
      },
    },
    legal: {
      type: Object,
      default: {
        chequeVoucherNo: 'CHQ-2026-OFF-8841',
        chequeAmount: 28450,
        chequeStatus: 'Prepared',
        chequeIssueDate: '',
        chequeClearedDate: '',
        visaType: 'Work Employment Visa',
        visaExpiryDate: '2028-12-31',
        visaCancellationStatus: 'In Progress',
        visaGracePeriodDays: 30,
        visaCancellationRequestDate: new Date().toISOString().split('T')[0],
        visaSupportingDoc: '',
        insuranceProvider: 'BlueCross Comprehensive Global Health',
        insurancePolicyNo: 'POL-90281489',
        insuranceDelisted: true,
        insuranceCancellationDate: new Date().toISOString().split('T')[0],
        pccStatus: 'Clear',
        pccRequestDate: new Date().toISOString().split('T')[0],
        pccCertificateRef: 'PCC-2026-HQ-819',
        pccDocUrl: '',
        nocIssued: true,
      },
    },
    assets: {
      items: {
        type: [assetItemSchema],
        default: [
          { name: 'MacBook Pro M3 Max 64GB', tag: 'ASSET-2026-IT-901', category: 'Hardware', status: 'Pending Return', assignedDate: '2023-03-15', condition: 'Excellent', deductionCost: 0 },
          { name: 'Dual Dell 27" 4K Monitors', tag: 'ASSET-2026-IT-902', category: 'Hardware', status: 'Pending Return', assignedDate: '2023-03-20', condition: 'Good', deductionCost: 0 },
          { name: 'YubiKey 5C NFC Token', tag: 'ASSET-2026-IT-903', category: 'Security Token', status: 'Returned', assignedDate: '2023-03-15', returnDate: '2026-08-20', condition: 'Good', returnCondition: 'Operational', deductionCost: 0 },
          { name: 'Smart Keycard Badge', tag: 'ASSET-SEC-402', category: 'Access Card', status: 'Returned', assignedDate: '2023-03-15', returnDate: '2026-08-20', condition: 'Good', returnCondition: 'Operational', deductionCost: 0 },
        ],
      },
      dependencies: {
        type: [dependencyItemSchema],
        default: [
          { task: 'GitHub Repository Admin Access Revocation', category: 'Access', status: 'Completed', serviceName: 'GitHub Enterprise' },
          { task: 'AWS Cloud Console IAM Account Deactivation', category: 'Access', status: 'Completed', serviceName: 'AWS IAM' },
          { task: 'Project Architecture Knowledge Transfer Session', category: 'Handover', status: 'Signed Off', serviceName: 'Jira / Confluence' },
        ],
      },
      missingItems: {
        type: [missingAssetItemSchema],
        default: [],
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
        ticketType: 'Commercial One-Way',
        ticketStatus: 'Issued',
        ticketDocumentUrl: '',
        excessBaggageAllowance: 1500,
        allowanceStatus: 'Approved',
      },
    },
    customFields: {
      type: [customFieldSchema],
      default: [
        { key: 'alumniClub', label: 'Huremaso Alumni Club Opt-In', type: 'checkbox', value: true },
        { key: 'forwardingEmail', label: 'Personal Forwarding Email', type: 'text', value: 'alumni.contact@gmail.com' },
        { key: 'relocationAssistance', label: 'Relocation Assistance Package', type: 'dropdown', value: 'Tier 1 Standard', options: ['None', 'Tier 1 Standard', 'Executive Full Move'] },
      ],
    },
  },
  { timestamps: true }
);

offboardingRecordSchema.index({ status: 1, department: 1, separationType: 1 });

export const OffboardingRecordModel = model<IOffboardingRecordDocument>('OffboardingRecord', offboardingRecordSchema);
