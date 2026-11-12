import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  description: z.string().optional().default(''),
});

export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  category: z.string().optional().default('Personal Information'),
  folderId: z.string().optional(),
  employeeId: z.string().optional(),
  fileUrl: z.string().optional().default(''),
  fileType: z.string().optional().default('PDF'),
  fileSize: z.number().optional().default(1024),
  status: z.string().optional().default('Active'),
  expiryDate: z.string().optional().default(''),
});

export const updateDocumentSchema = createDocumentSchema.partial();
