import { FilterQuery } from 'mongoose';
import {
  MaintenanceTicketModel,
  HuremasoMaintenanceLogModel,
  HuremasoSystemHealthModel,
  SystemDiagnosticModel,
} from './maintenance.model';
import {
  IMaintenanceTicket,
  IMaintenanceTicketDocument,
  IHuremasoMaintenanceLog,
  IHuremasoMaintenanceLogDocument,
  IHuremasoSystemHealthDocument,
  ISystemDiagnostic,
  ISystemDiagnosticDocument,
  ITicketComment,
  ITicketHistoryEntry,
  IMaintenanceExecutionEntry,
} from './maintenance.types';

export class MaintenanceRepository {
  public ticketModel = MaintenanceTicketModel;
  public logModel = HuremasoMaintenanceLogModel;
  public healthModel = HuremasoSystemHealthModel;
  public diagnosticModel = SystemDiagnosticModel;

  // ================= 1. ACTIVE SUPPORT TICKETS =================

  async findTickets(
    filter: FilterQuery<IMaintenanceTicketDocument>,
    skip: number,
    limit: number,
    sortField: string = 'createdAt',
    sortOrder: 1 | -1 = -1
  ) {
    const [total, records] = await Promise.all([
      this.ticketModel.countDocuments(filter),
      this.ticketModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);
    return { total, records };
  }

  async findTicketById(id: string) {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const isTicketNum = decoded.toUpperCase().includes('MTK');
    if (!isMongoId && !isTicketNum) {
      return null;
    }
    const query = isMongoId ? { _id: decoded } : { $or: [{ ticketNumber: decoded }, { ticketNumber: withHash }] };
    return this.ticketModel.findOne(query);
  }

  async findTicketByNumber(ticketNumber: string) {
    const decoded = decodeURIComponent(ticketNumber);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    return this.ticketModel.findOne({ $or: [{ ticketNumber: decoded }, { ticketNumber: withHash }] });
  }

  async findOpenTicketByTitleAndRequester(title: string, requesterName: string) {
    return this.ticketModel.findOne({
      title: { $regex: `^${title.trim()}$`, $options: 'i' },
      requesterName: { $regex: `^${requesterName.trim()}$`, $options: 'i' },
      status: { $in: ['Open', 'In Progress', 'Pending', 'On Hold'] },
    });
  }

  async createTicket(payload: Partial<IMaintenanceTicket>) {
    return this.ticketModel.create(payload);
  }

  async updateTicket(id: string, payload: Partial<IMaintenanceTicket>) {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const query = isMongoId ? { _id: decoded } : { $or: [{ ticketNumber: decoded }, { ticketNumber: withHash }] };

    return this.ticketModel.findOneAndUpdate(
      query,
      { $set: payload },
      { new: true, runValidators: true }
    );
  }

  async addCommentToTicket(id: string, comment: ITicketComment) {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const query = isMongoId ? { _id: decoded } : { $or: [{ ticketNumber: decoded }, { ticketNumber: withHash }] };

    return this.ticketModel.findOneAndUpdate(
      query,
      { $push: { comments: comment } },
      { new: true }
    );
  }

  async addHistoryEntryToTicket(id: string, entry: ITicketHistoryEntry) {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const query = isMongoId ? { _id: decoded } : { $or: [{ ticketNumber: decoded }, { ticketNumber: withHash }] };

    return this.ticketModel.findOneAndUpdate(
      query,
      { $push: { history: entry } },
      { new: true }
    );
  }

  async deleteTicket(id: string) {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const isTicketNum = decoded.toUpperCase().includes('MTK');
    if (!isMongoId && !isTicketNum) {
      return null;
    }
    const query = isMongoId ? { _id: decoded } : { $or: [{ ticketNumber: decoded }, { ticketNumber: withHash }] };

    return this.ticketModel.findOneAndDelete(query);
  }

  async countTickets(filter: FilterQuery<IMaintenanceTicketDocument> = {}) {
    return this.ticketModel.countDocuments(filter);
  }

  // ================= 2. HUREMASO MAINTENANCE LOGS =================

  async findHuremasoLogs(
    filter: FilterQuery<IHuremasoMaintenanceLogDocument>,
    skip: number,
    limit: number,
    sortField: string = 'createdAt',
    sortOrder: 1 | -1 = -1
  ) {
    const [total, records] = await Promise.all([
      this.logModel.countDocuments(filter),
      this.logModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);
    return { total, records };
  }

  async findHuremasoLogById(id: string) {
    const decoded = decodeURIComponent(id);
    if (decoded.match(/^[0-9a-fA-F]{24}$/)) {
      return this.logModel.findById(decoded);
    }
    return null;
  }

  async findConflictingMaintenance(scheduledDate: string, scheduledTime: string, excludeId?: string) {
    const query: Record<string, any> = {
      scheduledDate,
      scheduledTime,
      status: { $in: ['Scheduled', 'Pending', 'In Progress'] },
    };
    if (excludeId && excludeId.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = { $ne: excludeId };
    }
    return this.logModel.findOne(query);
  }

  async createHuremasoLog(payload: Partial<IHuremasoMaintenanceLog>) {
    return this.logModel.create(payload);
  }

  async updateHuremasoLog(id: string, payload: Partial<IHuremasoMaintenanceLog>) {
    const decoded = decodeURIComponent(id);
    if (!decoded.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    return this.logModel.findByIdAndUpdate(
      decoded,
      { $set: payload },
      { new: true, runValidators: true }
    );
  }

  async addExecutionEntryToLog(id: string, entry: IMaintenanceExecutionEntry) {
    const decoded = decodeURIComponent(id);
    if (!decoded.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    return this.logModel.findByIdAndUpdate(
      decoded,
      { $push: { executionHistory: entry } },
      { new: true }
    );
  }

  async deleteHuremasoLog(id: string) {
    const decoded = decodeURIComponent(id);
    if (!decoded.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    return this.logModel.findByIdAndDelete(decoded);
  }

  async countHuremasoLogs(filter: FilterQuery<IHuremasoMaintenanceLogDocument> = {}) {
    return this.logModel.countDocuments(filter);
  }

  // ================= 3. HUREMASO SYSTEM HEALTH & DIAGNOSTICS =================

  async getLatestSystemHealth() {
    return this.healthModel.findOne().lean();
  }

  async upsertSystemHealth(payload: Partial<IHuremasoSystemHealthDocument>) {
    return this.healthModel.findOneAndUpdate(
      { systemName: payload.systemName || 'Huremaso Cloud Infrastructure' },
      { $set: payload },
      { upsert: true, new: true }
    );
  }

  async createDiagnostic(payload: Partial<ISystemDiagnostic>) {
    return this.diagnosticModel.create(payload);
  }

  async findDiagnostics(limit: number = 10) {
    return this.diagnosticModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findDiagnosticById(id: string) {
    const decoded = decodeURIComponent(id);
    if (decoded.match(/^[0-9a-fA-F]{24}$/)) {
      return this.diagnosticModel.findById(decoded);
    }
    return this.diagnosticModel.findOne({ diagnosticId: decoded });
  }
}

export const maintenanceRepository = new MaintenanceRepository();
