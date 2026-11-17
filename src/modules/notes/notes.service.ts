import { notesRepository, NotesRepository } from './notes.repository';
import { CreateNoteDTO, INote, NoteQueryParams, IChecklistItem, CategoryCountSummary } from './notes.types';
import { EmployeeModel } from '../employee/employee.model';
import { aiProvider } from '../ai/ai.engine';

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

    // Normalize checklist items if present
    const checklistItems: IChecklistItem[] = (dto.checklistItems || []).map((item, index) => ({
      id: item.id || `chk-${Date.now()}-${index}`,
      text: item.text,
      completed: item.completed ?? false,
      order: item.order ?? index + 1,
    }));

    const doc = await this.repository.create({
      title: dto.title,
      category: dto.category || 'HR Policy',
      content: dto.content,
      description: dto.description,
      date: dto.date || defaultDate,
      pinned: dto.pinned ?? false,
      tags: dto.tags || [],
      aiSummary: dto.aiSummary,
      checklistItems,

      // Interview Notes metadata
      candidateName: dto.candidateName,
      candidateId: dto.candidateId as any,
      interviewId: dto.interviewId as any,
      vacancyName: dto.vacancyName,
      interviewerName: dto.interviewerName,
      interviewRound: dto.interviewRound,
      interviewDate: dto.interviewDate,
      technicalRating: dto.technicalRating,
      communicationRating: dto.communicationRating,
      strengths: dto.strengths,
      improvements: dto.improvements,

      // HR Policy / Memo metadata
      applicableScope: dto.applicableScope,
      policyStatus: dto.policyStatus || 'Active',
      memoSubject: dto.memoSubject,
      visibility: dto.visibility || 'internal',
      authorName: dto.authorName,
      authorId: dto.authorId as any,

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

  async updateChecklist(id: string, items: IChecklistItem[]): Promise<INote | null> {
    const doc = await this.repository.updateChecklist(id, items);
    return doc ? (doc.toObject() as unknown as INote) : null;
  }

  async toggleChecklistItem(id: string, itemId: string, completed?: boolean): Promise<INote | null> {
    const doc = await this.repository.toggleChecklistItem(id, itemId, completed);
    return doc ? (doc.toObject() as unknown as INote) : null;
  }

  async getCategoryCounts(): Promise<CategoryCountSummary> {
    await this.repository.seedDefaultNotesIfEmpty();
    return this.repository.getCategoryCounts();
  }

  async getAllTags(): Promise<string[]> {
    await this.repository.seedDefaultNotesIfEmpty();
    return this.repository.getAllTags();
  }

  async aiSummarize(id: string): Promise<{ note: INote; summary: string } | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    let prompt = `Provide a concise, professional executive summary highlighting key policies, takeaways, evaluation points, and action items for this HR note:\n\nTitle: ${existing.title}\nCategory: ${existing.category}\nContent: ${existing.content}`;

    if (existing.checklistItems && existing.checklistItems.length > 0) {
      prompt += `\nChecklist Items:\n${existing.checklistItems.map((i) => `- [${i.completed ? 'x' : ' '}] ${i.text}`).join('\n')}`;
    }
    if (existing.candidateName) {
      prompt += `\nCandidate: ${existing.candidateName}, Position: ${existing.vacancyName || 'N/A'}, Round: ${existing.interviewRound || 'N/A'}`;
    }
    if (existing.applicableScope) {
      prompt += `\nApplicable Scope: ${existing.applicableScope}`;
    }

    let summaryText = '';
    try {
      const response = await aiProvider.generateChatResponse(prompt, {
        category: existing.category,
        noteId: id,
      });
      summaryText = response.text.trim();
    } catch (err: any) {
      console.warn('AI provider call failed in NotesService, using deterministic domain summarizer:', err?.message || err);
    }

    // If summaryText is empty or not generated by AI, create structured domain summary
    if (!summaryText) {
      const bulletPoints: string[] = [];
      bulletPoints.push(`Core Objective: ${existing.title} (${existing.category})`);

      if (existing.content) {
        bulletPoints.push(`Key Insight: ${existing.content.slice(0, 180)}...`);
      }
      if (existing.checklistItems && existing.checklistItems.length > 0) {
        const completedCount = existing.checklistItems.filter((i) => i.completed).length;
        bulletPoints.push(`Checklist Progress: ${completedCount}/${existing.checklistItems.length} items completed (${Math.round((completedCount / existing.checklistItems.length) * 100)}%).`);
      }
      if (existing.candidateName) {
        bulletPoints.push(`Candidate Evaluation: ${existing.candidateName} for ${existing.vacancyName || 'position'} - Technical: ${existing.technicalRating || 'N/A'}/10.`);
      }
      summaryText = bulletPoints.join('\n');
    }

    const doc = await this.repository.update(id, { aiSummary: summaryText });
    return {
      note: doc!.toObject() as unknown as INote,
      summary: summaryText,
    };
  }

  async deleteNote(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return !!deleted;
  }
}

export const notesService = new NotesService();
