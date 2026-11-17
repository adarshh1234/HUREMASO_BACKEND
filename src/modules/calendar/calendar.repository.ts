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

  async checkDuplicateHoliday(name: string, date: string, applicableScope = 'Company Wide'): Promise<boolean> {
    const existing = await CalendarEventModel.findOne({
      type: { $regex: '^holiday$', $options: 'i' },
      title: { $regex: `^${name.trim()}$`, $options: 'i' },
      date: date.trim(),
      applicableScope: { $regex: `^${applicableScope.trim()}$`, $options: 'i' },
    });
    return !!existing;
  }

  async findUpcoming(limit = 10, type?: string): Promise<ICalendarEventDocument[]> {
    const today = new Date().toISOString().split('T')[0];
    const query: any = {
      $or: [
        { date: { $gte: today } },
        { date: { $regex: '2026', $options: 'i' } }, // Match 2026 demo timeline
      ],
      status: { $ne: 'Cancelled' },
    };
    if (type && type.toLowerCase() !== 'all') {
      query.type = { $regex: `^${type}$`, $options: 'i' };
    }
    return CalendarEventModel.find(query)
      .populate('employeeId')
      .sort({ date: 1, startTime: 1 })
      .limit(limit);
  }

  async findAll(params: CalendarEventQueryParams): Promise<{ items: ICalendarEventDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      const s = params.search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { organizer: { $regex: s, $options: 'i' } },
        { candidateName: { $regex: s, $options: 'i' } },
        { assigneeName: { $regex: s, $options: 'i' } },
      ];
    }

    if (params.type && params.type.toLowerCase() !== 'all') {
      query.type = { $regex: `^${params.type.trim()}$`, $options: 'i' };
    }

    if (params.status && params.status.toLowerCase() !== 'all') {
      query.status = { $regex: `^${params.status.trim()}$`, $options: 'i' };
    }

    if (params.department && params.department.toLowerCase() !== 'all') {
      query.department = { $regex: `^${params.department.trim()}$`, $options: 'i' };
    }

    if (params.priority && params.priority.toLowerCase() !== 'all') {
      query.priority = { $regex: `^${params.priority.trim()}$`, $options: 'i' };
    }

    // Date range filtering
    if (params.fromDate && params.toDate) {
      query.date = { $gte: params.fromDate, $lte: params.toDate };
    } else if (params.fromDate) {
      query.date = { $gte: params.fromDate };
    } else if (params.toDate) {
      query.date = { $lte: params.toDate };
    } else if (params.date) {
      query.date = { $regex: params.date, $options: 'i' };
    }

    // Month filtering: handles "2026-09", "09", "Sept", "September"
    if (params.month) {
      const monthStr = params.month.trim();
      query.date = { $regex: monthStr, $options: 'i' };
    }

    // Year filtering: handles "2026"
    if (params.year) {
      const yearStr = String(params.year).trim();
      if (!query.date) {
        query.date = { $regex: yearStr, $options: 'i' };
      }
    }

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(500, Number(params.limit) || 200));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'date';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      CalendarEventModel.find(query)
        .populate('employeeId')
        .sort({ [sortField]: sortOrder, startTime: 1 })
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
          date: '2026-09-04',
          time: '10:00 AM - 11:30 AM',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          type: 'Meeting',
          location: 'Main Auditorium & Zoom',
          isOnline: true,
          meetingLink: 'https://zoom.us/j/987654321',
          agenda: 'Reviewing company Q3 metrics and HUREMASO roadmap',
          organizer: 'Sarah Joseph (HR VP)',
          attendees: 145,
          status: 'Scheduled',
          priority: 'High',
          description: 'Quarterly executive all-hands sync and company updates',
        },
        {
          title: 'Candidate Interview - Aisha Kumar',
          date: '2026-09-08',
          time: '02:00 PM - 03:00 PM',
          startTime: '02:00 PM',
          endTime: '03:00 PM',
          type: 'Interview',
          location: 'Google Meet',
          isOnline: true,
          meetingLink: 'https://meet.google.com/xyz-hure-maso',
          candidateName: 'Aisha Kumar',
          interviewerName: 'David Chen',
          jobPosition: 'Senior React Engineer',
          roundName: 'Technical Architecture Round',
          interviewMode: 'Online',
          organizer: 'Recruitment Team',
          attendees: 4,
          status: 'Scheduled',
          priority: 'High',
          description: 'Technical deep-dive into state architecture and frontend performance',
        },
        {
          title: 'Q3 Performance Review Deadline',
          date: '2026-09-15',
          time: '11:59 PM',
          startTime: '09:00 AM',
          endTime: '11:59 PM',
          type: 'Deadline',
          location: 'HR Portal',
          department: 'All Departments',
          assigneeName: 'All People Managers',
          priority: 'Urgent',
          attendees: 350,
          status: 'Scheduled',
          description: 'Final submission deadline for Q3 employee appraisal ratings and self-reviews',
        },
        {
          title: 'Labor Day Public Holiday',
          date: '2026-09-21',
          time: 'Full Day Off',
          type: 'Holiday',
          holidayType: 'Public',
          applicableScope: 'Company Wide',
          repeatsAnnually: true,
          location: 'Company Wide',
          attendees: 500,
          status: 'Scheduled',
          description: 'National labor day statutory public holiday across all regional offices',
        },
        {
          title: 'Off-Boarding F&F Sign-off Session',
          date: '2026-09-28',
          time: '04:00 PM - 05:00 PM',
          startTime: '04:00 PM',
          endTime: '05:00 PM',
          type: 'HR Admin',
          location: 'HR Suite 3B',
          organizer: 'Finance & HR Compliance',
          attendees: 3,
          status: 'Scheduled',
          priority: 'Medium',
          description: 'Final settlement audit and clearance documentation verification',
        },
      ];
      await CalendarEventModel.insertMany(defaults);
    }
  }
}

export const calendarRepository = new CalendarRepository();
