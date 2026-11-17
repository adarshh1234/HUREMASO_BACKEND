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
  ISupportAgent,
  ITicketComment,
  ITicketInternalNote,
  ITicketHistoryEntry,
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
    const raw = await this.repo.getTicketDashboardAggregates();

    let openTickets = 0;
    let pendingTickets = 0;
    let resolvedTickets = 0;
    let closedTickets = 0;
    let reopenedTickets = 0;

    raw.statusAgg.forEach((item: { _id: string; count: number }) => {
      if (item._id === 'Open' || item._id === 'In Progress') openTickets += item.count;
      else if (item._id === 'Pending') pendingTickets += item.count;
      else if (item._id === 'Resolved') resolvedTickets += item.count;
      else if (item._id === 'Closed') closedTickets += item.count;
      else if (item._id === 'Reopened') reopenedTickets += item.count;
    });

    const total = raw.totalCount || 0;

    // SLA Calculation & Average Response/Resolution Times from real records
    let totalResponseHours = 0;
    let respondedTicketsCount = 0;
    let totalResolutionHours = 0;
    let resolvedTicketsCount = 0;
    let slaCompliantCount = 0;

    const now = Date.now();
    (raw.allTickets || []).forEach((t: any) => {
      const createdTime = t.createdAt ? new Date(t.createdAt).getTime() : now;

      // Response Time
      if (t.firstResponseAt) {
        const responseTime = (new Date(t.firstResponseAt).getTime() - createdTime) / (1000 * 3600);
        if (responseTime >= 0) {
          totalResponseHours += responseTime;
          respondedTicketsCount++;
        }
      }

      // Resolution Time
      if (t.resolvedAt) {
        const resolutionTime = (new Date(t.resolvedAt).getTime() - createdTime) / (1000 * 3600);
        if (resolutionTime >= 0) {
          totalResolutionHours += resolutionTime;
          resolvedTicketsCount++;
        }
      }

      // SLA Compliance
      if (t.slaDueAt) {
        const dueTime = new Date(t.slaDueAt).getTime();
        if (t.resolvedAt) {
          if (new Date(t.resolvedAt).getTime() <= dueTime) {
            slaCompliantCount++;
          }
        } else if (['Open', 'In Progress', 'Pending', 'Reopened'].includes(t.status)) {
          if (now <= dueTime) {
            slaCompliantCount++;
          }
        } else {
          slaCompliantCount++;
        }
      } else {
        slaCompliantCount++;
      }
    });

    const averageResponseTimeHours = respondedTicketsCount > 0
      ? parseFloat((totalResponseHours / respondedTicketsCount).toFixed(1))
      : 0;

    const averageResolutionTimeHours = resolvedTicketsCount > 0
      ? parseFloat((totalResolutionHours / resolvedTicketsCount).toFixed(1))
      : 0;

    const slaAdherenceRate = total > 0
      ? parseFloat(((slaCompliantCount / total) * 100).toFixed(1))
      : 100;

    const categoryBreakdown = total > 0
      ? raw.categoryAgg.map((item: { _id: string; count: number }) => ({
          category: item._id || 'Other',
          count: item.count,
          percentage: parseFloat(((item.count / total) * 100).toFixed(1)),
        }))
      : [];

    const priorityBreakdown = total > 0
      ? raw.priorityAgg.map((item: { _id: string; count: number }) => ({
          priority: item._id || 'Medium',
          count: item.count,
          percentage: parseFloat(((item.count / total) * 100).toFixed(1)),
        }))
      : [];

    const recentTickets = (raw.recentTickets || []).map((t: any) => ({
      id: t._id?.toString() || t.id,
      ticketNumber: t.ticketNumber || `#TCK-${t.id || '1000'}`,
      requesterName: t.requesterName || 'Employee',
      department: t.department || 'General',
      subject: t.subject || 'Support Request',
      category: t.category || 'IT Support',
      priority: t.priority || 'Medium',
      status: t.status || 'Open',
      assignedAgent: t.assignedAgent || 'Unassigned',
      lastUpdated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'Recent',
    }));

    return {
      openTickets,
      pendingTickets,
      resolvedTickets,
      closedTickets,
      reopenedTickets,
      unassignedTickets: raw.unassignedCount || 0,
      totalTickets: total,
      averageResponseTimeHours,
      averageResolutionTimeHours,
      slaAdherenceRate,
      categoryBreakdown,
      priorityBreakdown,
      recentTickets,
    };
  }

  // ================= 2. TICKETS SERVICE =================

  async listTickets(filterParams: ISupportQueryFilter & { assignedAgent?: string; requesterEmail?: string }) {
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
    if (filterParams.assignedAgent && filterParams.assignedAgent !== 'All') {
      filter.assignedAgent = filterParams.assignedAgent;
    }
    if (filterParams.requesterEmail) {
      filter.requesterEmail = filterParams.requesterEmail.toLowerCase().trim();
    }
    if (filterParams.search) {
      const q = filterParams.search.trim();
      filter.$or = [
        { ticketNumber: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { requesterName: { $regex: q, $options: 'i' } },
        { requesterEmail: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { assignedAgent: { $regex: q, $options: 'i' } },
      ];
    }
    if (filterParams.fromDate || filterParams.toDate) {
      filter.createdAt = {};
      if (filterParams.fromDate) filter.createdAt.$gte = new Date(filterParams.fromDate);
      if (filterParams.toDate) filter.createdAt.$lte = new Date(filterParams.toDate);
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
    if (!payload.subject || !payload.subject.trim()) {
      throw new AppError('Ticket subject is required', 400);
    }
    if (!payload.description || payload.description.trim().length < 5) {
      throw new AppError('Ticket description is required with at least 5 characters', 400);
    }
    if (!payload.requesterEmail || !payload.requesterEmail.trim()) {
      throw new AppError('Requester email is required', 400);
    }

    // Duplicate Check: Same requester and subject in active status
    const existingDuplicate = await this.repo.findOpenTicketByRequesterAndSubject(
      payload.requesterEmail,
      payload.subject
    );
    if (existingDuplicate) {
      throw new AppError(
        `A support ticket with this subject is already active for ${payload.requesterEmail} (${existingDuplicate.ticketNumber}). Please update the existing ticket.`,
        409
      );
    }

    const count = await this.repo.countTickets();
    let ticketNumCandidate = `#TCK-${1001 + count}`;
    // Verify uniqueness of ticketNumber
    let existingTicketWithNum = await this.repo.findTicketByNumber(ticketNumCandidate);
    let offset = 1;
    while (existingTicketWithNum) {
      ticketNumCandidate = `#TCK-${1001 + count + offset}`;
      existingTicketWithNum = await this.repo.findTicketByNumber(ticketNumCandidate);
      offset++;
    }

    const nowIso = new Date().toISOString();

    // SLA Calculation based on priority
    const priority = payload.priority || 'Medium';
    const slaHours = priority === 'Urgent' ? 4 : priority === 'High' ? 8 : priority === 'Low' ? 48 : 24;
    const slaDueAt = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const requesterName = payload.requesterName || 'Employee';

    const initialComment: ITicketComment = {
      id: String(Date.now()),
      author: requesterName,
      authorEmail: payload.requesterEmail,
      role: 'Requester',
      text: payload.description || 'Initial ticket submitted',
      timestamp: new Date().toLocaleString(),
    };

    const initialHistory: ITicketHistoryEntry = {
      id: String(Date.now()),
      action: 'CREATED',
      performedBy: requesterName,
      timestamp: nowIso,
      details: `Ticket created with priority '${priority}' in category '${payload.category || 'IT Support'}'`,
    };

    const newTicketData: Partial<ISupportTicket> = {
      ...payload,
      ticketNumber: ticketNumCandidate,
      status: payload.status || 'Open',
      priority,
      category: payload.category || 'IT Support',
      assignedAgent: payload.assignedAgent || 'Unassigned',
      slaDueAt,
      comments: [initialComment],
      history: [initialHistory],
      internalNotes: [],
      tags: payload.tags || [],
    };

    return this.repo.createTicket(newTicketData);
  }

  async updateTicket(id: string, payload: Partial<ISupportTicket>, updatedBy: string = 'User') {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    const nowIso = new Date().toISOString();

    if (payload.status && payload.status !== existing.status) {
      if (payload.status === 'Resolved') {
        payload.resolvedAt = nowIso;
      } else if (payload.status === 'Closed') {
        payload.closedAt = nowIso;
      } else if (payload.status === 'Reopened') {
        payload.reopenedAt = nowIso;
        payload.resolvedAt = undefined;
        payload.closedAt = undefined;
      }

      await this.repo.addHistoryToTicket(id, {
        id: String(Date.now()),
        action: 'STATUS_CHANGED',
        performedBy: updatedBy,
        timestamp: nowIso,
        details: `Status updated from '${existing.status}' to '${payload.status}'`,
      });
    }

    const updated = await this.repo.updateTicket(id, payload);
    return updated;
  }

  async updateTicketStatus(
    id: string,
    status: TicketStatus,
    resolutionDetails?: string,
    notes?: string,
    changedBy: string = 'Support Staff'
  ) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    const nowIso = new Date().toISOString();
    const payload: Partial<ISupportTicket> = { status };

    if (status === 'Resolved') {
      payload.resolvedAt = nowIso;
      payload.resolutionDetails = resolutionDetails || notes || existing.resolutionDetails || 'Issue successfully resolved';
    } else if (status === 'Closed') {
      payload.closedAt = nowIso;
    } else if (status === 'Reopened') {
      payload.reopenedAt = nowIso;
      payload.resolvedAt = undefined;
      payload.closedAt = undefined;
    }

    await this.repo.addHistoryToTicket(id, {
      id: String(Date.now()),
      action: status === 'Reopened' ? 'REOPENED' : status === 'Resolved' ? 'RESOLVED' : 'STATUS_CHANGED',
      performedBy: changedBy,
      timestamp: nowIso,
      details: notes || resolutionDetails || `Status updated to ${status}`,
    });

    const updated = await this.repo.updateTicket(id, payload);
    return updated;
  }

  async assignAgent(
    id: string,
    agentName: string,
    agentEmail?: string,
    assignedBy: string = 'Admin'
  ) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    const nowIso = new Date().toISOString();
    const payload: Partial<ISupportTicket> = {
      assignedAgent: agentName,
      assignedAgentEmail: agentEmail || '',
    };

    if (existing.status === 'Open') {
      payload.status = 'In Progress';
    }

    await this.repo.addHistoryToTicket(id, {
      id: String(Date.now()),
      action: 'ASSIGNED',
      performedBy: assignedBy,
      timestamp: nowIso,
      details: `Assigned ticket to agent '${agentName}'`,
    });

    return this.repo.updateTicket(id, payload);
  }

  async addComment(id: string, commentData: Omit<ITicketComment, 'id' | 'timestamp'>) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    const nowIso = new Date().toISOString();
    const fullComment: ITicketComment = {
      ...commentData,
      id: String(Date.now()),
      timestamp: new Date().toLocaleString(),
    };

    // If first response from staff, record firstResponseAt
    if (commentData.isStaff && !existing.firstResponseAt) {
      await this.repo.updateTicket(id, { firstResponseAt: nowIso });
    }

    await this.repo.addHistoryToTicket(id, {
      id: String(Date.now() + 1),
      action: 'COMMENT_ADDED',
      performedBy: commentData.author,
      timestamp: nowIso,
      details: `Comment added by ${commentData.role || 'User'}`,
    });

    return this.repo.addCommentToTicket(id, fullComment);
  }

  async addInternalNote(id: string, noteData: { author: string; authorEmail?: string; text: string }) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }

    const nowIso = new Date().toISOString();
    const fullNote: ITicketInternalNote = {
      id: String(Date.now()),
      author: noteData.author,
      authorEmail: noteData.authorEmail,
      text: noteData.text,
      timestamp: nowIso,
    };

    await this.repo.addHistoryToTicket(id, {
      id: String(Date.now() + 1),
      action: 'INTERNAL_NOTE_ADDED',
      performedBy: noteData.author,
      timestamp: nowIso,
      details: 'Internal staff note added',
    });

    return this.repo.addInternalNoteToTicket(id, fullNote);
  }

  async getTicketHistory(id: string) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Ticket with ID ${id} not found`, 404);
    }
    return existing.history || [];
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
    const maintenance = await this.repo.createMaintenanceRequest(payload);

    // Auto-create linked Support Ticket for the maintenance issue
    try {
      const ticketCategory = payload.category === 'Facilities' ? 'Facilities' : 'Hardware';
      await this.createTicket({
        subject: `[Maintenance] ${payload.title} (${payload.system})`,
        description: `Maintenance Request for ${payload.system}: ${payload.description}`,
        requesterName: payload.requestedBy || 'System Administrator',
        requesterEmail: payload.requestedByEmail || 'maintenance@company.com',
        department: payload.department || 'IT Operations',
        category: ticketCategory as any,
        priority: payload.priority || 'Medium',
        linkedMaintenanceId: (maintenance as any)._id?.toString() || (maintenance as any).id,
      });
    } catch (_err) {
      // If linked ticket creation encounters duplicate or validation, proceed with maintenance creation
    }

    return maintenance;
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

  async listHelpArticles(filterParams: ISupportQueryFilter & { category?: string }) {
    const page = filterParams.page || 1;
    const limit = filterParams.limit || 20;
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
    const updated = await this.repo.incrementArticleViews(id);
    if (!updated) {
      throw new AppError(`Help article ${id} not found`, 404);
    }
    return updated;
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

  async voteHelpArticle(id: string, isHelpful: boolean = true) {
    const updated = isHelpful
      ? await this.repo.voteHelpfulArticle(id)
      : await this.repo.voteUnhelpfulArticle(id);

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

  // ================= 4b. SUPPORT AGENTS SERVICE =================

  async listSupportAgents(): Promise<ISupportAgent[]> {
    const agentCount = await this.repo.countAgents();
    if (agentCount === 0) {
      const defaultAgents = [
        {
          name: 'David Vance',
          role: 'Lead IT Operations & Cloud Security',
          email: 'david.v@company.com',
          phone: '+1 (555) 019-4421',
          department: 'IT Operations',
          status: 'Online' as const,
          specialties: 'Access Control, VPN, Okta SSO, Cloud IAM',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        },
        {
          name: 'Alex Morgan',
          role: 'DevOps & Software Licensing Specialist',
          email: 'alex.m@company.com',
          phone: '+1 (555) 019-4422',
          department: 'Engineering DevOps',
          status: 'Online' as const,
          specialties: 'Docker, JetBrains, Figma, GitHub Enterprise',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        },
        {
          name: 'Carlos Mendez',
          role: 'Workstation Hardware & Desktop Support',
          email: 'carlos.m@company.com',
          phone: '+1 (555) 019-4423',
          department: 'IT Helpdesk',
          status: 'Busy' as const,
          specialties: 'Monitors, Laptops, Peripherals, AV Conference',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        },
        {
          name: 'Emma Watson',
          role: 'HR Support & Benefits Operations',
          email: 'emma.w@company.com',
          phone: '+1 (555) 019-4424',
          department: 'HR Operations',
          status: 'Online' as const,
          specialties: 'Leave Requests, Letter Requests, Policy Guidance',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        },
      ];

      for (const a of defaultAgents) {
        await this.repo.createAgent(a);
      }
    }

    const agents = await this.repo.findAgents();

    // Dynamically calculate assigned and resolved ticket counts for each agent from MongoDB
    const agentsWithWorkload: ISupportAgent[] = await Promise.all(
      agents.map(async (agent: any) => {
        const [assignedTicketCount, resolvedTicketCount] = await Promise.all([
          this.repo.countTickets({
            assignedAgent: { $regex: agent.name, $options: 'i' },
            status: { $in: ['Open', 'In Progress', 'Pending', 'Reopened'] },
          }),
          this.repo.countTickets({
            assignedAgent: { $regex: agent.name, $options: 'i' },
            status: { $in: ['Resolved', 'Closed'] },
          }),
        ]);

        return {
          id: agent._id?.toString() || agent.id,
          name: agent.name,
          role: agent.role,
          department: agent.department,
          email: agent.email,
          phone: agent.phone || '',
          status: agent.status,
          specialties: agent.specialties || '',
          avatar: agent.avatar || '',
          assignedTicketCount,
          resolvedTicketCount,
        };
      })
    );

    return agentsWithWorkload;
  }

  async createSupportAgent(payload: Partial<ISupportAgent>) {
    if (!payload.name || !payload.email) {
      throw new AppError('Agent name and email are required', 400);
    }
    const existing = await this.repo.findAgentByEmail(payload.email);
    if (existing) {
      throw new AppError(`Support agent with email ${payload.email} already exists`, 409);
    }
    return this.repo.createAgent(payload);
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

  // ================= 6. EXPLICIT SEED HELPER =================

  async seedInitialData() {
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
          assignedAgent: 'David Vance',
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
          assignedAgent: 'Alex Morgan',
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
          assignedAgent: 'Carlos Mendez',
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
          assignedAgent: 'Carlos Mendez',
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
          assignedAgent: 'David Vance',
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
          unhelpfulVotes: 2,
        },
        {
          title: 'Remote Hardware Refresh Policy',
          category: 'Hardware & Workstation',
          question: 'What is the standard policy for remote workstation hardware refresh?',
          answer: 'Standard laptop hardware refresh is supported every 24 months. Ergonomic peripherals (monitors, keyboards, chairs) are eligible under the annual wellness allowance.',
          tags: ['hardware', 'laptop', 'ergonomics'],
          helpfulVotes: 35,
          unhelpfulVotes: 1,
        },
        {
          title: 'Specialized Software Provisioning',
          category: 'Software',
          question: 'How to request specialized engineering or design software licenses?',
          answer: 'Submit a Software Ticket with manager PO sign-off. Approved requests are provisioned through Okta Single Sign-On within 2-4 business hours.',
          tags: ['software', 'licenses', 'jetbrains', 'figma'],
          helpfulVotes: 29,
          unhelpfulVotes: 0,
        },
        {
          title: 'Support SLA Guidelines',
          category: 'General Support',
          question: 'What are the response time SLAs for High and Urgent tickets?',
          answer: 'Urgent priority tickets are triaged within 15 minutes 24/7. High priority tickets have a maximum initial response window of 1 hour during business hours.',
          tags: ['sla', 'priority', 'support-policy'],
          helpfulVotes: 42,
          unhelpfulVotes: 3,
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

    await this.listSupportAgents();

    return { message: 'Support default data seeded successfully' };
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

  async updateMiscellaneousRequestStatus(
    id: string,
    status: any,
    options?: {
      comments?: string;
      remarks?: string;
      rejectionReason?: string;
      approvalRemarks?: string;
      reviewerName?: string;
      reviewerId?: string;
      processedBy?: string;
    } | string
  ) {
    const validStatuses = ['Pending', 'In Review', 'Approved', 'Rejected', 'Processed'];
    if (!validStatuses.includes(status)) {
      throw AppError.badRequest(
        `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}.`
      );
    }

    const existing = await this.repo.findMiscellaneousRequestById(id);
    if (!existing) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }

    const opts = typeof options === 'string' ? { comments: options } : options || {};
    const comments = opts.comments || opts.remarks;

    if (status === 'Rejected' && !opts.rejectionReason && !comments) {
      throw AppError.badRequest('Rejection reason is required when rejecting a request');
    }

    const updatePayload: any = { status };
    if (comments !== undefined) updatePayload.comments = comments;
    if (opts.reviewerName) updatePayload.reviewerName = opts.reviewerName;
    if (opts.reviewerId) updatePayload.reviewerId = opts.reviewerId;

    if (status === 'Approved') {
      updatePayload.approvalRemarks = opts.approvalRemarks || comments || 'Request approved.';
    } else if (status === 'Rejected') {
      updatePayload.rejectionReason = opts.rejectionReason || comments || 'Request rejected.';
    } else if (status === 'Processed') {
      updatePayload.processedAt = new Date().toISOString();
      updatePayload.processedBy = opts.processedBy || opts.reviewerName || 'Administrator';
    }

    const actionMap: Record<string, 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'UPDATED'> = {
      Pending: 'SUBMITTED',
      'In Review': 'IN_REVIEW',
      Approved: 'APPROVED',
      Rejected: 'REJECTED',
      Processed: 'PROCESSED',
    };

    const auditEntry = {
      action: actionMap[status] || 'UPDATED',
      previousStatus: existing.status,
      newStatus: status,
      changedBy: opts.reviewerName || opts.processedBy || 'Administrator',
      changedByRole: status === 'Processed' ? 'Processor' : 'Reviewer',
      timestamp: new Date().toISOString(),
      remarks:
        opts.rejectionReason ||
        opts.approvalRemarks ||
        comments ||
        `Status transitioned to ${status}`,
    };

    updatePayload.$push = { auditHistory: auditEntry };

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { requestId: id };
    const updated = await (this.repo as any).updateMiscellaneousRequest(id, updatePayload);
    await this.repo.appendMiscellaneousAuditHistory(id, auditEntry);

    const refreshed = await this.repo.findMiscellaneousRequestById(id);
    return refreshed || updated;
  }

  async startReview(id: string, reviewerName: string = 'HR Admin', reviewerId?: string, remarks?: string) {
    return this.updateMiscellaneousRequestStatus(id, 'In Review', {
      reviewerName,
      reviewerId,
      remarks: remarks || `Review initiated by ${reviewerName}`,
    });
  }

  async approveMiscellaneousRequest(
    id: string,
    reviewerName: string = 'HR Admin',
    reviewerId?: string,
    approvalRemarks?: string
  ) {
    return this.updateMiscellaneousRequestStatus(id, 'Approved', {
      reviewerName,
      reviewerId,
      approvalRemarks: approvalRemarks || 'Approved after review.',
    });
  }

  async rejectMiscellaneousRequest(
    id: string,
    rejectionReason: string,
    reviewerName: string = 'HR Admin',
    reviewerId?: string
  ) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw AppError.badRequest('Rejection reason is required when rejecting a request');
    }
    return this.updateMiscellaneousRequestStatus(id, 'Rejected', {
      reviewerName,
      reviewerId,
      rejectionReason: rejectionReason.trim(),
    });
  }

  async processMiscellaneousRequest(id: string, processedBy: string = 'Operations Team', remarks?: string) {
    return this.updateMiscellaneousRequestStatus(id, 'Processed', {
      processedBy,
      remarks: remarks || `Request processed and fulfilled by ${processedBy}`,
    });
  }

  async getMiscellaneousAuditHistory(id: string) {
    const existing = await this.repo.findMiscellaneousRequestById(id);
    if (!existing) {
      throw AppError.notFound(`Miscellaneous request '${id}' not found`);
    }
    return existing.auditHistory || [];
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

