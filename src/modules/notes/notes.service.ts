import { notesRepository, NotesRepository } from './notes.repository';
import { CreateNoteDTO, INote, NoteQueryParams } from './notes.types';
import { EmployeeModel } from '../employee/employee.model';

export class NotesService {
  private repository: NotesRepository;

  constructor() {
    this.repository = notesRepository;
  }

  async getAllNotes(params: NoteQueryParams): Promise<{ items: INote[]; total: number }> {
    await this.repository.seedDefaultNotesIfEmpty();
    const res = await this.repository.findAll(params);
    return {
      items: res.items.map((doc) => doc.toObject() as unknown as INote),
      total: res.total,
    };
  }

  async getNoteById(id: string): Promise<INote | null> {
    const doc = await this.repository.findById(id);
    return doc ? (doc.toObject() as unknown as INote) : null;
  }

  async createNote(dto: CreateNoteDTO): Promise<INote> {
    let employeeId = dto.employeeId;
    if (employeeId) {
      const emp = await EmployeeModel.findById(employeeId);
      if (!emp) {
        employeeId = undefined;
      }
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const defaultDate = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;

    const doc = await this.repository.create({
      title: dto.title,
      category: dto.category || 'HR Policy',
      content: dto.content,
      date: dto.date || defaultDate,
      pinned: dto.pinned ?? false,
      tags: dto.tags || [],
      aiSummary: dto.aiSummary,
      employeeId: employeeId as any,
    });

    return doc.toObject() as unknown as INote;
  }

  async updateNote(id: string, dto: Partial<CreateNoteDTO>): Promise<INote | null> {
    const doc = await this.repository.update(id, dto as any);
    return doc ? (doc.toObject() as unknown as INote) : null;
  }

  async togglePin(id: string, pinned?: boolean): Promise<INote | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const nextPinned = pinned !== undefined ? pinned : !existing.pinned;
    const doc = await this.repository.update(id, { pinned: nextPinned });
    return doc ? (doc.toObject() as unknown as INote) : null;
  }

  async aiSummarize(id: string): Promise<{ note: INote; summary: string } | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const summary = `AI Summary for "${existing.title}": Key policies, action items, and compliance requirements highlighted.`;
    const doc = await this.repository.update(id, { aiSummary: summary });
    return {
      note: doc!.toObject() as unknown as INote,
      summary,
    };
  }

  async deleteNote(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return !!deleted;
  }
}

export const notesService = new NotesService();
