import { calendarRepository, CalendarRepository } from './calendar.repository';
import {
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
  RescheduleEventDTO,
  ICalendarEvent,
  CalendarEventQueryParams,
  CalendarEventStatus,
} from './calendar.types';
import { EmployeeModel } from '../employee/employee.model';
import { AppError } from '../../common/errors/AppError';
import { InterviewModel } from '../recruitment/interview/interview.model';
import { HolidayModel } from '../employee/leave/leave.model';
import { TaskModel } from '../tasks/tasks.model';

export class CalendarService {
  private repository: CalendarRepository;

  constructor() {
    this.repository = calendarRepository;
  }

  async getAllEvents(params: CalendarEventQueryParams): Promise<{ items: ICalendarEvent[]; total: number }> {
    await this.repository.seedDefaultEventsIfEmpty();
    const res = await this.repository.findAll(params);
    let items = res.items.map((doc) => doc.toObject() as unknown as ICalendarEvent);

    // Merge Recruitment interviews if requested or when showing All / Interviews
    const typeLower = (params.type || '').toLowerCase();
    const shouldIncludeInterviews = !params.type || typeLower === 'all' || typeLower === 'interview';
    const shouldIncludeHolidays = !params.type || typeLower === 'all' || typeLower === 'holiday';
    const shouldIncludeDeadlines = !params.type || typeLower === 'all' || typeLower === 'deadline';

    if (shouldIncludeInterviews) {
      try {
        const recruitmentInterviews = await this.getRecruitmentInterviews(params);
        items = [...items, ...recruitmentInterviews];
      } catch (err) {
        console.warn('Could not fetch recruitment interviews for calendar view:', err);
      }
    }

    if (shouldIncludeHolidays) {
      try {
        const leaveHolidays = await this.getLeaveHolidays(params);
        items = [...items, ...leaveHolidays];
      } catch (err) {
        console.warn('Could not fetch leave holidays for calendar view:', err);
      }
    }

    if (shouldIncludeDeadlines) {
      try {
        const taskDeadlines = await this.getTaskDeadlines(params);
        items = [...items, ...taskDeadlines];
      } catch (err) {
        console.warn('Could not fetch task deadlines for calendar view:', err);
      }
    }

    // Sort combined events chronologically
    items.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateA.localeCompare(dateB);
    });

    return {
      items,
      total: items.length,
    };
  }

  async getEventById(id: string): Promise<ICalendarEvent | null> {
    const doc = await this.repository.findById(id);
    if (doc) return doc.toObject() as unknown as ICalendarEvent;

    // Check Recruitment interview fallback
    try {
      const interview = await InterviewModel.findById(id).populate('candidateId vacancyId').lean().exec();
      if (interview) {
        return this.adaptRecruitmentInterview(interview);
      }
    } catch {
      // Ignore
    }

    // Check Leave holiday fallback
    try {
      const holiday = await HolidayModel.findById(id).lean().exec();
      if (holiday) {
        return this.adaptLeaveHoliday(holiday);
      }
    } catch {
      // Ignore
    }

    // Check Task deadline fallback
    try {
      const task = await TaskModel.findById(id).lean().exec();
      if (task) {
        return this.adaptTaskDeadline(task);
      }
    } catch {
      // Ignore
    }

    return null;
  }

  async createEvent(dto: CreateCalendarEventDTO): Promise<ICalendarEvent> {
    if (!dto.title || !dto.title.trim()) {
      throw AppError.badRequest('Event title is required');
    }
    if (!dto.date || !dto.date.trim()) {
      throw AppError.badRequest('Event date is required');
    }

    // Duplicate check for holidays
    const eventType = dto.type || 'Meeting';
    if (eventType.toLowerCase() === 'holiday') {
      const isDuplicate = await this.repository.checkDuplicateHoliday(
        dto.title,
        dto.date,
        dto.applicableScope || 'Company Wide'
      );
      if (isDuplicate) {
        throw AppError.badRequest(`Holiday '${dto.title}' already exists for date ${dto.date}`);
      }
    }

    // End time validation
    if (dto.startTime && dto.endTime) {
      const timeStr = `${dto.startTime} - ${dto.endTime}`;
      if (!dto.time || dto.time === '10:00 AM - 11:00 AM') {
        dto.time = timeStr;
      }
    }

    let employeeId = dto.employeeId;
    if (employeeId) {
      const emp = await EmployeeModel.findById(employeeId);
      if (!emp) {
        employeeId = undefined;
      }
    }

    const doc = await this.repository.create({
      title: dto.title.trim(),
      description: dto.description?.trim(),
      date: dto.date.trim(),
      endDate: dto.endDate?.trim(),
      time: dto.time || (dto.startTime ? `${dto.startTime}${dto.endTime ? ` - ${dto.endTime}` : ''}` : 'All Day'),
      startTime: dto.startTime,
      endTime: dto.endTime,
      type: eventType,
      location: dto.location || (dto.isOnline ? 'Online / Virtual' : 'Main Office'),
      isOnline: dto.isOnline ?? (dto.meetingLink ? true : false),
      meetingLink: dto.meetingLink?.trim(),
      agenda: dto.agenda?.trim(),
      attendees: dto.attendees ?? (dto.attendeeList ? dto.attendeeList.length : 1),
      attendeeList: dto.attendeeList,
      organizer: dto.organizer || 'HR Department',
      organizerId: dto.organizerId,
      employeeId: employeeId as any,
      status: dto.status || 'Scheduled',
      priority: dto.priority || 'Medium',
      department: dto.department,
      assigneeName: dto.assigneeName,
      assigneeId: dto.assigneeId,
      candidateName: dto.candidateName,
      candidateId: dto.candidateId,
      interviewerName: dto.interviewerName,
      jobPosition: dto.jobPosition,
      roundName: dto.roundName,
      interviewMode: dto.interviewMode || 'Online',
      holidayType: dto.holidayType || 'Public',
      applicableScope: dto.applicableScope || 'Company Wide',
      repeatsAnnually: dto.repeatsAnnually ?? false,
      dueTime: dto.dueTime,
      notes: dto.notes,
      reminder: dto.reminder ?? false,
      source: 'calendar',
    });

    return doc.toObject() as unknown as ICalendarEvent;
  }

  async updateEvent(id: string, dto: UpdateCalendarEventDTO): Promise<ICalendarEvent | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound('Calendar event not found');
    }

    // Format time if startTime and endTime provided
    if (dto.startTime && dto.endTime) {
      dto.time = `${dto.startTime} - ${dto.endTime}`;
    }

    const doc = await this.repository.update(id, dto as any);
    return doc ? (doc.toObject() as unknown as ICalendarEvent) : null;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound('Calendar event not found');
    }
    const deleted = await this.repository.delete(id);
    return !!deleted;
  }

  async rescheduleEvent(id: string, dto: RescheduleEventDTO): Promise<ICalendarEvent> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound('Calendar event not found');
    }

    const updateData: Partial<ICalendarEvent> = {
      date: dto.date,
      status: 'Rescheduled',
    };
    if (dto.startTime) updateData.startTime = dto.startTime;
    if (dto.endTime) updateData.endTime = dto.endTime;
    if (dto.time) updateData.time = dto.time;
    else if (dto.startTime && dto.endTime) updateData.time = `${dto.startTime} - ${dto.endTime}`;
    if (dto.notes) {
      updateData.notes = existing.notes ? `${existing.notes}\nReschedule Note: ${dto.notes}` : `Reschedule Note: ${dto.notes}`;
    }

    const updated = await this.repository.update(id, updateData as any);
    if (!updated) throw AppError.notFound('Failed to reschedule event');
    return updated.toObject() as unknown as ICalendarEvent;
  }

  async updateEventStatus(id: string, status: CalendarEventStatus, notes?: string): Promise<ICalendarEvent> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound('Calendar event not found');
    }

    const updateData: Partial<ICalendarEvent> = { status };
    if (status === 'Completed') {
      updateData.completedAt = new Date();
    }
    if (notes) {
      updateData.notes = existing.notes ? `${existing.notes}\nStatus Note: ${notes}` : notes;
    }

    const updated = await this.repository.update(id, updateData as any);
    if (!updated) throw AppError.notFound('Failed to update event status');
    return updated.toObject() as unknown as ICalendarEvent;
  }

  async getUpcomingEvents(limit = 10, type?: string): Promise<ICalendarEvent[]> {
    await this.repository.seedDefaultEventsIfEmpty();
    const docs = await this.repository.findUpcoming(limit, type);
    return docs.map((d) => d.toObject() as unknown as ICalendarEvent);
  }

  async getMeetings(params: CalendarEventQueryParams): Promise<{ items: ICalendarEvent[]; total: number }> {
    return this.getAllEvents({ ...params, type: 'Meeting' });
  }

  async getInterviews(params: CalendarEventQueryParams): Promise<{ items: ICalendarEvent[]; total: number }> {
    return this.getAllEvents({ ...params, type: 'Interview' });
  }

  async getHolidays(params: CalendarEventQueryParams): Promise<{ items: ICalendarEvent[]; total: number }> {
    return this.getAllEvents({ ...params, type: 'Holiday' });
  }

  async getDeadlines(params: CalendarEventQueryParams): Promise<{ items: ICalendarEvent[]; total: number }> {
    return this.getAllEvents({ ...params, type: 'Deadline' });
  }

  // --- RECRUITMENT INTERVIEW ADAPTER ---
  private async getRecruitmentInterviews(params: CalendarEventQueryParams): Promise<ICalendarEvent[]> {
    try {
      const query: any = {};
      if (params.status && params.status.toLowerCase() !== 'all') {
        query.status = { $regex: `^${params.status}$`, $options: 'i' };
      }
      const rawInterviews = await InterviewModel.find(query)
        .populate('candidateId')
        .populate('vacancyId')
        .sort({ interviewDate: 1 })
        .limit(50)
        .lean()
        .exec();

      return rawInterviews.map((iv) => this.adaptRecruitmentInterview(iv));
    } catch {
      return [];
    }
  }

  private adaptRecruitmentInterview(iv: any): ICalendarEvent {
    const candidate = iv.candidateId as any;
    const vacancy = iv.vacancyId as any;
    const candName = candidate ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() : iv.candidateName || 'Candidate';
    const jobPos = vacancy?.title || vacancy?.jobTitle || iv.jobPosition || 'Job Opening';
    const interviewerNames = Array.isArray(iv.interviewers) ? iv.interviewers.map((i: any) => i.name).join(', ') : 'Interview Panel';
    const dateStr = iv.interviewDate instanceof Date ? iv.interviewDate.toISOString().split('T')[0] : String(iv.interviewDate || '');

    return {
      id: iv._id?.toString() || iv.id,
      _id: iv._id,
      title: `Interview: ${candName} - ${iv.roundName || 'Technical Round'}`,
      description: `Job: ${jobPos} | Panel: ${interviewerNames} ${iv.notes ? `| ${iv.notes}` : ''}`,
      date: dateStr,
      time: iv.startTime ? `${iv.startTime}${iv.endTime ? ` - ${iv.endTime}` : ''}` : 'Scheduled Time',
      startTime: iv.startTime,
      endTime: iv.endTime,
      type: 'Interview',
      location: iv.location || (iv.mode === 'Online' ? (iv.meetingLink || 'Online Video Link') : 'Main Office'),
      isOnline: iv.mode === 'Online',
      meetingLink: iv.meetingLink,
      attendees: (Array.isArray(iv.interviewers) ? iv.interviewers.length : 1) + 1,
      status: iv.status || 'Scheduled',
      candidateName: candName,
      candidateId: candidate?._id?.toString(),
      interviewerName: interviewerNames,
      jobPosition: jobPos,
      roundName: iv.roundName,
      interviewMode: iv.mode || 'Online',
      organizer: 'Recruitment Team',
      source: 'recruitment',
      externalId: iv._id?.toString(),
    };
  }

  // --- LEAVE HOLIDAYS ADAPTER ---
  private async getLeaveHolidays(params: CalendarEventQueryParams): Promise<ICalendarEvent[]> {
    try {
      const rawHolidays = await HolidayModel.find().sort({ date: 1 }).limit(50).lean().exec();
      return rawHolidays.map((h) => this.adaptLeaveHoliday(h));
    } catch {
      return [];
    }
  }

  private adaptLeaveHoliday(h: any): ICalendarEvent {
    return {
      id: h._id?.toString() || h.id,
      _id: h._id,
      title: h.name || 'Public Holiday',
      description: `Holiday Schedule (${h.dayType || 'Full Day'})${h.repeatsAnnually ? ' • Repeats Annually' : ''}`,
      date: h.date || '',
      time: h.dayType || 'Full Day Off',
      type: 'Holiday',
      holidayType: 'Public',
      applicableScope: 'Company Wide',
      repeatsAnnually: h.repeatsAnnually ?? false,
      location: 'Company Wide',
      attendees: 500,
      status: 'Scheduled',
      source: 'leave',
      externalId: h._id?.toString(),
    };
  }

  // --- TASKS DEADLINES ADAPTER ---
  private async getTaskDeadlines(params: CalendarEventQueryParams): Promise<ICalendarEvent[]> {
    try {
      const rawTasks = await TaskModel.find({ dueDate: { $exists: true, $ne: '' } })
        .sort({ dueDate: 1 })
        .limit(50)
        .lean()
        .exec();
      return rawTasks.map((t) => this.adaptTaskDeadline(t));
    } catch {
      return [];
    }
  }

  private adaptTaskDeadline(t: any): ICalendarEvent {
    const isCompleted = t.column === 'completed';
    return {
      id: t._id?.toString() || t.id,
      _id: t._id,
      title: `Task Deadline: ${t.title}`,
      description: t.description || `Task priority: ${t.priority || 'Medium'}`,
      date: t.dueDate || '',
      time: '11:59 PM',
      type: 'Deadline',
      location: 'Task Board',
      department: 'Operations',
      assigneeName: t.assigneeName || 'Assigned Staff',
      priority: (t.priority as any) || 'Medium',
      status: isCompleted ? 'Completed' : 'Scheduled',
      attendees: 1,
      source: 'tasks',
      externalId: t._id?.toString(),
    };
  }
}

export const calendarService = new CalendarService();
