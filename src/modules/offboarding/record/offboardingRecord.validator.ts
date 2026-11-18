import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const offboardingStatusEnum = z.enum([
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
]);

export const separationTypeEnum = z.enum([
  'Resignation',
  'Termination',
  'Mutual Separation',
  'Retirement',
  'Other',
]);

export const createOffboardingRecordSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  exitDate: z.string().optional(),
  lastWorkingDate: z.string().optional(),
  resignationDate: z.string().optional(),
  hrPersonnel: z.string().optional(),
  separationType: separationTypeEnum.optional(),
  status: offboardingStatusEnum.optional(),
  noticeDuration: z.string().optional(),
  reason: z.string().optional(),
});

export const updateOffboardingRecordSchema = z.object({
  employeeName: z.string().optional(),
  employeeId: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  exitDate: z.string().optional(),
  lastWorkingDate: z.string().optional(),
  resignationDate: z.string().optional(),
  hrPersonnel: z.string().optional(),
  separationType: separationTypeEnum.optional(),
  status: offboardingStatusEnum.optional(),
  noticeDuration: z.string().optional(),
  reason: z.string().optional(),
});

export const updateDocumentDraftSchema = z.object({
  docType: z.enum(['resignationLetter', 'terminationLetter', 'resignation', 'termination']).optional(),
  type: z.enum(['resignationLetter', 'terminationLetter', 'resignation', 'termination']).optional(),
  status: z.enum(['Drafted', 'Submitted', 'Approved', 'Issued', 'Acknowledged', 'Not Applicable']).optional(),
  noticeDuration: z.string().optional(),
  reason: z.string().optional(),
  resignationDate: z.string().optional(),
  lastWorkingDate: z.string().optional(),
  effectiveDate: z.string().optional(),
  terminationType: z.string().optional(),
  terminationReason: z.string().optional(),
  severanceDetails: z.string().optional(),
  letterContent: z.string().optional(),
  docUrl: z.string().optional(),
}).refine((data) => data.docType || data.type, {
  message: 'Either docType or type must be provided',
});

export const updatePerformanceSchema = z.object({
  milestones: z.array(z.object({
    date: z.string(),
    event: z.string(),
    detail: z.string(),
  })).optional(),
  history: z.array(z.object({
    period: z.string(),
    position: z.string(),
    department: z.string(),
    type: z.enum(['Joining', 'Promotion', 'Transfer', 'Milestone']),
    details: z.string(),
  })).optional(),
  appraisals: z.array(z.object({
    cycle: z.string(),
    rating: z.number(),
    managerFeedback: z.string(),
    achievements: z.string(),
    strengths: z.string().optional(),
    improvements: z.string().optional(),
    date: z.string(),
  })).optional(),
  references: z.array(z.object({
    name: z.string(),
    designation: z.string(),
    company: z.string(),
    contactInfo: z.string(),
    relationship: z.string(),
    status: z.enum(['Pending', 'Verified', 'Flagged']),
    notes: z.string().optional(),
  })).optional(),
  overallRating: z.number().optional(),
  exitScore: z.string().optional(),
  rehireEligible: z.boolean().optional(),
  projectHandoverComplete: z.boolean().optional(),
  experienceCertificateIssued: z.boolean().optional(),
});

export const updateSettlementSchema = z.object({
  basicSalary: z.number().optional(),
  unpaidSalary: z.number().optional(),
  allowances: z.number().optional(),
  bonuses: z.number().optional(),
  otherCompensation: z.number().optional(),
  grossPayout: z.number().optional(),
  encashableLeaveDays: z.number().optional(),
  leaveEncashmentAmount: z.number().optional(),
  gratuityAmount: z.number().optional(),
  tenureServed: z.string().optional(),
  gratuityFormula: z.string().optional(),
  noticePeriodSalary: z.number().optional(),
  noticePeriodDeduction: z.number().optional(),
  noticeDays: z.number().optional(),
  pendingSalaryAmount: z.number().optional(),
  pendingExpenseAmount: z.number().optional(),
  otherBenefits: z.number().optional(),
  assetDeductions: z.number().optional(),
  otherDeductions: z.number().optional(),
  deductions: z.number().optional(),
  netPayout: z.number().optional(),
  currency: z.string().optional(),
  status: z.enum(['Pending Audit', 'Approved', 'Disbursed']).optional(),
  disbursedDate: z.string().optional(),
  paymentReference: z.string().optional(),
  auditAction: z.string().optional(),
});

export const updateLegalClearanceSchema = z.object({
  chequeVoucherNo: z.string().optional(),
  chequeAmount: z.number().optional(),
  chequeStatus: z.enum(['Prepared', 'Issued', 'Cleared']).optional(),
  chequeIssueDate: z.string().optional(),
  chequeClearedDate: z.string().optional(),
  visaType: z.string().optional(),
  visaExpiryDate: z.string().optional(),
  visaCancellationStatus: z.enum(['Active', 'In Progress', 'Cancelled', 'Not Applicable']).optional(),
  visaGracePeriodDays: z.number().optional(),
  visaCancellationRequestDate: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNo: z.string().optional(),
  insuranceDelisted: z.boolean().optional(),
  insuranceCancellationDate: z.string().optional(),
  pccStatus: z.enum(['Pending', 'Clear', 'Issued', 'Not Applicable']).optional(),
  pccRequestDate: z.string().optional(),
  pccCertificateRef: z.string().optional(),
  nocIssued: z.boolean().optional(),
});

export const updateAssetReturnSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    tag: z.string(),
    category: z.string().optional(),
    status: z.enum(['Possessed', 'Pending Return', 'Returned', 'Missing', 'Damaged']),
    assignedDate: z.string().optional(),
    condition: z.string().optional(),
    returnDate: z.string().optional(),
    returnCondition: z.string().optional(),
    deductionCost: z.number().optional(),
    verifiedBy: z.string().optional(),
  })).optional(),
  dependencies: z.array(z.object({
    task: z.string(),
    category: z.enum(['Access', 'Handover', 'Admin']),
    status: z.enum(['Pending', 'In Progress', 'Completed', 'Signed Off']),
    serviceName: z.string().optional(),
  })).optional(),
  missingItems: z.array(z.object({
    name: z.string(),
    tag: z.string(),
    reportedDate: z.string(),
    investigator: z.string(),
    explanation: z.string(),
    deductionApproved: z.boolean(),
    deductionAmount: z.number(),
  })).optional(),
  inspectionPassed: z.boolean().optional(),
  totalDeductions: z.number().optional(),
  clearedBy: z.string().optional(),
  isFullyCleared: z.boolean().optional(),
});

export const updateTravelSchema = z.object({
  repatriationTicketRequired: z.boolean().optional(),
  airline: z.string().optional(),
  destination: z.string().optional(),
  flightDate: z.string().optional(),
  ticketType: z.string().optional(),
  ticketStatus: z.enum(['Not Required', 'Requested', 'Issued', 'Cancelled']).optional(),
  ticketDocumentUrl: z.string().optional(),
  excessBaggageAllowance: z.number().optional(),
  allowanceStatus: z.enum(['Not Required', 'Approved', 'Reimbursed']).optional(),
});

export const updateCustomFieldsSchema = z.object({
  customFields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text', 'date', 'number', 'dropdown', 'checkbox']),
    value: z.union([z.string(), z.number(), z.boolean()]),
    options: z.array(z.string()).optional(),
  })),
});

export const queryOffboardingSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  separationType: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
