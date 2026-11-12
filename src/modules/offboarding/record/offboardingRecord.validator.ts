import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const createOffboardingRecordSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  exitDate: z.string().optional(),
  separationType: z.enum(['Resignation', 'Termination', 'Mutual Separation', 'Retirement']).optional(),
  status: z.enum([
    'Initiated',
    'Notice Period',
    'Clearance In Progress',
    'Settlement Pending',
    'Settled',
    'Completed',
  ]).optional(),
  noticeDuration: z.string().optional(),
  reason: z.string().optional(),
});

export const updateOffboardingRecordSchema = createOffboardingRecordSchema.partial();

export const updateDocumentDraftSchema = z.object({
  docType: z.enum(['resignationLetter', 'terminationLetter', 'resignation', 'termination']).optional(),
  type: z.enum(['resignationLetter', 'terminationLetter', 'resignation', 'termination']).optional(),
  status: z.enum(['Drafted', 'Submitted', 'Approved', 'Issued', 'Acknowledged', 'Not Applicable']).optional(),
  noticeDuration: z.string().optional(),
  reason: z.string().optional(),
  terminationType: z.string().optional(),
  severanceDetails: z.string().optional(),
}).refine((data) => data.docType || data.type, {
  message: 'Either docType or type must be provided',
});

export const updateSettlementSchema = z.object({
  grossPayout: z.number().optional(),
  encashableLeaveDays: z.number().optional(),
  leaveEncashmentAmount: z.number().optional(),
  gratuityAmount: z.number().optional(),
  noticePeriodSalary: z.number().optional(),
  pendingSalaryAmount: z.number().optional(),
  pendingExpenseAmount: z.number().optional(),
  deductions: z.number().optional(),
  status: z.enum(['Pending Audit', 'Approved', 'Disbursed']).optional(),
});

export const updateLegalClearanceSchema = z.object({
  chequeStatus: z.enum(['Prepared', 'Issued', 'Cleared']).optional(),
  visaCancellationStatus: z.enum(['Active', 'In Progress', 'Cancelled', 'Not Applicable']).optional(),
  insuranceDelisted: z.boolean().optional(),
  pccStatus: z.enum(['Pending', 'Clear', 'Issued', 'Not Applicable']).optional(),
  nocIssued: z.boolean().optional(),
});

export const updateAssetReturnSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    tag: z.string(),
    category: z.string().optional(),
    status: z.enum(['Possessed', 'Pending Return', 'Returned', 'Missing', 'Damaged']),
    returnDate: z.string().optional(),
    deductionCost: z.number().optional(),
  })).optional(),
  dependencies: z.array(z.object({
    task: z.string(),
    category: z.enum(['Access', 'Handover', 'Admin']),
    status: z.enum(['Pending', 'In Progress', 'Completed', 'Signed Off']),
  })).optional(),
  inspectionPassed: z.boolean().optional(),
  isFullyCleared: z.boolean().optional(),
});

export const updateTravelSchema = z.object({
  repatriationTicketRequired: z.boolean().optional(),
  airline: z.string().optional(),
  destination: z.string().optional(),
  flightDate: z.string().optional(),
  ticketStatus: z.enum(['Not Required', 'Requested', 'Issued', 'Cancelled']).optional(),
  excessBaggageAllowance: z.number().optional(),
  allowanceStatus: z.enum(['Not Required', 'Approved', 'Reimbursed']).optional(),
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
