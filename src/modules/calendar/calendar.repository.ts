import { CalendarEventModel } from './calendar.model';
import { ICalendarEventDocument, CalendarEventQueryParams } from './calendar.types';

export class CalendarRepository {
  async create(data: Partial<ICalendarEventDocument>): Promise<ICalendarEventDocument> {
    const item = new CalendarEventModel(data);
    return (await item.save()).populate('employeeId');
  }

  async findById(id: string): Promise<ICalendarEventDocument | null> {
    return CalendarEventModel.findById(id).populate('employeeId');
  }

  async update(id: string, data: Partial<ICalendarEventDocument>): Promise<ICalendarEventDocument | null> {
    return CalendarEventModel.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('employeeId');
  }

  async delete(id: string): Promise<ICalendarEventDocument | null> {
    return CalendarEventModel.findByIdAndDelete(id);
  }

  async findAll(params: CalendarEventQueryParams): Promise<{ items: ICalendarEventDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { location: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.type && params.type.toLowerCase() !== 'all') {
      query.type = { $regex: `^${params.type}$`, $options: 'i' };
    }

    if (params.date) {
      query.date = { $regex: params.date, $options: 'i' };
    }

    if (params.month) {
      query.date = { $regex: params.month, $options: 'i' };
    }

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(params.limit) || 100));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'date';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      CalendarEventModel.find(query)
        .populate('employeeId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      CalendarEventModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async seedDefaultEventsIfEmpty(): Promise<void> {
    const count = await CalendarEventModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<ICalendarEventDocument>[] = [
        {
          title: 'Company Wide All-Hands Sync',
          date: 'Sept 04, 2026',
          time: '10:00 AM - 11:30 AM',
          type: 'Meeting',
          location: 'Main Auditorium & Zoom',
          attendees: 145,
          status: 'Scheduled',
        },
        {
          title: 'Candidate Interview - Aisha Kumar',
          date: 'Sept 08, 2026',
          time: '02:00 PM - 03:00 PM',
          type: 'Interview',
          location: 'Google Meet',
          attendees: 4,
          status: 'Scheduled',
        },
        {
          title: 'Q3 Performance Review Deadline',
          date: 'Sept 15, 2026',
          time: 'All Day',
          type: 'Deadline',
          location: 'HR Portal',
          attendees: 350,
          status: 'Scheduled',
        },
        {
          title: 'Labor Day Public Holiday',
          date: 'Sept 21, 2026',
          time: 'Full Day Off',
          type: 'Holiday',
          location: 'Company Wide',
          attendees: 500,
          status: 'Scheduled',
        },
        {
          title: 'Off-Boarding F&F Sign-off Session',
          date: 'Sept 28, 2026',
          time: '04:00 PM - 05:00 PM',
          type: 'HR Admin',
          location: 'HR Suite 3B',
          attendees: 3,
          status: 'Scheduled',
        },
      ];
      await CalendarEventModel.insertMany(defaults);
    }
  }
}

export const calendarRepository = new CalendarRepository();
