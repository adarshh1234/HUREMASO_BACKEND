import { z } from 'zod';

export const createPayGradeSchema = z.object({
  gradeCode: z.string().min(1, 'Grade code is required'),
  gradeName: z.string().min(1, 'Grade name is required'),
  minSalary: z.number().min(0, 'Minimum salary must be non-negative'),
  maxSalary: z.number().min(0, 'Maximum salary must be non-negative'),
  currency: z.string().optional(),
  description: z.string().optional(),
  allowances: z.array(
    z.object({
      name: z.string().min(1),
      amount: z.number().min(0),
      type: z.enum(['fixed', 'percentage']).optional().default('fixed'),
      isTaxable: z.boolean().optional(),
    })
  ).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
}).refine((data) => data.maxSalary >= data.minSalary, {
  message: 'Maximum salary cannot be less than minimum salary',
  path: ['maxSalary'],
});

export const updatePayGradeSchema = z.object({
  gradeCode: z.string().optional(),
  gradeName: z.string().optional(),
  minSalary: z.number().min(0).optional(),
  maxSalary: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  allowances: z.array(
    z.object({
      name: z.string().min(1),
      amount: z.number().min(0),
      type: z.enum(['fixed', 'percentage']).optional().default('fixed'),
      isTaxable: z.boolean().optional(),
    })
  ).optional(),
  assignedEmployees: z.array(
    z.object({
      employeeId: z.string(),
      employeeName: z.string(),
      department: z.string(),
      currentSalary: z.number(),
      assignedDate: z.string().optional(),
    })
  ).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});
