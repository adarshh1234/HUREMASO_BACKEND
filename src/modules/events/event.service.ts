import { eventRepository, EventRepository } from './event.repository';
import {
  ICompanyEvent,
  ICompanyEventDocument,
  ISupportEvent,
  ISupportEventDocument,
  IEventsNewsletter,
  IEventsNewsletterDocument,
  IEventsBudgetItem,
  IEventsBudgetItemDocument,
  EventQueryParams,
  EventsSummaryStats,
} from './events.types';
import { AppError } from '../../common/errors/AppError';

export class EventService {
  constructor(private repo: EventRepository = eventRepository) {}

  // Events CRUD
  async getAllEvents(params: EventQueryParams): Promise<{ items: ICompanyEventDocument[]; total: number }> {
    return this.repo.findAllEvents(params);
  }

  async getEventById(id: string): Promise<ICompanyEventDocument> {
    const item = await this.repo.findEventById(id);
    if (!item) {
      throw AppError.notFound(`Event with ID ${id} not found`);
    }
    return item;
  }

  async createEvent(data: Partial<ICompanyEvent>): Promise<ICompanyEventDocument> {
    const event = await this.repo.createEvent(data);
    // Auto-create matching budget item if allocated amount provided
    if (data.budget && data.budget.allocated > 0) {
      await this.repo.createBudget({
        eventName: data.title || 'Untitled Event',
        eventId: event._id.toString(),
        category: data.category || 'Venue & Catering',
        allocated: data.budget.allocated,
        spent: data.budget.spent || 0,
        status: data.budget.status || 'Approved',
        owner: data.organizer || 'Sarah Joseph',
      }).catch(() => null);
    }
    return event;
  }

  async updateEvent(id: string, data: Partial<ICompanyEvent>): Promise<ICompanyEventDocument> {
    const updated = await this.repo.updateEventById(id, data);
    if (!updated) {
      throw AppError.notFound(`Event with ID ${id} not found`);
    }
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    const deleted = await this.repo.deleteEventById(id);
    if (!deleted) {
      throw AppError.notFound(`Event with ID ${id} not found`);
    }
  }

  // Support Events
  async getAllSupportEvents(): Promise<ISupportEventDocument[]> {
    return this.repo.findAllSupportEvents();
  }

  async createSupportEvent(data: Partial<ISupportEvent>): Promise<ISupportEventDocument> {
    return this.repo.createSupportEvent(data);
  }

  async updateSupportEvent(id: string, data: Partial<ISupportEvent> & { reply?: { author: string; text: string } }): Promise<ISupportEventDocument> {
    const current = await this.repo.findEventById(id).catch(() => null);
    if (data.reply) {
      const supportTicket = await this.repo.findAllSupportEvents().then((items) => items.find((i) => i.id === id || i._id.toString() === id));
      if (supportTicket) {
        const currentReplies = supportTicket.replies || [];
        const updated = await this.repo.updateSupportEventById(id, {
          ...data,
          replaysCount: (supportTicket.replaysCount || 0) + 1,
          replies: [...currentReplies, { author: data.reply.author, text: data.reply.text, date: new Date().toISOString() }],
        });
        if (!updated) throw AppError.notFound(`Support event ${id} not found`);
        return updated;
      }
    }
    const updated = await this.repo.updateSupportEventById(id, data);
    if (!updated) {
      throw AppError.notFound(`Support event ${id} not found`);
    }
    return updated;
  }

  async deleteSupportEvent(id: string): Promise<void> {
    const deleted = await this.repo.deleteSupportEventById(id);
    if (!deleted) {
      throw AppError.notFound(`Support event ${id} not found`);
    }
  }

  // Newsletters
  async getAllNewsletters(): Promise<IEventsNewsletterDocument[]> {
    return this.repo.findAllNewsletters();
  }

  async createNewsletter(data: Partial<IEventsNewsletter>): Promise<IEventsNewsletterDocument> {
    return this.repo.createNewsletter(data);
  }

  async updateNewsletter(id: string, data: Partial<IEventsNewsletter>): Promise<IEventsNewsletterDocument> {
    const updated = await this.repo.updateNewsletterById(id, data);
    if (!updated) {
      throw AppError.notFound(`Newsletter with ID ${id} not found`);
    }
    return updated;
  }

  async deleteNewsletter(id: string): Promise<void> {
    const deleted = await this.repo.deleteNewsletterById(id);
    if (!deleted) {
      throw AppError.notFound(`Newsletter with ID ${id} not found`);
    }
  }

  // Budgets
  async getAllBudgets(): Promise<IEventsBudgetItemDocument[]> {
    return this.repo.findAllBudgets();
  }

  async createBudget(data: Partial<IEventsBudgetItem>): Promise<IEventsBudgetItemDocument> {
    return this.repo.createBudget(data);
  }

  async updateBudget(id: string, data: Partial<IEventsBudgetItem>): Promise<IEventsBudgetItemDocument> {
    const updated = await this.repo.updateBudgetById(id, data);
    if (!updated) {
      throw AppError.notFound(`Budget item with ID ${id} not found`);
    }
    return updated;
  }

  async deleteBudget(id: string): Promise<void> {
    const deleted = await this.repo.deleteBudgetById(id);
    if (!deleted) {
      throw AppError.notFound(`Budget item with ID ${id} not found`);
    }
  }

  // Stats
  async getSummaryStats(): Promise<EventsSummaryStats> {
    return this.repo.getSummaryStats();
  }
}

export const eventService = new EventService();
