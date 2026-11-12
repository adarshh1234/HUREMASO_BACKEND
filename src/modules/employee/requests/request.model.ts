import mongoose, { Schema } from 'mongoose';
import { IEmployeeRequest } from './request.types';

const EmployeeRequestSchema = new Schema<IEmployeeRequest>(
  {
    empId: { type: String, required: true, trim: true, index: true },
    employeeRef: { type: Schema.Types.ObjectId, ref: 'Employee' },
    name: { type: String, required: true, trim: true, index: true },
    type: { type: String, required: true, trim: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    date: { type: String, required: true, index: true },
    amount: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    approver: { type: String, default: '', trim: true },
    approvalDate: { type: String, default: '' },
    comments: { type: String, default: '', trim: true },
    rejectionReason: { type: String, default: '', trim: true },
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

export const EmployeeRequestModel = mongoose.model<IEmployeeRequest>('EmployeeRequest', EmployeeRequestSchema);
