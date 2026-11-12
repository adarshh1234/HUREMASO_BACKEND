import { calendarRepository, CalendarRepository } from './calendar.repository';
import { CreateCalendarEventDTO, ICalendarEvent, CalendarEventQueryParams } from './calendar.types';
import { EmployeeModel } from '../employee/employee.model';

export class CalendarService {
  private repository: CalendarRepository;

  constructor() {
    this.repository = calendarRepository;
  }

  async getAllEvents(params: CalendarEventQueryParams): Promise<{ items: ICalendarEvent[]; total: number }> {
    await this.repository.seedDefaultEventsIfEmpty();
    const res = await this.repository.findAll(params);
    return {
      items: res.items.map((doc) => doc.toObject() as unknown as ICalendarEvent),
      total: res.total,
    };
  }

  async getEventById(id: string): Promise<ICalendarEvent | null> {
    const doc = await this.repository.findById(id);
    return doc ? (doc.toObject() as unknown as ICalendarEvent) : null;
  }

  async createEvent(dto: CreateCalendarEventDTO): Promise<ICalendarEvent> {
    let employeeId = dto.employeeId;
    if (employeeId) {
      const emp = await EmployeeModel.findById(employeeId);
      if (!emp) {
        employeeId = undefined;
      }
    }

    const doc = await this.repository.create({
      title: dto.title,
      date: dto.date,
      time: dto.time || 'All Day',
      type: dto.type || 'Meeting',
      location: dto.location || 'Main Auditorium & Zoom',
      attendees: dto.attendees || 1,
      description: dto.description,
      employeeId: employeeId as any,
      status: dto.status || 'Scheduled',
    });

    return doc.toObject() as unknown as ICalendarEvent;
  }

  async updateEvent(id: string, dto: Partial<CreateCalendarEventDTO>): Promise<ICalendarEvent | null> {
    const doc = await this.repository.update(id, dto as any);
    return doc ? (doc.toObject() as unknown as ICalendarEvent) : null;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return !!deleted;
  }
}

export const calendarService = new CalendarService();
