import { Types, Document } from 'mongoose';

export type NoteCategory = 'HR Policy' | 'Interview Notes' | 'Checklists' | 'Memos' | string;

export interface INote {
  _id?: string | Types.ObjectId;
  title: string;
  category: NoteCategory;
  content: string;
  date?: string; // e.g. "Sept 01, 2026"
  pinned: boolean;
  tags?: string[];
  aiSummary?: string;
  employeeId?: Types.ObjectId | any;
  createdAt?: Date;
  updatedAt?: Date;
}

export type INoteDocument = Document & INote;

export interface CreateNoteDTO {
  title: string;
  category?: NoteCategory;
  content: string;
  date?: string;
  pinned?: boolean;
  tags?: string[];
  aiSummary?: string;
  employeeId?: string;
}

export interface NoteQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  pinned?: boolean | string;
  employeeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
