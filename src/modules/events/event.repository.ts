import {
  CompanyEventModel,
  SupportEventModel,
  EventsNewsletterModel,
  EventsBudgetModel,
} from './event.model';
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

const INITIAL_EVENTS_SEED: Partial<ICompanyEvent>[] = [
  {
    title: 'Annual Leadership Training 2026',
    eventType: 'Training Session',
    category: 'Training',
    description: 'Executive leadership intensive workshop focusing on strategic execution, team alignment, and agile HR transformation.',
    startDate: '2026-07-20',
    startTime: '9:00 AM',
    endDate: '2026-07-20',
    endTime: '4:00 PM',
    timezone: 'UTC+4 (Dubai)',
    venue: 'Main Conference Room A',
    locationType: 'in-person',
    department: 'All Department',
    organizer: 'Sarah Jo',
    status: 'In Progress',
    progress: '20/20 Task',
    attendeeCount: 24,
    attendees: ['Sarah Jo', 'David Vance', 'Alex Morgan', 'Marcus Vance', 'Emily Davis'],
    budget: { allocated: 18000, spent: 16500, status: 'Approved' },
    tasks: [
      { name: 'Prepare presentation slides', due: 'July 20, 2026', assignee: 'Sarah Jo', status: 'In Progress', progress: 60 },
      { name: 'Review employee feedback', due: 'July 21, 2026', assignee: 'Sarah Jo', status: 'Pending', progress: 35 },
      { name: 'Update company policies', due: 'July 24, 2026', assignee: 'Sarah Jo', status: 'Not Started', progress: 0 },
      { name: 'Book conference room', due: 'July 28, 2026', assignee: 'Sarah Jo', status: 'In Progress', progress: 80 },
    ],
  },
  {
    title: 'Q3 All-Hands Tech Summit & Hackathon',
    eventType: 'Team Meeting',
    category: 'Innovation',
    description: 'Quarterly all-hands developer gathering featuring product roadmap presentations, live prototype demos, and hackathon awards.',
    startDate: '2026-08-25',
    startTime: '10:00 AM',
    endDate: '2026-08-25',
    endTime: '5:00 PM',
    timezone: 'UTC+4 (Dubai)',
    venue: 'Innovation Auditorium',
    locationType: 'in-person',
    department: 'Engineering',
    organizer: 'Alex Morgan',
    status: 'Up coming',
    progress: '7/20 Task',
    attendeeCount: 65,
    attendees: ['Alex Morgan', 'Sarah Jenkins', 'David Miller'],
    budget: { allocated: 6500, spent: 5800, status: 'Approved' },
    tasks: [
      { name: 'Secure keynote speakers', due: 'August 15, 2026', assignee: 'Alex Morgan', status: 'In Progress', progress: 75 },
      { name: 'Order hackathon catering & swag kits', due: 'August 18, 2026', assignee: 'Sarah Jo', status: 'Pending', progress: 40 },
    ],
  },
  {
    title: 'Autumn Team Leadership Retreat 2026',
    eventType: 'Training Session',
    category: 'Offsite',
    description: 'Offsite strategic planning session for senior management and team leads.',
    startDate: '2026-09-15',
    startTime: '8:30 AM',
    endDate: '2026-09-17',
    endTime: '6:00 PM',
    timezone: 'UTC+4 (Dubai)',
    venue: 'Fujairah Mountain Resort',
    locationType: 'in-person',
    department: 'Leadership',
    organizer: 'David Vance',
    status: 'Planing',
    progress: '4/20 Task',
    attendeeCount: 18,
    attendees: ['David Vance', 'Marcus Vance', 'Victoria Sterling'],
    budget: { allocated: 12000, spent: 13200, status: 'Over Budget' },
    tasks: [
      { name: 'Confirm resort booking', due: 'August 30, 2026', assignee: 'David Vance', status: 'Pending', progress: 50 },
    ],
  },
];

const INITIAL_SUPPORT_SEED: Partial<ISupportEvent>[] = [
  {
    title: 'Employee Onboarding System Access Issue',
    description: 'New employee unable to access HR portal after completing onboarding process. Permission sync delay noticed.',
    author: 'Sarah Jo',
    timeAgo: '2 hr ago',
    replaysCount: 3,
    status: 'Open',
    replies: [
      { author: 'IT Support', text: 'IAM profile permissions re-synced.', date: '2026-09-20T10:00:00Z' },
    ],
  },
  {
    title: 'Conference Room Smart Display AV Glitch',
    description: 'HDMI and wireless screen casting in Boardroom B failing to connect to presentation laptop.',
    author: 'Marcus Vance',
    timeAgo: '4 hr ago',
    replaysCount: 2,
    status: 'Open',
    replies: [],
  },
  {
    title: 'Catering Vendor Delivery Timing Adjustment',
    description: 'Requesting to shift Friday team lunch buffet delivery from 1:00 PM to 12:30 PM due to town hall schedule.',
    author: 'Rachel Green',
    timeAgo: '1 day ago',
    replaysCount: 4,
    status: 'Resolved',
    replies: [],
  },
];

const INITIAL_NEWSLETTERS_SEED: Partial<IEventsNewsletter>[] = [
  {
    title: 'HUREMASO Annual Tech Summit 2026: Keynote & Hackathon Highlights',
    category: 'Company Events',
    publishDate: 'Aug 28, 2026',
    author: 'HR Communications Team',
    reads: 342,
    likes: 89,
    status: 'Published',
    summary: 'A recap of our 3-day annual developer hackathon featuring groundbreaking AI prototypes and leadership keynotes.',
  },
  {
    title: 'Q3 Wellness Week & Employee Recognition Ceremony',
    category: 'Employee Experience',
    publishDate: 'Aug 15, 2026',
    author: 'Sarah Joseph',
    reads: 278,
    likes: 64,
    status: 'Published',
    summary: 'Celebrating our top performers of Q3 and unveiling new wellness stipends for all regional offices.',
  },
  {
    title: 'Upcoming Autumn Team Retreat & Sports Tournament Announcement',
    category: 'Social Events',
    publishDate: 'Sep 05, 2026',
    author: 'Events Committee',
    reads: 120,
    likes: 35,
    status: 'Scheduled',
    summary: 'Get ready for our annual sports weekend! Registration opens this Friday.',
  },
];

const INITIAL_BUDGETS_SEED: Partial<IEventsBudgetItem>[] = [
  {
    eventName: 'Annual Corporate Gala 2026',
    category: 'Grand Venue & Banquet',
    allocated: 18000,
    spent: 16500,
    status: 'Approved',
    owner: 'Sarah Joseph',
  },
  {
    eventName: 'Q3 All-Hands Tech Hackathon',
    category: 'Catering & Swag Kits',
    allocated: 6500,
    spent: 5800,
    status: 'Approved',
    owner: 'Alex Morgan',
  },
  {
    eventName: 'Autumn Team Leadership Retreat',
    category: 'Travel & Accommodation',
    allocated: 12000,
    spent: 13200,
    status: 'Over Budget',
    owner: 'David Vance',
  },
  {
    eventName: 'End of Year CSR Charity Run',
    category: 'Logistics & Branding',
    allocated: 4500,
    spent: 0,
    status: 'Pending Review',
    owner: 'Rachel Green',
  },
];

export class EventRepository {
  private async ensureSeedData(): Promise<void> {
    const eventCount = await CompanyEventModel.countDocuments();
    if (eventCount === 0) {
      await CompanyEventModel.insertMany(INITIAL_EVENTS_SEED);
    }
    const supportCount = await SupportEventModel.countDocuments();
    if (supportCount === 0) {
      await SupportEventModel.insertMany(INITIAL_SUPPORT_SEED);
    }
    const newsCount = await EventsNewsletterModel.countDocuments();
    if (newsCount === 0) {
      await EventsNewsletterModel.insertMany(INITIAL_NEWSLETTERS_SEED);
    }
    const budgetCount = await EventsBudgetModel.countDocuments();
    if (budgetCount === 0) {
      await EventsBudgetModel.insertMany(INITIAL_BUDGETS_SEED);
    }
  }

  // Events CRUD
  async findAllEvents(params: EventQueryParams): Promise<{ items: ICompanyEventDocument[]; total: number }> {
    await this.ensureSeedData();
    const query: Record<string, any> = {};

    if (params.search) {
      const regex = new RegExp(params.search, 'i');
      query.$or = [
        { title: regex },
        { eventType: regex },
        { venue: regex },
        { department: regex },
        { organizer: regex },
      ];
    }
    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }
    if (params.eventType && params.eventType !== 'All') {
      query.eventType = params.eventType;
    }
    if (params.department && params.department !== 'All') {
      query.department = params.department;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      CompanyEventModel.find(query).sort({ startDate: 1, createdAt: -1 }).skip(skip).limit(limit),
      CompanyEventModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async findEventById(id: string): Promise<ICompanyEventDocument | null> {
    await this.ensureSeedData();
    return CompanyEventModel.findById(id);
  }

  async createEvent(data: Partial<ICompanyEvent>): Promise<ICompanyEventDocument> {
    const record = new CompanyEventModel(data);
    return record.save();
  }

  async updateEventById(id: string, data: Partial<ICompanyEvent>): Promise<ICompanyEventDocument | null> {
    return CompanyEventModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteEventById(id: string): Promise<boolean> {
    const result = await CompanyEventModel.findByIdAndDelete(id);
    return !!result;
  }

  // Support Events CRUD
  async findAllSupportEvents(): Promise<ISupportEventDocument[]> {
    await this.ensureSeedData();
    return SupportEventModel.find().sort({ createdAt: -1 });
  }

  async createSupportEvent(data: Partial<ISupportEvent>): Promise<ISupportEventDocument> {
    const record = new SupportEventModel(data);
    return record.save();
  }

  async updateSupportEventById(id: string, data: Partial<ISupportEvent>): Promise<ISupportEventDocument | null> {
    return SupportEventModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteSupportEventById(id: string): Promise<boolean> {
    const result = await SupportEventModel.findByIdAndDelete(id);
    return !!result;
  }

  // Newsletters CRUD
  async findAllNewsletters(): Promise<IEventsNewsletterDocument[]> {
    await this.ensureSeedData();
    return EventsNewsletterModel.find().sort({ createdAt: -1 });
  }

  async createNewsletter(data: Partial<IEventsNewsletter>): Promise<IEventsNewsletterDocument> {
    const record = new EventsNewsletterModel(data);
    return record.save();
  }

  async updateNewsletterById(id: string, data: Partial<IEventsNewsletter>): Promise<IEventsNewsletterDocument | null> {
    return EventsNewsletterModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteNewsletterById(id: string): Promise<boolean> {
    const result = await EventsNewsletterModel.findByIdAndDelete(id);
    return !!result;
  }

  // Budgets CRUD
  async findAllBudgets(): Promise<IEventsBudgetItemDocument[]> {
    await this.ensureSeedData();
    return EventsBudgetModel.find().sort({ createdAt: -1 });
  }

  async createBudget(data: Partial<IEventsBudgetItem>): Promise<IEventsBudgetItemDocument> {
    const record = new EventsBudgetModel(data);
    return record.save();
  }

  async updateBudgetById(id: string, data: Partial<IEventsBudgetItem>): Promise<IEventsBudgetItemDocument | null> {
    return EventsBudgetModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteBudgetById(id: string): Promise<boolean> {
    const result = await EventsBudgetModel.findByIdAndDelete(id);
    return !!result;
  }

  // Summary Stats
  async getSummaryStats(): Promise<EventsSummaryStats> {
    await this.ensureSeedData();
    const [events, budgets, newsletters, supportTickets] = await Promise.all([
      CompanyEventModel.find(),
      EventsBudgetModel.find(),
      EventsNewsletterModel.countDocuments(),
      SupportEventModel.countDocuments(),
    ]);

    const totalEvents = events.length;
    const inProgressCount = events.filter((e) => e.status === 'In Progress').length;
    const upcomingCount = events.filter((e) => e.status === 'Up coming').length;
    const completedCount = events.filter((e) => e.status === 'Completed').length;

    const totalBudgetPool = budgets.reduce((acc, b) => acc + (b.allocated || 0), 0);
    const totalBudgetSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
    const budgetVariance = totalBudgetPool - totalBudgetSpent;

    return {
      totalEvents,
      inProgressCount,
      upcomingCount,
      completedCount,
      totalBudgetPool,
      totalBudgetSpent,
      budgetVariance,
      totalNewsletters: newsletters,
      totalSupportTickets: supportTickets,
    };
  }
}

export const eventRepository = new EventRepository();
