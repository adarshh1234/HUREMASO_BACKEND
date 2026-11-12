import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  desc: z.string().optional().default('-'),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createProjectSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  project: z.string().min(1, 'Project name is required'),
  projectAdmins: z.string().optional().default('-'),
  status: z.string().optional().default('Active'),
});

export const updateProjectSchema = createProjectSchema.partial();
