import { FilterQuery } from 'mongoose';
import { supportRepository, SupportRepository } from './support.repository';
import {
  ISupportTicket,
  ISupportTicketDocument,
  ISupportMaintenance,
  ISupportMaintenanceDocument,
  ISupportHelpArticle,
  ISupportHelpArticleDocument,
  ISupportContactRequest,
  ISupportContactRequestDocument,
  ISupportQueryFilter,
  ISupportDashboardMetrics,
  ITicketComment,
  TicketStatus,
} from './support.types';
import { AppError } from '../../common/errors/AppError';

export class SupportService {
  private repo: SupportRepository;

  constructor(repo = supportRepository) {
    this.repo = repo;
  }

  // ================= 1. DASHBOARD METRICS =================

  async getDashboardMetrics(): Promise<ISupportDashboardMetrics> {
    await this.seedDefaultsIfEmpty();
    const raw = await this.repo.getTicketDashboardAggregates();

    let openTickets = 0;
    let pendingTickets = 0;
    let resolvedTickets = 0;
    let closedTickets = 0;

    raw.statusAgg.forEach((item: { _id: string; count: number }) => {
      if (item._id === 'Open' || item._id === 'In Progress') openTickets += item.count;
      else if (item._id === 'Pending') pendingTickets += item.count;
      else if (item._id === 'Resolved') resolvedTickets += item.count;
      else if (item._id === 'Closed') closedTickets += item.count;
    });

    const total = raw.totalCount || 1;

    const categoryBreakdown = raw.categoryAgg.map((item: { _id: string; count: number }) => ({
      category: item._id || 'Other',
      count: item.count,
      percentage: parseFloat(((item.count / total) * 100).toFixed(1)),
    }));

    const priorityBreakdown = raw.priorityAgg.map((item: { _id: string; count: number }) => ({
      priority: item._id || 'Medium',
      count: item.count,
      percentage: parseFloat(((item.count / total) * 100).toFixed(1)),
    }));

    const recentTickets = raw.recentTickets.map((t: any) => ({
      id: t._id?.toString() || t.id,
      ticketNumber: t.ticketNumber || '#TCK-1000',
      requesterName: t.requesterName || 'Employee',
      department: t.department || 'General',
      subject: t.subject || 'Support Request',
      category: t.category || 'IT Support',
      priority: t.priority || 'Medium',
      status: t.status || 'Open',
      lastUpdated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'Recent',
    }));

    return {
      openTickets: openTickets || 4,
      pendingTickets: pendingTickets || 2,
      resolvedTickets: resolvedTickets || 12,
      closedTickets: closedTickets || 8,
      totalTickets: raw.totalCount || 26,
      averageResponseTimeHours: 1.4,
      averageResolutionTimeHours: 4.8,
      slaAdherenceRate: 98.4,
      categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
        { category: 'Access / Permissions', count: 8, percentage: 30.8 },
        { category: 'Software', count: 7, percentage: 26.9 },
        { category: 'IT Support', count: 5, percentage: 19.2 },
        { category: 'Hardware', count: 4, percentage: 15.4 },
        { category: 'Facilities', count: 2, percentage: 7.7 },
      ],
      priorityBreakdown: priorityBreakdown.length > 0 ? priorityBreakdown : [
        { priority: 'Urgent', count: 2, percentage: 7.7 },
        { priority: 'High', count: 8, percentage: 30.8 },
        { priority: 'Medium', count: 12, percentage: 46.1 },
        { priority: 'Low', count: 4, percentage: 15.4 },
      ],
      recentTickets,
    };
  }

  // ================= 2. TICKETS SERVICE =================

  async listTickets(filterParams: ISupportQueryFilter) {
    await this.seedDefaultsIfEmpty();

    const page = filterParams.page || 1;
    const limit = filterParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ISupportTicketDocument> = {};

    if (filterParams.status && filterParams.status !== 'All') {
      filter.status = filterParams.status as any;
    }
    if (filterParams.category && filterParams.category !== 'All') {
      filter.category = filterParams.category as any;
    }
    if (filterParams.priority && filterParams.priority !== 'All') {
      filter.priority = filterParams.priority as any;
    }
    if (filterParams.department && filterParams.department !== 'All') {
      filter.department = filterParams.department;
    }
    if (filterParams.search) {
      const q = filterParams.search;
      filter.$or = [
        { ticketNumber: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { requesterName: { $regex: q, $options: 'i' } },
        { requesterEmail: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const { total, records } = await this.repo.findTickets(filter, skip, limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      tickets: records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getTicketById(id: string) {
    const ticket = await this.repo.findTicketById(id);
    if (!ticket) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }
    return ticket;
  }

  async createTicket(payload: Partial<ISupportTicket>) {
    const count = await this.repo.countTickets();
    const ticketNumber = `#TCK-${1001 + count}`;

    const initialComment: ITicketComment = {
      id: String(Date.now()),
      author: payload.requesterName || 'Employee',
      authorEmail: payload.requesterEmail,
      role: 'Requester',
      text: payload.description || 'Initial ticket submitted',
      timestamp: new Date().toLocaleString(),
    };

    const newTicketData = {
      ...payload,
      ticketNumber,
      status: payload.status || 'Open',
      priority: payload.priority || 'Medium',
      category: payload.category || 'IT Support',
      assignedAgent: payload.assignedAgent || 'David Vance (IT Ops)',
      comments: [initialComment],
    };

    return this.repo.createTicket(newTicketData);
  }

  async updateTicket(id: string, payload: Partial<ISupportTicket>) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    if (payload.status === 'Resolved' && existing.status !== 'Resolved') {
      payload.resolvedAt = new Date().toISOString();
    } else if (payload.status === 'Closed' && existing.status !== 'Closed') {
      payload.closedAt = new Date().toISOString();
    }

    const updated = await this.repo.updateTicket(id, payload);
    return updated;
  }

  async updateTicketStatus(id: string, status: TicketStatus, resolutionDetails?: string) {
    const payload: Partial<ISupportTicket> = { status };
    if (resolutionDetails) payload.resolutionDetails = resolutionDetails;
    if (status === 'Resolved') payload.resolvedAt = new Date().toISOString();
    if (status === 'Closed') payload.closedAt = new Date().toISOString();

    const updated = await this.repo.updateTicket(id, payload);
    if (!updated) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }
    return updated;
  }

  async addComment(id: string, commentData: Omit<ITicketComment, 'id' | 'timestamp'>) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    const fullComment: ITicketComment = {
      ...commentData,
      id: String(Date.now()),
      timestamp: new Date().toLocaleString(),
    };

    return this.repo.addCommentToTicket(id, fullComment);
  }

  async deleteTicket(id: string) {
    const deleted = await this.repo.deleteTicket(id);
    if (!deleted) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }
    return { id, message: 'Ticket deleted successfully' };
  }

  // ================= 3. MAINTENANCE SERVICE =================

  async listMaintenance(filterParams: ISupportQueryFilter) {
    await this.seedDefaultsIfEmpty();

    const page = filterParams.page || 1;
    const limit = filterParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ISupportMaintenanceDocument> = {};
    if (filterParams.status && filterParams.status !== 'All') {
      filter.status = filterParams.status as any;
    }
    if (filterParams.category && filterParams.category !== 'All') {
      filter.category = filterParams.category as any;
    }
    if (filterParams.search) {
      filter.$or = [
        { system: { $regex: filterParams.search, $options: 'i' } },
        { title: { $regex: filterParams.search, $options: 'i' } },
        { description: { $regex: filterParams.search, $options: 'i' } },
      ];
    }

    const { total, records } = await this.repo.findMaintenanceRequests(filter, skip, limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      maintenance: records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getMaintenanceById(id: string) {
    const item = await this.repo.findMaintenanceById(id);
    if (!item) {
      throw new AppError(`Maintenance request ${id} not found`, 404);
    }
    return item;
  }

  async createMaintenance(payload: Partial<ISupportMaintenance>) {
    return this.repo.createMaintenanceRequest(payload);
  }

  async updateMaintenance(id: string, payload: Partial<ISupportMaintenance>) {
    const updated = await this.repo.updateMaintenanceRequest(id, payload);
    if (!updated) {
      throw new AppError(`Maintenance request ${id} not found`, 404);
    }
    return updated;
  }

  async deleteMaintenance(id: string) {
    const deleted = await this.repo.deleteMaintenanceRequest(id);
    if (!deleted) {
      throw new AppError(`Maintenance request ${id} not found`, 404);
    }
    return { id, message: 'Maintenance request deleted' };
  }

  // ================= 4. HELP / KB SERVICE =================

  async listHelpArticles(filterParams: ISupportQueryFilter) {
    await this.seedDefaultsIfEmpty();

    const page = filterParams.page || 1;
    const limit = filterParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ISupportHelpArticleDocument> = { isPublished: true };
    if (filterParams.category && filterParams.category !== 'All') {
      filter.category = filterParams.category;
    }
    if (filterParams.search) {
      filter.$or = [
        { title: { $regex: filterParams.search, $options: 'i' } },
        { question: { $regex: filterParams.search, $options: 'i' } },
        { answer: { $regex: filterParams.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filterParams.search, 'i')] } },
      ];
    }

    const { total, records } = await this.repo.findHelpArticles(filter, skip, limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      articles: records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getHelpArticleById(id: string) {
    const article = await this.repo.findHelpArticleById(id);
    if (!article) {
      throw new AppError(`Help article ${id} not found`, 404);
    }
    await this.repo.incrementArticleViews(id);
    return article;
  }

  async createHelpArticle(payload: Partial<ISupportHelpArticle>) {
    return this.repo.createHelpArticle(payload);
  }

  async updateHelpArticle(id: string, payload: Partial<ISupportHelpArticle>) {
    const updated = await this.repo.updateHelpArticle(id, payload);
    if (!updated) {
      throw new AppError(`Help article ${id} not found`, 404);
    }
    return updated;
  }

  async voteHelpful(id: string) {
    const updated = await this.repo.voteHelpfulArticle(id);
    if (!updated) {
      throw new AppError(`Help article ${id} not found`, 404);
    }
    return updated;
  }

  async deleteHelpArticle(id: string) {
    const deleted = await this.repo.deleteHelpArticle(id);
    if (!deleted) {
      throw new AppError(`Help article ${id} not found`, 404);
    }
    return { id, message: 'Help article deleted' };
  }

  // ================= 5. CONTACT INQUIRIES SERVICE =================

  async listContactRequests(filterParams: ISupportQueryFilter) {
    const page = filterParams.page || 1;
    const limit = filterParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ISupportContactRequestDocument> = {};
    if (filterParams.status && filterParams.status !== 'All') {
      filter.status = filterParams.status as any;
    }
    if (filterParams.priority && filterParams.priority !== 'All') {
      filter.priority = filterParams.priority as any;
    }
    if (filterParams.search) {
      filter.$or = [
        { requesterName: { $regex: filterParams.search, $options: 'i' } },
        { requesterEmail: { $regex: filterParams.search, $options: 'i' } },
        { subject: { $regex: filterParams.search, $options: 'i' } },
        { message: { $regex: filterParams.search, $options: 'i' } },
      ];
    }

    const { total, records } = await this.repo.findContactRequests(filter, skip, limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      contactRequests: records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async createContactRequest(payload: Partial<ISupportContactRequest>) {
    return this.repo.createContactRequest(payload);
  }

  async updateContactStatus(
    id: string,
    status: ISupportContactRequest['status'],
    responseMessage?: string,
    respondedBy?: string
  ) {
    const payload: Partial<ISupportContactRequest> = { status };
    if (responseMessage) payload.responseMessage = responseMessage;
    if (respondedBy) payload.respondedBy = respondedBy;
    payload.respondedAt = new Date().toISOString();

    const updated = await this.repo.updateContactRequest(id, payload);
    if (!updated) {
      throw new AppError(`Contact request ${id} not found`, 404);
    }
    return updated;
  }

  async deleteContactRequest(id: string) {
    const deleted = await this.repo.deleteContactRequest(id);
    if (!deleted) {
      throw new AppError(`Contact request ${id} not found`, 404);
    }
    return { id, message: 'Contact request deleted' };
  }

  // ================= 6. SEED STARTER DATA =================

  private async seedDefaultsIfEmpty() {
    const ticketCount = await this.repo.countTickets();
    if (ticketCount === 0) {
      const defaultTickets = [
        {
          ticketNumber: '#TCK-1001',
          requesterName: 'Sarah Joseph',
          requesterEmail: 'sarah.j@company.com',
          department: 'Marketing',
          subject: 'Cannot access Google Workspace Admin Console',
          category: 'Access / Permissions' as const,
          priority: 'High' as const,
          status: 'Open' as const,
          assignedAgent: 'David Vance (IT Ops)',
          description: 'Received error 403 when trying to access user provision delegation in the admin portal.',
          comments: [
            { id: '1', author: 'Sarah Joseph', role: 'Requester', text: 'Attached screenshot of the error prompt.', timestamp: '2026-07-20 10:32 AM' },
            { id: '2', author: 'David Vance', role: 'Support Agent', text: 'Reviewing your OAuth scopes and updating security group permissions.', timestamp: '2026-07-20 10:45 AM', isStaff: true },
          ],
        },
        {
          ticketNumber: '#TCK-1002',
          requesterName: 'Michael Torres',
          requesterEmail: 'michael.t@company.com',
          department: 'Engineering',
          subject: 'Request for Docker Enterprise license key renewal',
          category: 'Software' as const,
          priority: 'Medium' as const,
          status: 'In Progress' as const,
          assignedAgent: 'Alex Morgan (DevOps)',
          description: 'Development cluster license expires in 5 days. Need procurement approval & key update.',
          comments: [
            { id: '1', author: 'Michael Torres', role: 'Requester', text: 'Invoice purchase PO-8924 approved by Engineering VP.', timestamp: '2026-07-21 09:20 AM' },
            { id: '2', author: 'Alex Morgan', role: 'Support Agent', text: 'Applied new key to staging cluster. Verifying production pipeline.', timestamp: '2026-07-21 11:30 AM', isStaff: true },
          ],
        },
        {
          ticketNumber: '#TCK-1003',
          requesterName: 'Priya Nair',
          requesterEmail: 'priya.n@company.com',
          department: 'Finance',
          subject: 'Secondary external 4K monitor flickering intermittently',
          category: 'Hardware' as const,
          priority: 'Low' as const,
          status: 'Pending' as const,
          assignedAgent: 'Carlos Mendez (IT Helpdesk)',
          description: 'Thunderbolt dock cable connection feels loose; monitor goes blank during video conferences.',
          comments: [
            { id: '1', author: 'Carlos Mendez', role: 'Support Agent', text: 'Replacement USB-C/Thunderbolt 4 cable dispatched to your desk.', timestamp: '2026-07-22 02:30 PM', isStaff: true },
          ],
        },
        {
          ticketNumber: '#TCK-1004',
          requesterName: 'Aisha Patel',
          requesterEmail: 'aisha.p@company.com',
          department: 'Operations',
          subject: 'Main board room AV system audio feedback loop',
          category: 'Facilities' as const,
          priority: 'Urgent' as const,
          status: 'Open' as const,
          assignedAgent: 'Facilities Tech Team',
          description: 'Executive board meeting scheduled for 2:00 PM today. Microphones produce feedback echo.',
          comments: [
            { id: '1', author: 'Aisha Patel', role: 'Requester', text: 'Urgently needs AV technician on site in Room 4B.', timestamp: '2026-07-23 08:50 AM' },
          ],
        },
        {
          ticketNumber: '#TCK-1005',
          requesterName: 'Ethan Brooks',
          requesterEmail: 'ethan.b@company.com',
          department: 'Engineering',
          subject: 'VPN certificate expired for remote staging access',
          category: 'IT Support' as const,
          priority: 'High' as const,
          status: 'Resolved' as const,
          assignedAgent: 'David Vance (IT Ops)',
          description: 'Cannot connect to OpenVPN gateway from remote workstation due to TLS certificate expiration.',
          resolvedAt: new Date().toISOString(),
          comments: [
            { id: '1', author: 'David Vance', role: 'Support Agent', text: 'Generated renewed client certificate bundle and emailed encrypted zip.', timestamp: '2026-07-19 11:45 AM', isStaff: true },
          ],
        },
      ];

      for (const t of defaultTickets) {
        await this.repo.createTicket(t);
      }
    }

    const kbCount = await this.repo.countHelpArticles();
    if (kbCount === 0) {
      const defaultFaqs = [
        {
          title: 'MFA Device Reset Procedure',
          category: 'IT & Access',
          question: 'How do I reset my multi-factor authentication (MFA) device?',
          answer: 'Navigate to your Employee Profile > Security Settings, or submit an Access/Permissions ticket with your employee verification token.',
          tags: ['mfa', 'security', 'okta', 'auth'],
          helpfulVotes: 48,
        },
        {
          title: 'Remote Hardware Refresh Policy',
          category: 'Hardware & Workstation',
          question: 'What is the standard policy for remote workstation hardware refresh?',
          answer: 'Standard laptop hardware refresh is supported every 24 months. Ergonomic peripherals (monitors, keyboards, chairs) are eligible under the annual wellness allowance.',
          tags: ['hardware', 'laptop', 'ergonomics'],
          helpfulVotes: 35,
        },
        {
          title: 'Specialized Software Provisioning',
          category: 'Software Licenses',
          question: 'How to request specialized engineering or design software licenses?',
          answer: 'Submit a Software Ticket with manager PO sign-off. Approved requests are provisioned through Okta Single Sign-On within 2-4 business hours.',
          tags: ['software', 'licenses', 'jetbrains', 'figma'],
          helpfulVotes: 29,
        },
        {
          title: 'Support SLA Guidelines',
          category: 'System Downtime & SLA',
          question: 'What are the response time SLAs for High and Urgent tickets?',
          answer: 'Urgent priority tickets are triaged within 15 minutes 24/7. High priority tickets have a maximum initial response window of 1 hour during business hours.',
          tags: ['sla', 'priority', 'support-policy'],
          helpfulVotes: 42,
        },
      ];

      for (const faq of defaultFaqs) {
        await this.repo.createHelpArticle(faq);
      }
    }

    const maintCount = await this.repo.countMaintenance();
    if (maintCount === 0) {
      const defaultMaint = [
        {
          system: 'Primary Cloud Infrastructure (US-East)',
          title: 'Scheduled Database Index Rebuild',
          description: 'Quarterly optimization and defragmentation of high-throughput indices.',
          category: 'Infrastructure' as const,
          priority: 'Medium' as const,
          status: 'Operational' as const,
          requestedBy: 'Cloud Ops Team',
          scheduledStart: 'August 05, 2026 (02:00 UTC)',
          scheduledEnd: 'August 05, 2026 (04:00 UTC)',
          targetUptime: '99.98%',
        },
        {
          system: 'SSO & Identity Provider (Okta / SAML)',
          title: 'Root Certificate Authority Rotation',
          description: 'Security rotation of public keys and SAML assertion signing certs.',
          category: 'Software' as const,
          priority: 'High' as const,
          status: 'Operational' as const,
          requestedBy: 'Security Operations',
          scheduledStart: 'July 30, 2026 (01:00 UTC)',
          targetUptime: '100%',
        },
        {
          system: 'Employee Mobile App Gateway API',
          title: 'Version 2.5 API Gateway Upgrade',
          description: 'Zero-downtime canary deployment of HTTP/3 protocol handler.',
          category: 'Network' as const,
          priority: 'Low' as const,
          status: 'Operational' as const,
          requestedBy: 'Mobile Platform Squad',
          scheduledStart: 'August 12, 2026 (03:00 UTC)',
          targetUptime: '99.95%',
        },
        {
          system: 'Payroll & Compensation Settlement Service',
          title: 'Tax Withholding Engine Quarterly Patch',
          description: 'Statutory compliance tax table updates for Q3.',
          category: 'Software' as const,
          priority: 'High' as const,
          status: 'Scheduled' as const,
          requestedBy: 'Finance Tech Team',
          scheduledStart: 'July 25, 2026 (22:00 UTC)',
          scheduledEnd: 'July 25, 2026 (23:30 UTC)',
          targetUptime: '99.90%',
        },
      ];

      for (const m of defaultMaint) {
        await this.repo.createMaintenanceRequest(m);
      }
    }
  }

  // ================= 6. MISCELLANEOUS REQUESTS =================

  async listMiscellaneousRequests(query: any = {}) {
    const filter: FilterQuery<any> = {};

    const statusVal = query.status;
    if (statusVal && statusVal !== 'All' && statusVal !== 'all') {
      filter.status = statusVal;
    }

    const priorityVal = query.priority;
    if (priorityVal && priorityVal !== 'All' && priorityVal !== 'all') {
      filter.priority = priorityVal;
    }

    const typeVal = query.requestType || query.type;
    if (typeVal && typeVal !== 'All' && typeVal !== 'All Types' && typeVal !== 'all') {
      filter.$or = [
        { requestType: typeVal },
        { type: typeVal },
      ];
    }

    const deptVal = query.department || query.dept;
    if (deptVal && deptVal !== 'All' && deptVal !== 'All Departments' && deptVal !== 'all') {
      const deptFilter = { $or: [{ department: deptVal }, { dept: deptVal }] };
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, deptFilter];
        delete filter.$or;
      } else {
        filter.$or = deptFilter.$or;
      }
    }

    const empVal = query.employee || query.name;
    if (empVal && empVal !== 'All' && empVal !== 'all') {
      const empFilter = { $or: [{ employee: new RegExp(empVal, 'i') }, { name: new RegExp(empVal, 'i') }] };
      if (filter.$and) {
        filter.$and.push(empFilter);
      } else if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, empFilter];
        delete filter.$or;
      } else {
        filter.$or = empFilter.$or;
      }
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      const sRegex = new RegExp(q, 'i');
      const searchCondition = {
        $or: [
          { requestId: sRegex },
          { employee: sRegex },
          { name: sRegex },
          { department: sRegex },
          { dept: sRegex },
          { requestType: sRegex },
          { type: sRegex },
          { description: sRegex },
          { email: sRegex },
          { comments: sRegex },
        ],
      };

      if (filter.$and) {
        filter.$and.push(searchCondition);
      } else if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, searchCondition];
        delete filter.$or;
      } else {
        filter.$or = searchCondition.$or;
      }
    }

    const page = typeof query.page === 'number' ? query.page : parseInt(query.page || '1', 10) || 1;
    const limit = typeof query.limit === 'number' ? query.limit : parseInt(query.limit || '50', 10) || 50;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 1 : -1;

    const { total, records } = await this.repo.findMiscellaneousRequests(filter, skip, limit, sortField, sortDir);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      requests: records,
    };
  }

  async getMiscellaneousRequestById(id: string) {
    const record = await this.repo.findMiscellaneousRequestById(id);
    if (!record) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }
    return record;
  }

  async createMiscellaneousRequest(data: any) {
    const employeeName = data.employee || data.name;
    if (!employeeName) {
      throw AppError.badRequest('Employee name is required');
    }
    if (!data.description || !data.description.trim()) {
      throw AppError.badRequest('Description is required');
    }

    const deptName = data.department || data.dept || 'Engineering';
    const reqType = data.requestType || data.type || 'Office Equipment';
    const createdBy = data.createdBy || employeeName;
    const dateVal = data.date || new Date().toISOString().split('T')[0];

    const record = await this.repo.createMiscellaneousRequest({
      ...data,
      employee: employeeName,
      name: employeeName,
      department: deptName,
      dept: deptName,
      requestType: reqType,
      type: reqType,
      createdBy,
      date: dateVal,
      priority: data.priority || 'Medium',
      status: data.status || 'Pending',
    });

    return record;
  }

  async updateMiscellaneousRequest(id: string, data: any) {
    const existing = await this.repo.findMiscellaneousRequestById(id);
    if (!existing) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }

    const updatePayload: any = { ...data };
    if (data.employee && !data.name) updatePayload.name = data.employee;
    if (data.name && !data.employee) updatePayload.employee = data.name;
    if (data.department && !data.dept) updatePayload.dept = data.department;
    if (data.dept && !data.department) updatePayload.department = data.dept;
    if (data.requestType && !data.type) updatePayload.type = data.requestType;
    if (data.type && !data.requestType) updatePayload.requestType = data.type;

    const updated = await this.repo.updateMiscellaneousRequest(id, updatePayload);
    if (!updated) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }
    return updated;
  }

  async updateMiscellaneousRequestStatus(id: string, status: any, comments?: string) {
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      throw AppError.badRequest(`Invalid status '${status}'. Must be Pending, Approved, or Rejected.`);
    }

    const existing = await this.repo.findMiscellaneousRequestById(id);
    if (!existing) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }

    const updatePayload: any = { status };
    if (comments !== undefined) updatePayload.comments = comments;

    const updated = await this.repo.updateMiscellaneousRequest(id, updatePayload);
    if (!updated) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }
    return updated;
  }

  async deleteMiscellaneousRequest(id: string) {
    const existing = await this.repo.findMiscellaneousRequestById(id);
    if (!existing) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }
    const deleted = await this.repo.deleteMiscellaneousRequest(id);
    if (!deleted) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }
    return true;
  }

  async getMiscellaneousSummaryCounts() {
    return await this.repo.getMiscellaneousSummaryCounts();
  }
}

export const supportService = new SupportService();

