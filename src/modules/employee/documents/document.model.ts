import mongoose, { Schema } from 'mongoose';
import { IDocumentFolder, IEmployeeDocument } from './document.types';

const DocumentFolderSchema = new Schema<IDocumentFolder>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    count: { type: Number, default: 0 },
    description: { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

const EmployeeDocumentSchema = new Schema<IEmployeeDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Personal Information',
      index: true,
    },
    folderId: { type: Schema.Types.ObjectId, ref: 'DocumentFolder', index: true },
    employeeId: { type: String, trim: true, index: true },
    employeeRef: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
    fileUrl: { type: String, default: '', trim: true },
    fileType: { type: String, default: 'PDF', trim: true },
    fileSize: { type: Number, default: 1024 },
    status: { type: String, default: 'Active', trim: true },
    expiryDate: { type: String, default: '' },
    modified: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const DocumentFolderModel = mongoose.model<IDocumentFolder>('DocumentFolder', DocumentFolderSchema);
export const EmployeeDocumentModel = mongoose.model<IEmployeeDocument>('EmployeeDocument', EmployeeDocumentSchema);
