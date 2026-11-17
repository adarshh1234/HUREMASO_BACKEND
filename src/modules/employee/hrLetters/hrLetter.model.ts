import mongoose, { Schema } from 'mongoose';
import { ILetterTemplate, IHrCommunication, IIssuedLetter } from './hrLetter.types';
import { EmployeeModel } from '../employee.model';

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
    referenceNumber: {
      type: String,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['memo', 'notice', 'circular', 'letters', 'letter'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, index: true },
    subject: { type: String, default: '', trim: true },
    content: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true, index: true },
    dept: { type: String, default: '', trim: true },
    targetAudience: { type: String, default: 'All Staff', trim: true },
    recipient: { type: String, default: '', trim: true },
    employeeTarget: { type: String, default: '', trim: true },
    employeeId: { type: String, default: '', trim: true },
    author: { type: String, default: 'HR Operations Team', trim: true },
    createdBy: { type: String, default: 'HR Operations Team', trim: true },
    updatedBy: { type: String, trim: true },
    status: {
      type: String,
      enum: [
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
      ],
      default: 'Published',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    visibility: {
      type: String,
      default: 'All Staff',
      trim: true,
    },
    effectiveDate: { type: String, trim: true },
    expiryDate: { type: String, trim: true },
    issuedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    },
    approvedBy: { type: String, trim: true },
    approvedAt: { type: Date },
    publishedBy: { type: String, trim: true },
    publishedAt: { type: Date },
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
        if (!ret.subject) ret.subject = ret.title;
        return ret;
      },
    },
  }
);

HrCommunicationSchema.pre('save', function (next) {
  const currentYear = new Date().getFullYear();
  const randSeq = Math.floor(1000 + Math.random() * 9000);

  if (!this.referenceNumber) {
    if (this.type === 'memo') {
      this.referenceNumber = `MEMO-${currentYear}-${randSeq}`;
    } else if (this.type === 'notice') {
      this.referenceNumber = `NOT-${currentYear}-${randSeq}`;
    } else if (this.type === 'circular') {
      this.referenceNumber = `CIR-${currentYear}-${randSeq}`;
    } else {
      this.referenceNumber = `LTR-${currentYear}-${randSeq}`;
    }
  }

  if (!this.subject && this.title) {
    this.subject = this.title;
  }
  if (!this.department && this.dept) this.department = this.dept;
  if (!this.dept && this.department) this.dept = this.department;
  if (!this.author && this.createdBy) this.author = this.createdBy;
  if (!this.createdBy && this.author) this.createdBy = this.author;
  if (!this.issuedDate && this.date) this.issuedDate = this.date;
  if (!this.date && this.issuedDate) this.date = this.issuedDate;

  if (this.status === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.publishedBy = this.author || 'HR Management';
  }

  next();
});

const IssuedLetterSchema = new Schema<IIssuedLetter>(
  {
    referenceNumber: {
      type: String,
      trim: true,
      index: true,
    },
    employeeId: { type: String, required: true, trim: true, index: true },
    employeeName: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    templateId: { type: String, trim: true },
    letterType: { type: String, default: 'HR Letter', trim: true },
    subject: { type: String, default: '', trim: true },
    content: { type: String, required: true, trim: true },
    issuedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    effectiveDate: { type: String, trim: true },
    issuedBy: { type: String, default: 'HR Management', trim: true },
    createdBy: { type: String, default: 'HR Management', trim: true },
    updatedBy: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Issued', 'Signed', 'Revoked', 'Published'],
      default: 'Issued',
      index: true,
    },
    approvedBy: { type: String, trim: true },
    approvedAt: { type: Date },
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

IssuedLetterSchema.pre('save', async function (next) {
  const currentYear = new Date().getFullYear();
  const randSeq = Math.floor(1000 + Math.random() * 9000);

  if (!this.referenceNumber) {
    this.referenceNumber = `LTR-${currentYear}-${randSeq}`;
  }

  if (!this.issuedBy && this.createdBy) this.issuedBy = this.createdBy;
  if (!this.createdBy && this.issuedBy) this.createdBy = this.issuedBy;

  // Auto-resolve employee details from EmployeeModel if missing
  if (this.employeeId && (!this.employeeName || !this.designation || !this.department)) {
    try {
      const isOid = mongoose.Types.ObjectId.isValid(this.employeeId);
      const emp = isOid
        ? await EmployeeModel.findOne({ $or: [{ employeeId: this.employeeId }, { _id: this.employeeId }] })
        : await EmployeeModel.findOne({ employeeId: this.employeeId });

      if (emp) {
        if (!this.employeeName) this.employeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        if (!this.designation) this.designation = emp.jobTitle || 'Employee';
        if (!this.department) this.department = emp.department || 'General';
      }
    } catch {
      // Non-blocking fallback
    }
  }

  next();
});

export const LetterTemplateModel = mongoose.model<ILetterTemplate>('LetterTemplate', LetterTemplateSchema);
export const HrCommunicationModel = mongoose.model<IHrCommunication>('HrCommunication', HrCommunicationSchema);
export const IssuedLetterModel = mongoose.model<IIssuedLetter>('IssuedLetter', IssuedLetterSchema);
