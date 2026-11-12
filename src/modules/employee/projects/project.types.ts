import { Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  id?: string;
  name: string;
  desc: string;
}

export interface IProjectRecord extends Document {
  id?: string;
  customerName: string;
  customerId?: Types.ObjectId;
  project: string;
  projectAdmins: string;
  projectAdminIds?: Types.ObjectId[];
  status?: string;
  members?: Types.ObjectId[];
}
