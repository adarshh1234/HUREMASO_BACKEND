import { Document } from 'mongoose';

export interface ILegalCompliance extends Document {
  id?: string;
  complianceScore: number;
  activeViolations: number;
  pendingPolicies: number;
  auditNotes: string;
}

export interface ILegalAiQuery {
  query: string;
}
