import { FilterQuery, isValidObjectId } from 'mongoose';
import {
  SupportTicketModel,
  SupportMaintenanceModel,
  SupportHelpArticleModel,
  SupportContactRequestModel,
  MiscellaneousRequestModel,
  SupportAgentModel,
} from './support.model';
import {
  ISupportTicket,
  ISupportTicketDocument,
  ISupportMaintenance,
  ISupportMaintenanceDocument,
  ISupportHelpArticle,
  ISupportHelpArticleDocument,
  ISupportContactRequest,
  ISupportContactRequestDocument,
  IMiscellaneousRequest,
  IMiscellaneousRequestDocument,
  ITicketComment,
  ITicketInternalNote,
  ITicketHistoryEntry,
  ISupportAgent,
  ISupportAgentDocument,
  MiscRequestSummaryCounts,
} from './support.types';

export class SupportRepository {
  // ================= 1. TICKETS DATA ACCESS =================

  async findTickets(filter: FilterQuery<ISupportTicketDocument>, skip: number, limit: number) {
    const [total, records] = await Promise.all([
      SupportTicketModel.countDocuments(filter),
      SupportTicketModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    return { total, records };
  }

  async findTicketById(id: string) {
    if (isValidObjectId(id)) {
      const doc = await SupportTicketModel.findById(id);
      if (doc) return doc;
    }
    return SupportTicketModel.findOne({
      $or: [{ ticketNumber: id }, { ticketNumber: `#${id.replace(/^#/, '')}` }],
    });
  }

  async findTicketByNumber(ticketNumber: string) {
    const cleanNum = ticketNumber.trim();
    return SupportTicketModel.findOne({
      $or: [{ ticketNumber: cleanNum }, { ticketNumber: `#${cleanNum.replace(/^#/, '')}` }],
    });
  }

  async findOpenTicketByRequesterAndSubject(requesterEmail: string, subject: string) {
    return SupportTicketModel.findOne({
      requesterEmail: requesterEmail.trim().toLowerCase(),
      subject: { $regex: `^${subject.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      status: { $in: ['Open', 'In Progress', 'Pending', 'Reopened'] },
    });
  }

  async createTicket(payload: Partial<ISupportTicket>) {
    return SupportTicketModel.create(payload);
  }

  async updateTicket(id: string, payload: Partial<ISupportTicket>) {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ ticketNumber: id }, { ticketNumber: `#${id.replace(/^#/, '')}` }] };
    return SupportTicketModel.findOneAndUpdate(query, { $set: payload }, { new: true, runValidators: true });
  }

  async deleteTicket(id: string) {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ ticketNumber: id }, { ticketNumber: `#${id.replace(/^#/, '')}` }] };
    return SupportTicketModel.findOneAndDelete(query);
  }

  async addCommentToTicket(id: string, comment: ITicketComment) {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ ticketNumber: id }, { ticketNumber: `#${id.replace(/^#/, '')}` }] };
    return SupportTicketModel.findOneAndUpdate(
      query,
      { $push: { comments: comment } },
      { new: true }
    );
  }

  async addInternalNoteToTicket(id: string, note: ITicketInternalNote) {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ ticketNumber: id }, { ticketNumber: `#${id.replace(/^#/, '')}` }] };
    return SupportTicketModel.findOneAndUpdate(
      query,
      { $push: { internalNotes: note } },
      { new: true }
    );
  }

  async addHistoryToTicket(id: string, entry: ITicketHistoryEntry) {
    const query = isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ ticketNumber: id }, { ticketNumber: `#${id.replace(/^#/, '')}` }] };
    return SupportTicketModel.findOneAndUpdate(
      query,
      { $push: { history: entry } },
      { new: true }
    );
  }

  async countTickets(filter: FilterQuery<ISupportTicketDocument> = {}) {
    return SupportTicketModel.countDocuments(filter);
  }

  async getAllTicketsForMetrics() {
    return SupportTicketModel.find({}).lean();
  }

  async getTicketDashboardAggregates() {
    const [statusAgg, categoryAgg, priorityAgg, totalCount, unassignedCount, recentTickets, allTickets] = await Promise.all([
      SupportTicketModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      SupportTicketModel.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      SupportTicketModel.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      SupportTicketModel.countDocuments(),
      SupportTicketModel.countDocuments({
        $or: [{ assignedAgent: { $exists: false } }, { assignedAgent: '' }, { assignedAgent: 'Unassigned' }],
        status: { $in: ['Open', 'In Progress', 'Pending', 'Reopened'] },
      }),
      SupportTicketModel.find().sort({ updatedAt: -1 }).limit(6).lean(),
      SupportTicketModel.find({}, 'createdAt firstResponseAt resolvedAt slaDueAt status').lean(),
    ]);

    return { statusAgg, categoryAgg, priorityAgg, totalCount, unassignedCount, recentTickets, allTickets };
  }

  // ================= 2. MAINTENANCE DATA ACCESS =================

  async findMaintenanceRequests(filter: FilterQuery<ISupportMaintenanceDocument>, skip: number, limit: number) {
    const [total, records] = await Promise.all([
      SupportMaintenanceModel.countDocuments(filter),
      SupportMaintenanceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    return { total, records };
  }

  async findMaintenanceById(id: string) {
    return SupportMaintenanceModel.findById(id);
  }

  async createMaintenanceRequest(payload: Partial<ISupportMaintenance>) {
    return SupportMaintenanceModel.create(payload);
  }

  async updateMaintenanceRequest(id: string, payload: Partial<ISupportMaintenance>) {
    return SupportMaintenanceModel.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  }

  async deleteMaintenanceRequest(id: string) {
    return SupportMaintenanceModel.findByIdAndDelete(id);
  }

  async countMaintenance() {
    return SupportMaintenanceModel.countDocuments();
  }

  // ================= 3. HELP / KB DATA ACCESS =================

  async findHelpArticles(filter: FilterQuery<ISupportHelpArticleDocument>, skip: number, limit: number) {
    const [total, records] = await Promise.all([
      SupportHelpArticleModel.countDocuments(filter),
      SupportHelpArticleModel.find(filter).sort({ helpfulVotes: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    return { total, records };
  }

  async findHelpArticleById(id: string) {
    return SupportHelpArticleModel.findById(id);
  }

  async createHelpArticle(payload: Partial<ISupportHelpArticle>) {
    return SupportHelpArticleModel.create(payload);
  }

  async updateHelpArticle(id: string, payload: Partial<ISupportHelpArticle>) {
    return SupportHelpArticleModel.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  }

  async deleteHelpArticle(id: string) {
    return SupportHelpArticleModel.findByIdAndDelete(id);
  }

  async incrementArticleViews(id: string) {
    return SupportHelpArticleModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });
  }

  async voteHelpfulArticle(id: string) {
    return SupportHelpArticleModel.findByIdAndUpdate(id, { $inc: { helpfulVotes: 1 } }, { new: true });
  }

  async voteUnhelpfulArticle(id: string) {
    return SupportHelpArticleModel.findByIdAndUpdate(id, { $inc: { unhelpfulVotes: 1 } }, { new: true });
  }

  async countHelpArticles() {
    return SupportHelpArticleModel.countDocuments();
  }

  // ================= 3b. AGENTS DATA ACCESS =================

  async findAgents() {
    return SupportAgentModel.find().lean();
  }

  async findAgentById(id: string) {
    return SupportAgentModel.findById(id);
  }

  async findAgentByEmail(email: string) {
    return SupportAgentModel.findOne({ email: email.toLowerCase().trim() });
  }

  async createAgent(payload: Partial<ISupportAgent>) {
    return SupportAgentModel.create(payload);
  }

  async updateAgent(id: string, payload: Partial<ISupportAgent>) {
    return SupportAgentModel.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  }

  async countAgents() {
    return SupportAgentModel.countDocuments();
  }

  // ================= 4. CONTACT INQUIRIES DATA ACCESS =================

  async findContactRequests(filter: FilterQuery<ISupportContactRequestDocument>, skip: number, limit: number) {
    const [total, records] = await Promise.all([
      SupportContactRequestModel.countDocuments(filter),
      SupportContactRequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    return { total, records };
  }

  async findContactRequestById(id: string) {
    return SupportContactRequestModel.findById(id);
  }

  async createContactRequest(payload: Partial<ISupportContactRequest>) {
    return SupportContactRequestModel.create(payload);
  }

  async updateContactRequest(id: string, payload: Partial<ISupportContactRequest>) {
    return SupportContactRequestModel.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  }

  async deleteContactRequest(id: string) {
    return SupportContactRequestModel.findByIdAndDelete(id);
  }

  // ================= 5. MISCELLANEOUS REQUESTS DATA ACCESS =================

  async findMiscellaneousRequests(
    filter: FilterQuery<IMiscellaneousRequestDocument>,
    skip: number = 0,
    limit: number = 50,
    sortField: string = 'createdAt',
    sortDir: 1 | -1 = -1
  ): Promise<{ total: number; records: IMiscellaneousRequestDocument[] }> {
    await this.seedMiscellaneousDefaultsIfEmpty();
    const [total, records] = await Promise.all([
      MiscellaneousRequestModel.countDocuments(filter),
      MiscellaneousRequestModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit),
    ]);
    return { total, records };
  }

  async findMiscellaneousRequestById(id: string): Promise<IMiscellaneousRequestDocument | null> {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    if (isObjectId) {
      const byId = await MiscellaneousRequestModel.findById(id);
      if (byId) return byId;
    }
    return MiscellaneousRequestModel.findOne({ requestId: id });
  }

  async findMiscellaneousRequestByRequestId(requestId: string): Promise<IMiscellaneousRequestDocument | null> {
    return MiscellaneousRequestModel.findOne({ requestId });
  }

  async createMiscellaneousRequest(data: Partial<IMiscellaneousRequest>): Promise<IMiscellaneousRequestDocument> {
    if (!data.requestId) {
      const count = await MiscellaneousRequestModel.countDocuments();
      data.requestId = `REQ-${String(count + 1).padStart(3, '0')}`;
    }
    const item = new MiscellaneousRequestModel(data);
    return await item.save();
  }

  async updateMiscellaneousRequest(
    id: string,
    data: Partial<IMiscellaneousRequest>
  ): Promise<IMiscellaneousRequestDocument | null> {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    if (isObjectId) {
      const updated = await MiscellaneousRequestModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );
      if (updated) return updated;
    }
    return MiscellaneousRequestModel.findOneAndUpdate(
      { requestId: id },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async deleteMiscellaneousRequest(id: string): Promise<boolean> {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    if (isObjectId) {
      const deleted = await MiscellaneousRequestModel.findByIdAndDelete(id);
      if (deleted) return true;
    }
    const deletedByReqId = await MiscellaneousRequestModel.findOneAndDelete({ requestId: id });
    return !!deletedByReqId;
  }

  async countMiscellaneousRequests(filter: FilterQuery<IMiscellaneousRequestDocument> = {}): Promise<number> {
    return MiscellaneousRequestModel.countDocuments(filter);
  }

  async getMiscellaneousSummaryCounts(): Promise<MiscRequestSummaryCounts> {
    await this.seedMiscellaneousDefaultsIfEmpty();
    const [total, pending, inReview, approved, rejected, processed] = await Promise.all([
      MiscellaneousRequestModel.countDocuments(),
      MiscellaneousRequestModel.countDocuments({ status: 'Pending' }),
      MiscellaneousRequestModel.countDocuments({ status: 'In Review' }),
      MiscellaneousRequestModel.countDocuments({ status: 'Approved' }),
      MiscellaneousRequestModel.countDocuments({ status: 'Rejected' }),
      MiscellaneousRequestModel.countDocuments({ status: 'Processed' }),
    ]);
    return { total, pending, inReview, approved, rejected, processed };
  }

  async appendMiscellaneousAuditHistory(
    id: string,
    entry: any
  ): Promise<IMiscellaneousRequestDocument | null> {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { requestId: id };
    return MiscellaneousRequestModel.findOneAndUpdate(
      query,
      { $push: { auditHistory: entry } },
      { new: true }
    );
  }

  async seedMiscellaneousDefaultsIfEmpty(): Promise<void> {
    const count = await MiscellaneousRequestModel.countDocuments();
    if (count === 0) {
      const initialRequests = [
        { requestId: 'REQ-001', employee: 'Sarah Johnson', name: 'Sarah Johnson', dept: 'Marketing', department: 'Marketing', type: 'Office Equipment', requestType: 'Office Equipment', date: '2025-07-20', status: 'Approved' as const, priority: 'High' as const, description: 'Request for a new ergonomic chair and dual monitor setup.', email: 'sarah.j@company.com', createdBy: 'Sarah Johnson' },
        { requestId: 'REQ-002', employee: 'Michael Torres', name: 'Michael Torres', dept: 'Engineering', department: 'Engineering', type: 'Software License', requestType: 'Software License', date: '2025-07-22', status: 'Pending' as const, priority: 'Medium' as const, description: 'Requesting JetBrains All-products pack annual license.', email: 'michael.t@company.com', createdBy: 'Michael Torres' },
        { requestId: 'REQ-003', employee: 'Priya Nair', name: 'Priya Nair', dept: 'Finance', department: 'Finance', type: 'Travel Reimbursement', requestType: 'Travel Reimbursement', date: '2025-07-23', status: 'Rejected' as const, priority: 'Low' as const, description: 'Expense claim for client site visit on July 18.', email: 'priya.n@company.com', createdBy: 'Priya Nair' },
        { requestId: 'REQ-004', employee: 'James Walker', name: 'James Walker', dept: 'HR', department: 'HR', type: 'Training Request', requestType: 'Training Request', date: '2025-07-24', status: 'Approved' as const, priority: 'High' as const, description: 'External leadership training program enrollment.', email: 'james.w@company.com', createdBy: 'James Walker' },
        { requestId: 'REQ-005', employee: 'Aisha Patel', name: 'Aisha Patel', dept: 'Operations', department: 'Operations', type: 'Facility Repair', requestType: 'Facility Repair', date: '2025-07-25', status: 'Approved' as const, priority: 'High' as const, description: 'Conference room projector replacement required urgently.', email: 'aisha.p@company.com', createdBy: 'Aisha Patel' },
        { requestId: 'REQ-006', employee: 'Carlos Mendez', name: 'Carlos Mendez', dept: 'Sales', department: 'Sales', type: 'Office Equipment', requestType: 'Office Equipment', date: '2025-07-26', status: 'Pending' as const, priority: 'High' as const, description: 'Laptop upgrade request for field sales activities.', email: 'carlos.m@company.com', createdBy: 'Carlos Mendez' },
        { requestId: 'REQ-007', employee: 'Nadia Kim', name: 'Nadia Kim', dept: 'Design', department: 'Design', type: 'Software License', requestType: 'Software License', date: '2025-07-27', status: 'Approved' as const, priority: 'Medium' as const, description: 'Adobe Creative Cloud subscription renewal.', email: 'nadia.k@company.com', createdBy: 'Nadia Kim' },
        { requestId: 'REQ-008', employee: 'Ethan Brooks', name: 'Ethan Brooks', dept: 'Engineering', department: 'Engineering', type: 'Remote Work Setup', requestType: 'Remote Work Setup', date: '2025-07-28', status: 'Approved' as const, priority: 'High' as const, description: 'Home office allowance for remote workstation.', email: 'ethan.b@company.com', createdBy: 'Ethan Brooks' },
        { requestId: 'REQ-009', employee: 'Fatima Al-Hassan', name: 'Fatima Al-Hassan', dept: 'Legal', department: 'Legal', type: 'Document Services', requestType: 'Document Services', date: '2025-07-30', status: 'Pending' as const, priority: 'Low' as const, description: 'Notarization of employment verification letters.', email: 'fatima.a@company.com', createdBy: 'Fatima Al-Hassan' },
        { requestId: 'REQ-010', employee: 'Lucas Rivera', name: 'Lucas Rivera', dept: 'Marketing', department: 'Marketing', type: 'Training Request', requestType: 'Training Request', date: '2025-08-01', status: 'Rejected' as const, priority: 'Medium' as const, description: 'LinkedIn Learning subscription request.', email: 'lucas.r@company.com', createdBy: 'Lucas Rivera' },
      ];
      await MiscellaneousRequestModel.insertMany(initialRequests);
    }
  }
}

export const supportRepository = new SupportRepository();
