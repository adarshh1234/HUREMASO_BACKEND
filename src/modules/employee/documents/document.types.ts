import { Document, Types } from 'mongoose';

export interface IDocumentFolder extends Document {
  id?: string;
  name: string;
  count: number;
  description?: string;
}

export interface IEmployeeDocument extends Document {
  id?: string;
  name: string;
  category: string;
  folderId?: Types.ObjectId;
  employeeId?: string;
  employeeRef?: Types.ObjectId;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status?: string;
  expiryDate?: string;
  modified: string;
}
