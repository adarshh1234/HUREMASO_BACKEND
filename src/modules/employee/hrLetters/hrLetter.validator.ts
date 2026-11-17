import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required'),
  category: z.enum(['Offer', 'Confirmation', 'Relieving', 'Experience', 'Warning', 'Promotion', 'General']).optional(),
  type: z.enum(['memo', 'notice', 'circular', 'letters', 'letter']).optional().default('letters'),
  subject: z.string().trim().min(1, 'Subject is required'),
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
  referenceNumber: z.string().optional(),
  type: z.enum(['memo', 'notice', 'circular', 'letters', 'letter']),
  title: z.string().trim().min(1, 'Title is required'),
  subject: z.string().trim().optional(),
  content: z.string().optional().default(''),
  department: z.string().optional().default(''),
  dept: z.string().optional().default(''),
  targetAudience: z.string().optional().default('All Staff'),
  recipient: z.string().optional().default(''),
  employeeTarget: z.string().optional().default(''),
  employeeId: z.string().optional().default(''),
  author: z.string().optional().default('HR Operations Team'),
  createdBy: z.string().optional().default('HR Operations Team'),
  status: z.enum([
    'Draft',
    'Pending Approval',
    'Approved',
    'Published',
    'Active',
    'Completed',
    'Archived',
    'Issued',
    'Signed',
    'Revoked',
  ]).optional().default('Published'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  visibility: z.string().optional().default('All Staff'),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  issuedDate: z.string().optional(),
  date: z.string().optional(),
  attachments: z.array(z.string()).optional().default([]),
});

export const updateCommunicationSchema = createCommunicationSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum([
    'Draft',
    'Pending Approval',
    'Approved',
    'Published',
    'Active',
    'Completed',
    'Archived',
    'Issued',
    'Signed',
    'Revoked',
  ]),
  approvedBy: z.string().optional(),
});

export const createIssuedLetterSchema = z.object({
  referenceNumber: z.string().optional(),
  employeeId: z.string().trim().min(1, 'Employee ID is required'),
  employeeName: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  templateId: z.string().optional(),
  letterType: z.string().optional().default('HR Letter'),
  subject: z.string().optional().default('HR Letter'),
  content: z.string().trim().min(1, 'Letter content is required'),
  issuedDate: z.string().optional(),
  effectiveDate: z.string().optional(),
  issuedBy: z.string().optional().default('HR Management'),
  createdBy: z.string().optional().default('HR Management'),
  status: z.enum(['Draft', 'Pending Approval', 'Approved', 'Issued', 'Signed', 'Revoked', 'Published']).optional().default('Issued'),
  documentUrl: z.string().optional().default(''),
});

export const updateIssuedLetterSchema = createIssuedLetterSchema.partial();

export const aiDraftSchema = z.object({
  category: z.enum(['memo', 'notice', 'circular', 'letter']),
  subject: z.string().trim().min(1, 'Subject is required'),
  instructions: z.string().optional(),
  department: z.string().optional(),
  targetAudience: z.string().optional(),
  employeeId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
});

export const pdfGenerationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  documentType: z.enum(['memo', 'notice', 'circular', 'letter']),
  referenceNumber: z.string().optional(),
  date: z.string().optional(),
  department: z.string().optional(),
  targetAudience: z.string().optional(),
  author: z.string().optional(),
  status: z.string().optional().default('Published'),
  content: z.string().min(1, 'Content is required'),
  recipientName: z.string().optional(),
  recipientId: z.string().optional(),
  effectiveDate: z.string().optional(),
});
