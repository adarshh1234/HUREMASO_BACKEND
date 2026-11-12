import { z } from 'zod';

export const createAssociationRequestSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required').optional(),
  name: z.string().min(1).optional(), // Frontend alias
  employeeId: z.string().optional(),
  requesterEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  requesterAvatar: z.string().url().optional().or(z.literal('')),
  department: z.string().optional().default('General'),
  targetDepartment: z.string().optional().default('Marketing Department'),
  associatedEntity: z.string().optional().default('Huremaso Global Tech'),
  associationType: z.string().optional().default('Project Collaboration'),
  requestDetails: z.string().min(3, 'Request details must be at least 3 characters').optional(),
  text: z.string().min(3).optional(), // Frontend alias
  dateRequested: z.string().optional(),
  date: z.string().optional(), // Frontend alias
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.employeeName || data.name, {
  message: 'Employee name or name is required',
  path: ['employeeName'],
}).refine(data => data.requestDetails || data.text, {
  message: 'Request details or text description is required',
  path: ['requestDetails'],
});

export const updateAssociationSchema = z.object({
  employeeName: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  employeeId: z.string().optional(),
  requesterEmail: z.string().email().optional().or(z.literal('')),
  requesterAvatar: z.string().optional(),
  department: z.string().optional(),
  targetDepartment: z.string().optional(),
  associatedEntity: z.string().optional(),
  associationType: z.string().optional(),
  requestDetails: z.string().min(3).optional(),
  text: z.string().min(3).optional(),
  status: z.enum(['Pending', 'Approved', 'Accepted', 'Rejected', 'Cancelled', 'Active', 'Inactive']).optional(),
  dateRequested: z.string().optional(),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  isExisting: z.boolean().optional(),
  performedBy: z.string().optional(),
});

export const approveRejectAssociationSchema = z.object({
  action: z.enum(['approve', 'accept', 'reject', 'cancel']).optional(),
  status: z.enum(['Approved', 'Accepted', 'Rejected', 'Cancelled', 'Active', 'Inactive']).optional(),
  performedBy: z.string().optional().default('System Admin'),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  effectiveDate: z.string().optional(),
});

export const deactivateAssociationSchema = z.object({
  reason: z.string().optional(),
  performedBy: z.string().optional().default('System Admin'),
});

export const associationQueryFilterSchema = z.object({
  type: z.enum(['new', 'existing', 'all']).optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  targetDepartment: z.string().optional(),
  associationType: z.string().optional(),
  employeeName: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dateRequested', 'employeeName', 'status', 'department']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type CreateAssociationRequestInput = z.infer<typeof createAssociationRequestSchema>;
export type UpdateAssociationInput = z.infer<typeof updateAssociationSchema>;
export type ApproveRejectAssociationInput = z.infer<typeof approveRejectAssociationSchema>;
export type DeactivateAssociationInput = z.infer<typeof deactivateAssociationSchema>;
export type AssociationQueryFilterInput = z.infer<typeof associationQueryFilterSchema>;
