import { Types, Document } from 'mongoose';

export type NoteCategory = 'HR Policy' | 'Interview Notes' | 'Checklists' | 'Memos' | string;

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
}

export interface INote {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  category: NoteCategory;
  content: string;
  description?: string;
  date?: string; // e.g. "Sept 01, 2026"
  pinned: boolean;
  tags?: string[];
  aiSummary?: string;
  checklistItems?: IChecklistItem[];

  // Interview Notes metadata
  candidateName?: string;
  candidateId?: Types.ObjectId | string;
  interviewId?: Types.ObjectId | string;
  vacancyName?: string;
  interviewerName?: string;
  interviewRound?: string;
  interviewDate?: string;
  technicalRating?: number;
  communicationRating?: number;
  strengths?: string;
  improvements?: string;

  // HR Policy / Memo metadata
  applicableScope?: string;
  policyStatus?: 'Draft' | 'Active' | 'Archived';
  memoSubject?: string;
  visibility?: 'public' | 'internal' | 'restricted';
  authorName?: string;
  authorId?: Types.ObjectId | string;

  employeeId?: Types.ObjectId | any;
  createdAt?: Date;
  updatedAt?: Date;
}

export type INoteDocument = Document & INote;

export interface CreateNoteDTO {
  title: string;
  category?: NoteCategory;
  content: string;
  description?: string;
  date?: string;
  pinned?: boolean;
  tags?: string[];
  aiSummary?: string;
  checklistItems?: IChecklistItem[];

  candidateName?: string;
  candidateId?: string;
  interviewId?: string;
  vacancyName?: string;
  interviewerName?: string;
  interviewRound?: string;
  interviewDate?: string;
  technicalRating?: number;
  communicationRating?: number;
  strengths?: string;
  improvements?: string;

  applicableScope?: string;
  policyStatus?: 'Draft' | 'Active' | 'Archived';
  memoSubject?: string;
  visibility?: 'public' | 'internal' | 'restricted';
  authorName?: string;
  authorId?: string;

  employeeId?: string;
}

export interface NoteQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  tag?: string;
  tags?: string | string[];
  pinned?: boolean | string;
  employeeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryCountSummary {
  all: number;
  hrPolicy: number;
  interviewNotes: number;
  checklists: number;
  memos: number;
  pinned: number;
}
