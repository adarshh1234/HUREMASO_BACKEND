import { Document, Types } from 'mongoose';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IEmployeeRequest extends Document {
  id?: string;
  empId: string;
  employeeRef?: Types.ObjectId;
  name: string;
  type: string;
  department: string;
  date: string;
  amount: string;
  status: RequestStatus;
  approver?: string;
  approvalDate?: string;
  comments?: string;
  rejectionReason?: string;
}
