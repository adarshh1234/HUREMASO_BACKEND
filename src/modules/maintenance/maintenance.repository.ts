import { FilterQuery } from 'mongoose';
import {
  MaintenanceTicketModel,
  HuremasoMaintenanceLogModel,
  HuremasoSystemHealthModel,
} from './maintenance.model';
import {
  IMaintenanceTicket,
  IMaintenanceTicketDocument,
  IHuremasoMaintenanceLog,
  IHuremasoMaintenanceLogDocument,
  IHuremasoSystemHealthDocument,
  ITicketComment,
  ITicketHistoryEntry,
} from './maintenance.types';

export class MaintenanceRepository {
  // ================= 1. ACTIVE SUPPORT TICKETS =================

  async findTickets(
    filter: FilterQuery<IMaintenanceTicketDocument>,
    skip: number,
    limit: number,
    sortField: string = 'createdAt',
    sortOrder: 1 | -1 = -1
  ) {
    const [total, records] = await Promise.all([
      MaintenanceTicketModel.countDocuments(filter),
      MaintenanceTicketModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);
    return { total, records };
  }

  async findTicketById(id: string) {
    return MaintenanceTicketModel.findById(id);
  }

  async findTicketByNumber(ticketNumber: string) {
    return MaintenanceTicketModel.findOne({ ticketNumber });
  }

  async createTicket(payload: Partial<IMaintenanceTicket>) {
    return MaintenanceTicketModel.create(payload);
  }

  async updateTicket(id: string, payload: Partial<IMaintenanceTicket>) {
    return MaintenanceTicketModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );
  }

  async addCommentToTicket(id: string, comment: ITicketComment) {
    return MaintenanceTicketModel.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );
  }

  async addHistoryEntryToTicket(id: string, entry: ITicketHistoryEntry) {
    return MaintenanceTicketModel.findByIdAndUpdate(
      id,
      { $push: { history: entry } },
      { new: true }
    );
  }

  async deleteTicket(id: string) {
    return MaintenanceTicketModel.findByIdAndDelete(id);
  }

  async countTickets() {
    return MaintenanceTicketModel.countDocuments();
  }

  // ================= 2. HUREMASO MAINTENANCE LOGS =================

  async findHuremasoLogs(filter: FilterQuery<IHuremasoMaintenanceLogDocument>, skip: number, limit: number) {
    const [total, records] = await Promise.all([
      HuremasoMaintenanceLogModel.countDocuments(filter),
      HuremasoMaintenanceLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    return { total, records };
  }

  async findHuremasoLogById(id: string) {
    return HuremasoMaintenanceLogModel.findById(id);
  }

  async createHuremasoLog(payload: Partial<IHuremasoMaintenanceLog>) {
    return HuremasoMaintenanceLogModel.create(payload);
  }

  async updateHuremasoLog(id: string, payload: Partial<IHuremasoMaintenanceLog>) {
    return HuremasoMaintenanceLogModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );
  }

  async deleteHuremasoLog(id: string) {
    return HuremasoMaintenanceLogModel.findByIdAndDelete(id);
  }

  async countHuremasoLogs() {
    return HuremasoMaintenanceLogModel.countDocuments();
  }

  // ================= 3. HUREMASO SYSTEM HEALTH =================

  async getLatestSystemHealth() {
    return HuremasoSystemHealthModel.findOne().lean();
  }

  async upsertSystemHealth(payload: Partial<IHuremasoSystemHealthDocument>) {
    return HuremasoSystemHealthModel.findOneAndUpdate(
      { systemName: payload.systemName || 'Huremaso Cloud Infrastructure' },
      { $set: payload },
      { upsert: true, new: true }
    );
  }
}

export const maintenanceRepository = new MaintenanceRepository();
