import mongoose, { Schema } from 'mongoose';
import { ILetterTemplate, IHrCommunication, IIssuedLetter } from './hrLetter.types';

const LetterTemplateSchema = new Schema<ILetterTemplate>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Offer', 'Confirmation', 'Relieving', 'Experience', 'Warning', 'Promotion', 'General'],
      default: 'General',
    },
    type: {
      type: String,
      enum: ['memo', 'notice', 'circular', 'letters', 'letter'],
      default: 'letters',
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    body: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    variables: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (!ret.body && ret.message) ret.body = ret.message;
        if (!ret.message && ret.body) ret.message = ret.body;
        return ret;
      },
    },
  }
);

LetterTemplateSchema.pre('save', function (next) {
  if (!this.body && this.message) this.body = this.message;
  if (!this.message && this.body) this.message = this.body;
  next();
});

const HrCommunicationSchema = new Schema<IHrCommunication>(
  {
    type: {
      type: String,
      enum: ['memo', 'notice', 'circular', 'letters', 'letter'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, index: true },
    content: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    dept: { type: String, default: '', trim: true },
    targetAudience: { type: String, default: 'All Staff', trim: true },
    recipient: { type: String, default: '', trim: true },
    employeeTarget: { type: String, default: '', trim: true },
    employeeId: { type: String, default: '', trim: true },
    author: { type: String, default: 'HR Operations Team', trim: true },
    createdBy: { type: String, default: 'HR Operations Team', trim: true },
    status: {
      type: String,
      enum: ['Published', 'Active', 'Completed', 'Archived', 'Draft'],
      default: 'Published',
      index: true,
    },
    issuedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    },
    attachments: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (!ret.department && ret.dept) ret.department = ret.dept;
        if (!ret.dept && ret.department) ret.dept = ret.department;
        if (!ret.author && ret.createdBy) ret.author = ret.createdBy;
        if (!ret.createdBy && ret.author) ret.createdBy = ret.author;
        if (!ret.issuedDate && ret.date) ret.issuedDate = ret.date;
        if (!ret.date && ret.issuedDate) ret.date = ret.issuedDate;
        return ret;
      },
    },
  }
);

HrCommunicationSchema.pre('save', function (next) {
  if (!this.department && this.dept) this.department = this.dept;
  if (!this.dept && this.department) this.dept = this.department;
  if (!this.author && this.createdBy) this.author = this.createdBy;
  if (!this.createdBy && this.author) this.createdBy = this.author;
  if (!this.issuedDate && this.date) this.issuedDate = this.date;
  if (!this.date && this.issuedDate) this.date = this.issuedDate;
  next();
});

const IssuedLetterSchema = new Schema<IIssuedLetter>(
  {
    employeeId: { type: String, required: true, trim: true, index: true },
    templateId: { type: String, trim: true },
    letterType: { type: String, default: 'HR Letter', trim: true },
    subject: { type: String, default: '', trim: true },
    content: { type: String, required: true, trim: true },
    issuedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    issuedBy: { type: String, default: 'HR Management', trim: true },
    createdBy: { type: String, default: 'HR Management', trim: true },
    status: {
      type: String,
      enum: ['Draft', 'Issued', 'Signed', 'Revoked', 'Published'],
      default: 'Issued',
      index: true,
    },
    documentUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (!ret.issuedBy && ret.createdBy) ret.issuedBy = ret.createdBy;
        if (!ret.createdBy && ret.issuedBy) ret.createdBy = ret.issuedBy;
        return ret;
      },
    },
  }
);

IssuedLetterSchema.pre('save', function (next) {
  if (!this.issuedBy && this.createdBy) this.issuedBy = this.createdBy;
  if (!this.createdBy && this.issuedBy) this.createdBy = this.issuedBy;
  next();
});

export const LetterTemplateModel = mongoose.model<ILetterTemplate>('LetterTemplate', LetterTemplateSchema);
export const HrCommunicationModel = mongoose.model<IHrCommunication>('HrCommunication', HrCommunicationSchema);
export const IssuedLetterModel = mongoose.model<IIssuedLetter>('IssuedLetter', IssuedLetterSchema);
