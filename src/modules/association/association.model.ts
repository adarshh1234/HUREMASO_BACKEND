import mongoose, { Schema } from 'mongoose';
import { IAssociationDocument } from './association.types';

const associationAuditLogSchema = new Schema(
  {
    id: { type: String, required: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: String, required: true },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const associationApprovalSchema = new Schema(
  {
    approvedBy: { type: String, default: '' },
    approvedAt: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const associationSchema = new Schema<IAssociationDocument>(
  {
    associationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    requesterEmail: {
      type: String,
      trim: true,
      default: '',
    },
    requesterAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    department: {
      type: String,
      required: true,
      default: 'General',
      trim: true,
      index: true,
    },
    targetDepartment: {
      type: String,
      trim: true,
      default: 'Marketing Department',
    },
    associatedEntity: {
      type: String,
      trim: true,
      default: 'Huremaso Global Tech',
    },
    associationType: {
      type: String,
      default: 'Project Collaboration',
      trim: true,
      index: true,
    },
    requestDetails: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Accepted', 'Rejected', 'Cancelled', 'Active', 'Inactive'],
      default: 'Pending',
      index: true,
    },
    dateRequested: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isExisting: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvalDetails: {
      type: associationApprovalSchema,
      default: () => ({}),
    },
    history: {
      type: [associationAuditLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        // Also provide name, text, date aliases for direct compatibility with React component fields
        ret.name = ret.employeeName;
        ret.text = ret.requestDetails;
        ret.date = ret.dateRequested;
        return ret;
      },
    },
  }
);

// Compound indices for search and filtering
associationSchema.index({ status: 1, isExisting: 1, createdAt: -1 });
associationSchema.index({ employeeName: 'text', requestDetails: 'text', department: 'text', targetDepartment: 'text' });

export const AssociationModel = mongoose.model<IAssociationDocument>(
  'Association',
  associationSchema
);
