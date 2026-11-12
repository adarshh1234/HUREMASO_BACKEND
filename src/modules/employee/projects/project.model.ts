import mongoose, { Schema } from 'mongoose';
import { ICustomer, IProjectRecord } from './project.types';

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    desc: { type: String, default: '-', trim: true },
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

const ProjectRecordSchema = new Schema<IProjectRecord>(
  {
    customerName: { type: String, required: true, trim: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    project: { type: String, required: true, trim: true, index: true },
    projectAdmins: { type: String, default: '-', trim: true, index: true },
    projectAdminIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    status: { type: String, default: 'Active', trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
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

export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema);
export const ProjectRecordModel = mongoose.model<IProjectRecord>('ProjectRecord', ProjectRecordSchema);
