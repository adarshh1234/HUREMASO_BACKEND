import { Types, Document } from 'mongoose';

export interface ITalentPoolCandidateItem {
  candidateId: Types.ObjectId | any;
  addedAt: Date;
  notes?: string;
  rating?: number;
}

export interface ITalentPool {
  _id?: string | Types.ObjectId;
  name: string;
  description?: string;
  department?: string;
  tags: string[];
  candidates: ITalentPoolCandidateItem[];
  status: 'Active' | 'Archived';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ITalentPoolDocument = Document & ITalentPool;

export interface CreateTalentPoolDTO {
  name: string;
  description?: string;
  department?: string;
  tags?: string[];
  status?: 'Active' | 'Archived';
}

export interface UpdateTalentPoolDTO {
  name?: string;
  description?: string;
  department?: string;
  tags?: string[];
  status?: 'Active' | 'Archived';
}

export interface AddCandidateToPoolDTO {
  candidateId: string;
  notes?: string;
  rating?: number;
}

export interface TalentPoolQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  department?: string;
  tag?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
