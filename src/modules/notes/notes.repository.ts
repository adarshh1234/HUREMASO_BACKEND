import { NoteModel } from './notes.model';
import { INoteDocument, NoteQueryParams } from './notes.types';

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

    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { content: { $regex: params.search, $options: 'i' } },
        { category: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.category && params.category.toLowerCase() !== 'all') {
      query.category = { $regex: `^${params.category}$`, $options: 'i' };
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

    const [items, total] = await Promise.all([
      NoteModel.find(query)
        .populate('employeeId')
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NoteModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async seedDefaultNotesIfEmpty(): Promise<void> {
    const count = await NoteModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<INoteDocument>[] = [
        {
          title: 'Q3 Onboarding SLA & Compliance Checklist',
          category: 'Checklists',
          content: 'Ensure all background checks from First Advantage are verified before day 1. Hardware laptops must be shipped 3 days prior.',
          date: 'Sept 01, 2026',
          pinned: true,
        },
        {
          title: 'Senior Frontend Engineer Interview Evaluation Notes',
          category: 'Interview Notes',
          content: 'Candidate demonstrated deep understanding of React 19 concurrent features, micro-frontend architecture, and Web Vitals optimization.',
          date: 'Aug 29, 2026',
          pinned: true,
        },
        {
          title: 'Updated UAE Labor Law Gratuity Calculations 2026',
          category: 'HR Policy',
          content: 'Gratuity calculation based on 21 days basic salary for years 1-5, 30 days basic salary for 5+ years. Maximum cap set at 2 years salary.',
          date: 'Aug 25, 2026',
          pinned: false,
        },
        {
          title: 'Remote Work Security & YubiKey Mandatory Policy',
          category: 'Memos',
          content: 'All remote employees must activate hardware 2FA key tokens for AWS and GitHub access by mid-month.',
          date: 'Aug 20, 2026',
          pinned: false,
        },
      ];
      await NoteModel.insertMany(defaults);
    }
  }
}

export const notesRepository = new NotesRepository();
