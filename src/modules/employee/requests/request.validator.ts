import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createEmployeeRequestSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Request type is required'),
  department: z.string().min(1, 'Department is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  comments: z.string().optional().default(''),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  approver: z.string().optional(),
  rejectionReason: z.string().optional(),
});
