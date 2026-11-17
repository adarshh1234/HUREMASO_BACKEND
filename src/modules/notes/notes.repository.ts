import { NoteModel } from './notes.model';
import { INoteDocument, NoteQueryParams, IChecklistItem, CategoryCountSummary } from './notes.types';

export class NotesRepository {
  async create(data: Partial<INoteDocument>): Promise<INoteDocument> {
    const item = new NoteModel(data);
    return (await item.save()).populate('employeeId');
  }

  async findById(id: string): Promise<INoteDocument | null> {
    return NoteModel.findById(id).populate('employeeId');
  }

  async update(id: string, data: Partial<INoteDocument>): Promise<INoteDocument | null> {
    return NoteModel.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('employeeId');
  }

  async delete(id: string): Promise<INoteDocument | null> {
    return NoteModel.findByIdAndDelete(id);
  }

  async findAll(params: NoteQueryParams): Promise<{ items: INoteDocument[]; total: number }> {
    const query: any = {};

    if (params.search && params.search.trim() !== '') {
      const searchRegex = { $regex: params.search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { candidateName: searchRegex },
        { memoSubject: searchRegex },
      ];
    }

    if (params.category && params.category.toLowerCase() !== 'all') {
      query.category = { $regex: `^${params.category.trim()}$`, $options: 'i' };
    }

    // Tag filtering
    if (params.tag && params.tag.trim() !== '') {
      query.tags = { $regex: `^${params.tag.trim()}$`, $options: 'i' };
    } else if (params.tags) {
      const tagList = Array.isArray(params.tags) ? params.tags : [params.tags];
      query.tags = { $in: tagList };
    }

    if (params.pinned !== undefined) {
      query.pinned = params.pinned === true || params.pinned === 'true';
    }

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(params.limit) || 100));
    const skip = (page - 1) * limit;

    let sort: any = { pinned: -1, createdAt: -1 };
    if (params.sortBy) {
      const order = params.sortOrder === 'asc' ? 1 : -1;
      sort = { pinned: -1, [params.sortBy]: order };
    }

    const [items, total] = await Promise.all([
      NoteModel.find(query)
        .populate('employeeId')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      NoteModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async updateChecklist(id: string, items: IChecklistItem[]): Promise<INoteDocument | null> {
    return NoteModel.findByIdAndUpdate(
      id,
      { $set: { checklistItems: items } },
      { new: true }
    ).populate('employeeId');
  }

  async toggleChecklistItem(id: string, itemId: string, completed?: boolean): Promise<INoteDocument | null> {
    const note = await NoteModel.findById(id);
    if (!note || !note.checklistItems) return null;

    const targetItem = note.checklistItems.find((i) => i.id === itemId);
    if (!targetItem) return null;

    targetItem.completed = completed !== undefined ? completed : !targetItem.completed;
    note.markModified('checklistItems');
    await note.save();
    return note;
  }

  async getCategoryCounts(): Promise<CategoryCountSummary> {
    const [all, hrPolicy, interviewNotes, checklists, memos, pinned] = await Promise.all([
      NoteModel.countDocuments(),
      NoteModel.countDocuments({ category: { $regex: /^HR Policy$/i } }),
      NoteModel.countDocuments({ category: { $regex: /^Interview Notes$/i } }),
      NoteModel.countDocuments({ category: { $regex: /^Checklists$/i } }),
      NoteModel.countDocuments({ category: { $regex: /^Memos$/i } }),
      NoteModel.countDocuments({ pinned: true }),
    ]);

    return {
      all,
      hrPolicy,
      interviewNotes,
      checklists,
      memos,
      pinned,
    };
  }

  async getAllTags(): Promise<string[]> {
    const tags = await NoteModel.distinct('tags');
    return tags.filter((t): t is string => typeof t === 'string' && t.trim() !== '');
  }

  async seedDefaultNotesIfEmpty(): Promise<void> {
    const count = await NoteModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<INoteDocument>[] = [
        {
          title: 'Q3 Onboarding SLA & Compliance Checklist',
          category: 'Checklists',
          content: 'Ensure all background checks from First Advantage are verified before day 1. Hardware laptops must be shipped 3 days prior.',
          description: 'Standard HR operations checklist for global engineering and product new hires.',
          date: 'Sept 01, 2026',
          pinned: true,
          tags: ['onboarding', 'compliance', 'sla', 'operations'],
          checklistItems: [
            { id: 'chk-1', text: 'Verify background checks with First Advantage', completed: true, order: 1 },
            { id: 'chk-2', text: 'Ship pre-configured MacBook Pro via DHL 3 days prior', completed: true, order: 2 },
            { id: 'chk-3', text: 'Generate corporate Google Workspace and Slack credentials', completed: false, order: 3 },
            { id: 'chk-4', text: 'Schedule Day 1 HR induction and Benefits walkthrough', completed: false, order: 4 },
            { id: 'chk-5', text: 'Assign senior engineering onboarding buddy', completed: false, order: 5 },
          ],
        },
        {
          title: 'Senior Frontend Engineer Interview Evaluation Notes',
          category: 'Interview Notes',
          content: 'Candidate demonstrated deep understanding of React 19 concurrent features, micro-frontend architecture, and Web Vitals optimization.',
          description: 'Technical evaluation round for Principal UI Architect candidate.',
          date: 'Aug 29, 2026',
          pinned: true,
          tags: ['interview', 'engineering', 'react', 'evaluation'],
          candidateName: 'Elena Rostova',
          vacancyName: 'Staff DevOps / Frontend Architect',
          interviewerName: 'Michael Chang (VP Engineering)',
          interviewRound: 'Technical Deep Dive & Architecture',
          interviewDate: '2026-08-29',
          technicalRating: 9,
          communicationRating: 8,
          strengths: 'Excellent system design clarity, deep knowledge of React reconciler and SSR hydration.',
          improvements: 'Could expand on Kubernetes ingress controllers and multi-cluster routing.',
        },
        {
          title: 'Updated UAE Labor Law Gratuity Calculations 2026',
          category: 'HR Policy',
          content: 'Gratuity calculation based on 21 days basic salary for years 1-5, 30 days basic salary for 5+ years. Maximum cap set at 2 years salary.',
          description: 'Statutory compliance policy update regarding UAE end-of-service benefits (EOSB) scheme.',
          date: 'Aug 25, 2026',
          pinned: false,
          tags: ['policy', 'compliance', 'uae-law', 'gratuity', 'benefits'],
          applicableScope: 'Middle East & UAE Operations',
          policyStatus: 'Active',
        },
        {
          title: 'Remote Work Security & YubiKey Mandatory Policy',
          category: 'Memos',
          content: 'All remote employees must activate hardware 2FA key tokens for AWS and GitHub access by mid-month.',
          description: 'Executive security memo regarding hardware MFA enforcement across all engineering branches.',
          date: 'Aug 20, 2026',
          pinned: false,
          tags: ['memo', 'security', 'mfa', 'remote-work'],
          memoSubject: 'Mandatory Hardware Security Keys Deployment',
          visibility: 'internal',
          authorName: 'Chief Information Security Officer',
        },
      ];
      await NoteModel.insertMany(defaults);
    }
  }
}

export const notesRepository = new NotesRepository();
