import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  category: z.enum(['Offer', 'Confirmation', 'Relieving', 'Experience', 'Warning', 'Promotion', 'General']).optional(),
  type: z.enum(['memo', 'notice', 'circular', 'letters', 'letter']).optional().default('letters'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().optional(),
  message: z.string().optional(),
  variables: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const generateLetterSchema = z.object({
  templateId: z.string().optional(),
  templateName: z.string().optional(),
  letterType: z.string().optional(),
  employeeId: z.string().optional(),
  employeeName: z.string().optional(),
  companyName: z.string().optional().default('Acme Corp'),
  subject: z.string().optional(),
  replacements: z.record(z.string()).optional(),
});

export const createCommunicationSchema = z.object({
  type: z.enum(['memo', 'notice', 'circular', 'letters', 'letter']),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().default(''),
  department: z.string().optional().default(''),
  dept: z.string().optional().default(''),
  targetAudience: z.string().optional().default('All Staff'),
  recipient: z.string().optional().default(''),
  employeeTarget: z.string().optional().default(''),
  employeeId: z.string().optional().default(''),
  author: z.string().optional().default('HR Operations Team'),
  createdBy: z.string().optional().default('HR Operations Team'),
  status: z.enum(['Published', 'Active', 'Completed', 'Archived', 'Draft']).optional().default('Published'),
  issuedDate: z.string().optional(),
  date: z.string().optional(),
  attachments: z.array(z.string()).optional().default([]),
});

export const updateCommunicationSchema = createCommunicationSchema.partial();

export const createIssuedLetterSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  templateId: z.string().optional(),
  letterType: z.string().optional().default('HR Letter'),
  subject: z.string().optional().default('HR Letter'),
  content: z.string().min(1, 'Letter content is required'),
  issuedDate: z.string().optional(),
  issuedBy: z.string().optional().default('HR Management'),
  createdBy: z.string().optional().default('HR Management'),
  status: z.enum(['Draft', 'Issued', 'Signed', 'Revoked', 'Published']).optional().default('Issued'),
  documentUrl: z.string().optional().default(''),
});

export const updateIssuedLetterSchema = createIssuedLetterSchema.partial();
