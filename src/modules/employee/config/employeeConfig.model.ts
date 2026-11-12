import mongoose, { Schema } from 'mongoose';
import { IEmployeeConfig } from './employeeConfig.types';

const CustomFieldItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    screen: { type: String, default: 'Personal Details', trim: true },
    type: { type: String, default: 'Text or Number', trim: true },
  },
  { _id: false }
);

const ReportingMethodItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const TerminationReasonItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const EmployeeConfigSchema = new Schema<IEmployeeConfig>(
  {
    optionalFields: {
      nickname: { type: Boolean, default: true },
      smoker: { type: Boolean, default: true },
      family: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
    },
    customFields: {
      type: [CustomFieldItemSchema],
      default: [
        { name: 'Address', screen: 'Personal Details', type: 'Text or Number' },
        { name: 'Blood Type', screen: 'Personal Details', type: 'Text or Number' },
        { name: 'custom', screen: 'Personal Details', type: 'Text or Number' },
        { name: 'Grades titles', screen: 'Personal Details', type: 'Text or Number' },
      ],
    },
    reportingMethods: {
      type: [ReportingMethodItemSchema],
      default: [
        { name: 'Direct' },
        { name: 'Indirect' },
        { name: 'Test_Reporting' },
      ],
    },
    terminationReasons: {
      type: [TerminationReasonItemSchema],
      default: [
        { name: 'Resigned' },
        { name: 'Contract Expired' },
        { name: 'Performance' },
      ],
    },
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

export const EmployeeConfigModel = mongoose.model<IEmployeeConfig>('EmployeeConfig', EmployeeConfigSchema);
