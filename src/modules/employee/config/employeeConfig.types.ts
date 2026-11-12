import { Document } from 'mongoose';

export interface IOptionalFields {
  nickname: boolean;
  smoker: boolean;
  family: boolean;
  education: boolean;
}

export interface ICustomFieldItem {
  name: string;
  screen: string;
  type: string;
}

export interface IReportingMethodItem {
  name: string;
}

export interface ITerminationReasonItem {
  name: string;
}

export interface IEmployeeConfig extends Document {
  id?: string;
  optionalFields: IOptionalFields;
  customFields: ICustomFieldItem[];
  reportingMethods: IReportingMethodItem[];
  terminationReasons: ITerminationReasonItem[];
}
