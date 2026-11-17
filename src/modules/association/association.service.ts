import { associationRepository, AssociationRepository } from './association.repository';
import {
  CreateAssociationRequestInput,
  UpdateAssociationInput,
  ApproveRejectAssociationInput,
  DeactivateAssociationInput,
  RenewAssociationInput,
  AssociationQueryFilterInput,
} from './association.validator';
import { IAssociationDocument, IAssociationOverviewStats } from './association.types';
import { AppError } from '../../common/errors/AppError';

export class AssociationService {
  private repository: AssociationRepository;

  constructor(repository = associationRepository) {
    this.repository = repository;
  }

  private formatDate(date = new Date()): string {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // ================= 1. NEW ASSOCIATION REQUESTS =================

  async listRequests(
    params: AssociationQueryFilterInput
  ): Promise<{ requests: IAssociationDocument[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const filterParams = { ...params, type: 'new' as const };
    const { items, total } = await this.repository.findAll(filterParams);
    const page = params.page || 1;
    const limit = params.limit || 10;

    return {
      requests: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getRequestById(id: string): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Association request with id or code '${id}' not found`);
    }
    return doc;
  }

  async createRequest(input: CreateAssociationRequestInput): Promise<IAssociationDocument> {
    const employeeName = input.employeeName || input.name || 'Anonymous Employee';
    const targetDepartment = input.targetDepartment || 'Marketing Department';
    const associatedEntity = input.associatedEntity || 'Huremaso Global Tech';

    // Duplicate submission prevention
    const existingPending = await this.repository.findPendingDuplicate(employeeName, targetDepartment);

    if (existingPending) {
      throw AppError.badRequest(
        `A pending association request already exists for ${employeeName} with ${targetDepartment}.`
      );
    }

    const associationCode = await this.repository.getNextCode();
    const requestDetails = input.requestDetails || input.text || '';
    const dateRequested = input.dateRequested || input.date || this.formatDate();

    const durationMonths = input.durationMonths || 6;
    let expiryDate = input.expiryDate || '';
    if (!expiryDate) {
      const exp = new Date();
      exp.setMonth(exp.getMonth() + durationMonths);
      expiryDate = this.formatDate(exp);
    }

    const newDoc = await this.repository.create({
      associationCode,
      employeeName,
      employeeId: input.employeeId || '',
      requesterEmail: input.requesterEmail || '',
      requesterAvatar: input.requesterAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      department: input.department || 'General',
      targetDepartment,
      associatedEntity,
      associationType: input.associationType || 'Project Collaboration',
      requestDetails,
      status: 'Pending',
      dateRequested,
      effectiveDate: input.effectiveDate || this.formatDate(),
      expiryDate,
      durationMonths,
      attachments: input.attachments || [],
      notes: input.notes || '',
      isExisting: false,
      history: [
        {
          id: '1',
          action: 'Association Request Submitted',
          performedBy: employeeName,
          timestamp: new Date().toISOString(),
          details: `Request created for ${targetDepartment}.`,
        },
      ],
    });

    return newDoc;
  }

  async updateRequest(id: string, input: UpdateAssociationInput): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Association record with id or code '${id}' not found`);
    }

    const employeeName = input.employeeName || input.name || doc.employeeName;
    const requestDetails = input.requestDetails || input.text || doc.requestDetails;
    const dateRequested = input.dateRequested || doc.dateRequested;

    const historyEntry = {
      id: String(doc.history.length + 1),
      action: 'Request Details Updated',
      performedBy: input.performedBy || 'System Admin',
      timestamp: new Date().toISOString(),
      details: 'Association information updated.',
    };

    const updated = await this.repository.update(id, {
      ...input,
      employeeName,
      requestDetails,
      dateRequested,
      history: [...doc.history, historyEntry],
    });

    if (!updated) {
      throw AppError.notFound(`Failed to update association record '${id}'`);
    }

    return updated;
  }

  async approveRequest(id: string, input: ApproveRejectAssociationInput): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Association request with id '${id}' not found`);
    }

    const performer = input.performedBy || 'System Admin';
    const effectiveDate = input.effectiveDate || this.formatDate();

    const historyEntry = {
      id: String(doc.history.length + 1),
      action: 'Request Approved & Association Activated',
      performedBy: performer,
      timestamp: new Date().toISOString(),
      details: input.notes || 'Inhouse association request officially approved and activated.',
    };

    const updated = await this.repository.update(id, {
      status: 'Active',
      isExisting: true,
      effectiveDate,
      approvalDetails: {
        approvedBy: performer,
        approvedAt: new Date().toISOString(),
        notes: input.notes || 'Approved.',
      },
      history: [...doc.history, historyEntry],
    });

    if (!updated) {
      throw AppError.notFound(`Failed to approve association '${id}'`);
    }

    return updated;
  }

  async rejectRequest(id: string, input: ApproveRejectAssociationInput): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Association request with id '${id}' not found`);
    }

    const performer = input.performedBy || 'System Admin';
    const reason = input.rejectionReason || input.notes || 'Request rejected / cancelled by administrator.';

    const historyEntry = {
      id: String(doc.history.length + 1),
      action: 'Request Rejected / Cancelled',
      performedBy: performer,
      timestamp: new Date().toISOString(),
      details: reason,
    };

    const updated = await this.repository.update(id, {
      status: 'Rejected',
      isExisting: false,
      approvalDetails: {
        rejectionReason: reason,
        approvedBy: performer,
        approvedAt: new Date().toISOString(),
      },
      history: [...doc.history, historyEntry],
    });

    if (!updated) {
      throw AppError.notFound(`Failed to reject association '${id}'`);
    }

    return updated;
  }

  // ================= 2. EXISTING ASSOCIATIONS =================

  async listExisting(
    params: AssociationQueryFilterInput
  ): Promise<{ associations: IAssociationDocument[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const filterParams = { ...params, type: 'existing' as const };
    const { items, total } = await this.repository.findAll(filterParams);
    const page = params.page || 1;
    const limit = params.limit || 10;

    return {
      associations: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getExistingById(id: string): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Existing association record with id or code '${id}' not found`);
    }
    return doc;
  }

  async deactivateExisting(id: string, input: DeactivateAssociationInput): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Existing association with id '${id}' not found`);
    }

    const performer = input.performedBy || 'System Admin';
    const reason = input.reason || 'Association terminated / deactivated.';

    const historyEntry = {
      id: String(doc.history.length + 1),
      action: 'Association Cancelled / Deactivated',
      performedBy: performer,
      timestamp: new Date().toISOString(),
      details: reason,
    };

    const updated = await this.repository.update(id, {
      status: 'Inactive',
      isExisting: false,
      history: [...doc.history, historyEntry],
    });

    if (!updated) {
      throw AppError.notFound(`Failed to deactivate association '${id}'`);
    }

    return updated;
  }

  async renewExisting(id: string, input: RenewAssociationInput): Promise<IAssociationDocument> {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw AppError.notFound(`Existing association with id '${id}' not found`);
    }

    const performer = input.performedBy || 'System Admin';
    const months = input.durationMonths || 6;
    let newExpiry = input.expiryDate;
    if (!newExpiry) {
      const base = doc.expiryDate ? new Date(doc.expiryDate) : new Date();
      base.setMonth(base.getMonth() + months);
      newExpiry = this.formatDate(base);
    }

    const historyEntry = {
      id: String(doc.history.length + 1),
      action: 'Association Renewed & Extended',
      performedBy: performer,
      timestamp: new Date().toISOString(),
      details: input.notes || `Association extended for ${months} months through ${newExpiry}.`,
    };

    const updated = await this.repository.update(id, {
      expiryDate: newExpiry,
      durationMonths: months,
      status: 'Active',
      isExisting: true,
      history: [...doc.history, historyEntry],
    });

    if (!updated) {
      throw AppError.notFound(`Failed to renew association '${id}'`);
    }

    return updated;
  }

  // ================= 3. GENERAL / OVERVIEW METHODS =================

  async listAll(
    params: AssociationQueryFilterInput
  ): Promise<{ items: IAssociationDocument[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const { items, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = params.limit || 10;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async deleteAssociation(id: string): Promise<IAssociationDocument> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw AppError.notFound(`Association with id or code '${id}' not found`);
    }
    return deleted;
  }

  async getOverviewStats(): Promise<IAssociationOverviewStats> {
    return this.repository.getOverviewStats();
  }
}

export const associationService = new AssociationService();
