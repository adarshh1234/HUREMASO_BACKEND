import { z } from 'zod';

export const mongoIdSchema = z.string().min(1, 'ID is required');

export const payRecordSchema = z.object({
  id: z.string().optional(),
  amount: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'number') return val;
    const clean = val.replace(/[$,]/g, '').trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? undefined : parsed;
  }),
  paymentMethod: z.string().optional().default('Bank Transfer'),
  transactionRef: z.string().optional(),
  transactionReference: z.string().optional(),
  remarks: z.string().optional(),
  notes: z.string().optional(),
});

const payrollRecordBaseSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().optional(),
  date: z.string().optional(),
  period: z.string().optional(),
  basicSalary: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  bonuses: z.number().min(0).optional(),
  incentives: z.number().min(0).optional(),
  grossSalary: z.number().min(0).optional(),
  taxDeductions: z.number().min(0).optional(),
  totalDeductions: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  netSalary: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
  payGrade: z.string().optional(),
  paymentMethod: z.string().optional(),
  category: z.enum(['statement', 'upcoming', 'slips', 'pay-on-request', 'advance-payments']).optional(),
  status: z.enum(['Paid', 'Pending', 'Processing', 'Failed']).optional(),
  notes: z.string().optional(),
  advanceDetails: z.record(z.any()).optional(),
  payOnRequestDetails: z.record(z.any()).optional(),
});

export const createPayrollRecordSchema = payrollRecordBaseSchema.transform((data) => ({
  ...data,
  amount: data.amount ?? data.netSalary ?? data.grossSalary ?? data.basicSalary ?? 0,
}));

export const updatePayrollRecordSchema = payrollRecordBaseSchema.partial();

export const queryPayrollRecordSchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  period: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const approvePayOnRequestSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  approvalRemarks: z.string().optional(),
  approvedBy: z.string().optional().default('HR Finance'),
});
