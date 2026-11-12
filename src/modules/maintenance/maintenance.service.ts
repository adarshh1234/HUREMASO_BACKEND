import { FilterQuery } from 'mongoose';
import { maintenanceRepository, MaintenanceRepository } from './maintenance.repository';
import {
  IMaintenanceTicket,
  IMaintenanceTicketDocument,
  IHuremasoMaintenanceLog,
  IHuremasoMaintenanceLogDocument,
  IMaintenanceFilterParams,
  ITicketComment,
  ITicketHistoryEntry,
  MaintenanceTicketStatus,
} from './maintenance.types';
import { AppError } from '../../common/errors/AppError';

export class MaintenanceService {
  private repo: MaintenanceRepository;

  constructor(repo = maintenanceRepository) {
    this.repo = repo;
  }

  // ================= 1. ACTIVE SUPPORT TICKETS =================

  async listTickets(filterParams: IMaintenanceFilterParams) {
    await this.seedDefaultsIfEmpty();

    const page = filterParams.page || 1;
    const limit = filterParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IMaintenanceTicketDocument> = {};

    if (filterParams.status && filterParams.status !== 'All') {
      filter.status = filterParams.status as any;
    }
    if (filterParams.priority && filterParams.priority !== 'All') {
      filter.priority = filterParams.priority as any;
    }
    if (filterParams.category && filterParams.category !== 'All') {
      filter.category = filterParams.category as any;
    }
    if (filterParams.department && filterParams.department !== 'All') {
      filter.department = filterParams.department;
    }
    if (filterParams.assignedAgent && filterParams.assignedAgent !== 'All') {
      filter.assignedAgent = filterParams.assignedAgent;
    }
    if (filterParams.search) {
      const q = filterParams.search;
      filter.$or = [
        { ticketNumber: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { requesterName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const sortField = filterParams.sortBy || 'createdAt';
    const sortOrder: 1 | -1 = filterParams.sortOrder === 'asc' ? 1 : -1;

    const { total, records } = await this.repo.findTickets(filter, skip, limit, sortField, sortOrder);
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
      throw new AppError(`Maintenance ticket with ID ${id} not found`, 404);
    }
    return ticket;
  }

  async createTicket(payload: Partial<IMaintenanceTicket>, createdBy = 'Employee') {
    const count = await this.repo.countTickets();
    const ticketNumber = `#MTK-${1001 + count}`;
    const now = new Date();
    const createdDate =
      now.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' - 6.30 Pm';

    const initialComment: ITicketComment = {
      id: String(Date.now()),
      author: payload.requesterName || createdBy,
      authorEmail: payload.requesterEmail,
      role: 'Requester',
      text: payload.description || 'Support ticket logged into maintenance queue.',
      timestamp: createdDate,
      isStaff: false,
    };

    const initialHistory: ITicketHistoryEntry = {
      id: String(Date.now()),
      action: 'Ticket Created',
      performedBy: payload.requesterName || createdBy,
      timestamp: now.toISOString(),
      details: `Created maintenance ticket with ${payload.priority || 'High'} priority in category ${
        payload.category || 'System Error'
      }.`,
    };

    const newTicketData: Partial<IMaintenanceTicket> = {
      ...payload,
      ticketNumber,
      status: payload.status || 'Open',
      priority: payload.priority || 'High',
      category: payload.category || 'System Error',
      requesterName: payload.requesterName || createdBy,
      createdDate,
      comments: [initialComment],
      history: [initialHistory],
    };

    return this.repo.createTicket(newTicketData);
  }

  async updateTicket(id: string, payload: Partial<IMaintenanceTicket>, updatedBy = 'Support Agent') {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Maintenance ticket ${id} not found`, 404);
    }

    const historyEntry: ITicketHistoryEntry = {
      id: String(Date.now()),
      action: 'Ticket Updated',
      performedBy: updatedBy,
      timestamp: new Date().toISOString(),
      details: `Updated fields: ${Object.keys(payload).join(', ')}`,
    };

    const updated = await this.repo.updateTicket(id, payload);
    if (updated) {
      await this.repo.addHistoryEntryToTicket(id, historyEntry);
    }
    return updated;
  }

  async assignTicket(id: string, agentName: string, agentId?: string, performedBy = 'Administrator') {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Maintenance ticket ${id} not found`, 404);
    }

    const historyEntry: ITicketHistoryEntry = {
      id: String(Date.now()),
      action: 'Ticket Assigned',
      performedBy,
      timestamp: new Date().toISOString(),
      details: `Assigned ticket to agent ${agentName}`,
    };

    const updated = await this.repo.updateTicket(id, {
      assignedAgent: agentName,
      assignedAgentId: agentId,
      status: existing.status === 'Open' ? 'In Progress' : existing.status,
    });

    if (updated) {
      await this.repo.addHistoryEntryToTicket(id, historyEntry);
    }
    return updated;
  }

  async updateTicketStatus(
    id: string,
    status: MaintenanceTicketStatus,
    resolutionNotes?: string,
    performedBy = 'Support Agent'
  ) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Maintenance ticket ${id} not found`, 404);
    }

    const now = new Date();
    const formattedDate =
      now.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' - 6.30 Pm';

    const payload: Partial<IMaintenanceTicket> = { status };
    if (status === 'Resolved') {
      payload.resolvedDate = formattedDate;
    } else if (status === 'Closed') {
      payload.closedDate = formattedDate;
    } else if (status === 'Open' && (existing.status === 'Resolved' || existing.status === 'Closed')) {
      payload.resolvedDate = undefined;
      payload.closedDate = undefined;
    }

    const historyEntry: ITicketHistoryEntry = {
      id: String(Date.now()),
      action: `Status Changed to ${status}`,
      performedBy,
      timestamp: now.toISOString(),
      details: resolutionNotes ? `Resolution Notes: ${resolutionNotes}` : `Status transitioned from ${existing.status} to ${status}.`,
    };

    const updated = await this.repo.updateTicket(id, payload);
    if (updated) {
      await this.repo.addHistoryEntryToTicket(id, historyEntry);
    }
    return updated;
  }

  async addComment(id: string, commentData: Omit<ITicketComment, 'id' | 'timestamp'>) {
    const existing = await this.repo.findTicketById(id);
    if (!existing) {
      throw new AppError(`Maintenance ticket ${id} not found`, 404);
    }

    const fullComment: ITicketComment = {
      ...commentData,
      id: String(Date.now()),
      timestamp: new Date().toLocaleString(),
    };

    const historyEntry: ITicketHistoryEntry = {
      id: String(Date.now()),
      action: 'Comment Added',
      performedBy: commentData.author,
      timestamp: new Date().toISOString(),
      details: `Comment: "${commentData.text.substring(0, 60)}${commentData.text.length > 60 ? '...' : ''}"`,
    };

    const updated = await this.repo.addCommentToTicket(id, fullComment);
    if (updated) {
      await this.repo.addHistoryEntryToTicket(id, historyEntry);
    }
    return updated;
  }

  async deleteTicket(id: string) {
    const deleted = await this.repo.deleteTicket(id);
    if (!deleted) {
      throw new AppError(`Maintenance ticket ${id} not found`, 404);
    }
    return { id, message: 'Maintenance ticket deleted successfully' };
  }

  // ================= 2. HUREMASO SUBSECTION SERVICE =================

  async getHuremasoOverview() {
    await this.seedDefaultsIfEmpty();

    const [health, logs] = await Promise.all([
      this.repo.getLatestSystemHealth(),
      this.repo.findHuremasoLogs({}, 0, 10),
    ]);

    const defaultHealth = {
      systemName: 'Huremaso Cloud Infrastructure',
      status: 'Operational',
      uptimePercentage: 99.98,
      activeNodesCount: 8,
      totalNodesCount: 8,
      databaseStatus: 'Optimized',
      fragmentationCount: 0,
      cacheLatencyMs: 12,
      redisStatus: 'Redis cluster fully synchronized',
      lastDiagnosticRun: new Date().toISOString(),
      diagnosticsSummary: 'Diagnostics completed. All Huremaso services optimal.',
    };

    return {
      systemHealth: health || defaultHealth,
      scheduledMaintenanceLogs: logs.records,
      totalLogsCount: logs.total,
    };
  }

  async runSystemDiagnostics() {
    const refreshedTelemetry = {
      systemName: 'Huremaso Cloud Infrastructure',
      status: 'Operational' as const,
      uptimePercentage: 99.98,
      activeNodesCount: 8,
      totalNodesCount: 8,
      databaseStatus: 'Optimized',
      fragmentationCount: 0,
      cacheLatencyMs: Math.floor(Math.random() * 5) + 10,
      redisStatus: 'Redis cluster fully synchronized',
      lastDiagnosticRun: new Date().toISOString(),
      diagnosticsSummary: 'Diagnostics completed. All 8 Huremaso server nodes and database clusters are operating at peak efficiency.',
    };

    const saved = await this.repo.upsertSystemHealth(refreshedTelemetry as any);
    return saved;
  }

  async listHuremasoLogs(filterParams: IMaintenanceFilterParams) {
    await this.seedDefaultsIfEmpty();

    const page = filterParams.page || 1;
    const limit = filterParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IHuremasoMaintenanceLogDocument> = {};
    if (filterParams.status && filterParams.status !== 'All') {
      filter.status = filterParams.status as any;
    }
    if (filterParams.search) {
      filter.$or = [
        { title: { $regex: filterParams.search, $options: 'i' } },
        { description: { $regex: filterParams.search, $options: 'i' } },
      ];
    }

    const { total, records } = await this.repo.findHuremasoLogs(filter, skip, limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      logs: records,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getHuremasoLogById(id: string) {
    const log = await this.repo.findHuremasoLogById(id);
    if (!log) {
      throw new AppError(`Huremaso maintenance log ${id} not found`, 404);
    }
    return log;
  }

  async createHuremasoLog(payload: Partial<IHuremasoMaintenanceLog>) {
    return this.repo.createHuremasoLog(payload);
  }

  async updateHuremasoLog(id: string, payload: Partial<IHuremasoMaintenanceLog>) {
    const updated = await this.repo.updateHuremasoLog(id, payload);
    if (!updated) {
      throw new AppError(`Huremaso maintenance log ${id} not found`, 404);
    }
    return updated;
  }

  async deleteHuremasoLog(id: string) {
    const deleted = await this.repo.deleteHuremasoLog(id);
    if (!deleted) {
      throw new AppError(`Huremaso maintenance log ${id} not found`, 404);
    }
    return { id, message: 'Huremaso maintenance log deleted successfully' };
  }

  // ================= 3. SEED INITIAL DATA =================

  private async seedDefaultsIfEmpty() {
    const count = await this.repo.countTickets();
    if (count === 0) {
      const initialTickets: Array<Partial<IMaintenanceTicket>> = [
        {
          ticketNumber: '#MTK-1001',
          title: 'Not able to add new candidates',
          description:
            'System error when attempting to add new candidate profiles. Error occurs during the submission process.',
          priority: 'High',
          category: 'System Error',
          status: 'Open',
          requesterName: 'Sarah Joseph',
          requesterEmail: 'sarah.j@company.com',
          department: 'Recruitment',
          assignedAgent: 'David Vance (IT Ops)',
          createdDate: 'July 24, 2025 - 6.30 Pm',
          comments: [
            {
              id: '1',
              author: 'Sarah Joseph',
              role: 'Requester',
              text: 'Submission button hangs with indefinite loading spinner on step 3 of onboarding.',
              timestamp: 'July 24, 2025 - 6.30 Pm',
              isStaff: false,
            },
          ],
          history: [
            {
              id: '1',
              action: 'Ticket Created',
              performedBy: 'Sarah Joseph',
              timestamp: new Date('2025-07-24T18:30:00Z').toISOString(),
              details: 'Ticket opened with High Priority.',
            },
          ],
        },
        {
          ticketNumber: '#MTK-1002',
          title: 'Candidate profile synchronization latency',
          description:
            'System error when attempting to add new candidate profiles. Error occurs during the submission process.',
          priority: 'Medium',
          category: 'System Error',
          status: 'Resolved',
          requesterName: 'Michael Torres',
          requesterEmail: 'michael.t@company.com',
          department: 'Engineering',
          assignedAgent: 'Alex Morgan (DevOps)',
          createdDate: 'July 24, 2025 - 6.30 Pm',
          resolvedDate: 'July 27, 2025 - 6.30 Pm',
          comments: [
            {
              id: '1',
              author: 'Alex Morgan',
              role: 'Support Agent',
              text: 'Database index rebuilt and replication lag resolved. Verified profile submission flow.',
              timestamp: 'July 27, 2025 - 6.30 Pm',
              isStaff: true,
            },
          ],
          history: [
            {
              id: '1',
              action: 'Status Changed to Resolved',
              performedBy: 'Alex Morgan',
              timestamp: new Date('2025-07-27T18:30:00Z').toISOString(),
              details: 'Resolution verified.',
            },
          ],
        },
      ];

      for (const t of initialTickets) {
        await this.repo.createTicket(t);
      }
    }

    const logCount = await this.repo.countHuremasoLogs();
    if (logCount === 0) {
      const initialLogs: Array<Partial<IHuremasoMaintenanceLog>> = [
        {
          title: 'Database Index Rebuild & Vacuuming',
          description: 'Quarterly optimization of high-write collection indices and disk defragmentation.',
          scheduledDate: 'August 28, 2026 - 02:00 AM',
          duration: '14 mins',
          status: 'Completed',
          affectedServices: ['Huremaso Core DB', 'Analytics Cluster'],
          performedBy: 'DBA Ops Team',
        },
        {
          title: 'Security Patch Release v4.8.2',
          description: 'Zero-downtime hotfix addressing TLS handshake performance and OpenSSL upgrades.',
          scheduledDate: 'August 15, 2026 - 01:30 AM',
          duration: '8 mins',
          status: 'Completed',
          affectedServices: ['API Gateway', 'Authentication Service'],
          performedBy: 'SecOps Team',
        },
        {
          title: 'Upcoming SSL & Encryption Rotation',
          description: 'Scheduled rotation of wild-card certificates across edge reverse proxies.',
          scheduledDate: 'September 15, 2026 - 03:00 AM',
          duration: 'Scheduled',
          status: 'Pending',
          affectedServices: ['CDN Edge', 'HTTPS Ingress'],
          performedBy: 'Cloud Platform Engineering',
        },
      ];

      for (const l of initialLogs) {
        await this.repo.createHuremasoLog(l);
      }
    }

    const health = await this.repo.getLatestSystemHealth();
    if (!health) {
      await this.repo.upsertSystemHealth({
        systemName: 'Huremaso Cloud Infrastructure',
        status: 'Operational',
        uptimePercentage: 99.98,
        activeNodesCount: 8,
        totalNodesCount: 8,
        databaseStatus: 'Optimized',
        fragmentationCount: 0,
        cacheLatencyMs: 12,
        redisStatus: 'Redis cluster fully synchronized',
        lastDiagnosticRun: new Date().toISOString(),
        diagnosticsSummary: 'Diagnostics completed. All Huremaso services optimal.',
      } as any);
    }
  }
}

export const maintenanceService = new MaintenanceService();
