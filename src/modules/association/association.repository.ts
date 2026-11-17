import { AssociationModel } from './association.model';
import { IAssociation, IAssociationDocument, IAssociationFilterParams, IAssociationOverviewStats } from './association.types';

export class AssociationRepository {
  public model = AssociationModel;

  async findOne(query: Record<string, any>): Promise<IAssociationDocument | null> {
    return this.model.findOne(query).exec();
  }

  async findPendingDuplicate(employeeName: string, targetDepartment: string): Promise<IAssociationDocument | null> {
    return this.model.findOne({
      employeeName: { $regex: new RegExp(`^${employeeName.trim()}$`, 'i') },
      targetDepartment: { $regex: new RegExp(`^${targetDepartment.trim()}$`, 'i') },
      status: 'Pending',
      isExisting: false,
    }).exec();
  }

  async seedInitialDataIfEmpty(): Promise<void> {
    const count = await this.model.countDocuments();
    if (count > 0) return;

    const initialSeedData: Partial<IAssociation>[] = [
      {
        associationCode: '#ASC-1001',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Engineering',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Marketing & Growth Unit',
        associationType: 'Project Collaboration',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Pending',
        dateRequested: 'July 20, 2025',
        isExisting: false,
        notes: 'Initial collaboration request submitted by employee.',
        history: [
          {
            id: '1',
            action: 'Request Submitted',
            performedBy: 'Sarah Joseph',
            timestamp: new Date('2025-07-20T09:00:00.000Z').toISOString(),
            details: 'Initial submission for Marketing association.',
          },
        ],
      },
      {
        associationCode: '#ASC-1002',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Product Design',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Creative Campaigns Hub',
        associationType: 'Resource Sharing',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Pending',
        dateRequested: 'July 20, 2025',
        isExisting: false,
        notes: 'Cross-functional design asset alignment.',
        history: [
          {
            id: '1',
            action: 'Request Submitted',
            performedBy: 'Sarah Joseph',
            timestamp: new Date('2025-07-20T10:15:00.000Z').toISOString(),
            details: 'Submitted for UI/UX resource sharing.',
          },
        ],
      },
      {
        associationCode: '#ASC-1003',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Recruitment',
        targetDepartment: 'Employer Branding',
        associatedEntity: 'Huremaso Global Tech',
        associationType: 'Internal Department',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Pending',
        dateRequested: 'July 20, 2025',
        isExisting: false,
        notes: 'Employer brand campaign partnership.',
        history: [
          {
            id: '1',
            action: 'Request Submitted',
            performedBy: 'Sarah Joseph',
            timestamp: new Date('2025-07-20T11:30:00.000Z').toISOString(),
            details: 'Submitted for employer branding synergy.',
          },
        ],
      },
      {
        associationCode: '#ASC-1004',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Operations',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Market Research Guild',
        associationType: 'Cross-Team',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Pending',
        dateRequested: 'July 20, 2025',
        isExisting: false,
        notes: 'Operational process synchronization.',
        history: [
          {
            id: '1',
            action: 'Request Submitted',
            performedBy: 'Sarah Joseph',
            timestamp: new Date('2025-07-20T14:00:00.000Z').toISOString(),
            details: 'Submitted for operational cross-team initiative.',
          },
        ],
      },
      // Existing Associations
      {
        associationCode: '#ASC-1005',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Engineering',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Tech Launch Squad',
        associationType: 'Project Collaboration',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Active',
        isExisting: true,
        dateRequested: 'July 20, 2025',
        effectiveDate: 'July 21, 2025',
        notes: 'Active collaboration for product releases.',
        approvalDetails: {
          approvedBy: 'HR Director',
          approvedAt: new Date('2025-07-21T08:00:00.000Z').toISOString(),
          notes: 'Approved for Q3 joint release initiative.',
        },
        history: [
          {
            id: '1',
            action: 'Approved & Activated',
            performedBy: 'HR Director',
            timestamp: new Date('2025-07-21T08:00:00.000Z').toISOString(),
            details: 'Request approved and converted to active inhouse association.',
          },
        ],
      },
      {
        associationCode: '#ASC-1006',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Product',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Analytics Guild',
        associationType: 'Resource Sharing',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Active',
        isExisting: true,
        dateRequested: 'July 20, 2025',
        effectiveDate: 'July 22, 2025',
        notes: 'Active data visualization support.',
        approvalDetails: {
          approvedBy: 'Engineering Lead',
          approvedAt: new Date('2025-07-22T10:00:00.000Z').toISOString(),
          notes: 'Approved data sharing framework.',
        },
        history: [
          {
            id: '1',
            action: 'Approved & Activated',
            performedBy: 'Engineering Lead',
            timestamp: new Date('2025-07-22T10:00:00.000Z').toISOString(),
            details: 'Active inhouse association enabled.',
          },
        ],
      },
      {
        associationCode: '#ASC-1007',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Customer Success',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'Feedback Loop Taskforce',
        associationType: 'Cross-Team',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Active',
        isExisting: true,
        dateRequested: 'July 20, 2025',
        effectiveDate: 'July 23, 2025',
        notes: 'Active customer testimonial pipeline.',
        approvalDetails: {
          approvedBy: 'Head of Customer Success',
          approvedAt: new Date('2025-07-23T11:00:00.000Z').toISOString(),
          notes: 'Approved testimonial exchange.',
        },
        history: [
          {
            id: '1',
            action: 'Approved & Activated',
            performedBy: 'Head of Customer Success',
            timestamp: new Date('2025-07-23T11:00:00.000Z').toISOString(),
            details: 'Active association record created.',
          },
        ],
      },
      {
        associationCode: '#ASC-1008',
        employeeName: 'Sarah Joseph',
        employeeId: 'EMP-1042',
        requesterEmail: 'sarah.j@company.com',
        requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        department: 'Sales',
        targetDepartment: 'Marketing Department',
        associatedEntity: 'GTM Strategy Group',
        associationType: 'Project Collaboration',
        requestDetails: 'Requesting association with the Marketing Department for project collaboration and resource sharing. Looking forward to joining the team and contributing to upcoming campaigns.',
        status: 'Active',
        isExisting: true,
        dateRequested: 'July 20, 2025',
        effectiveDate: 'July 24, 2025',
        notes: 'Active sales collateral alignment.',
        approvalDetails: {
          approvedBy: 'VP of Sales',
          approvedAt: new Date('2025-07-24T15:00:00.000Z').toISOString(),
          notes: 'Approved joint go-to-market sync.',
        },
        history: [
          {
            id: '1',
            action: 'Approved & Activated',
            performedBy: 'VP of Sales',
            timestamp: new Date('2025-07-24T15:00:00.000Z').toISOString(),
            details: 'Active association record activated.',
          },
        ],
      },
    ];

    await this.model.insertMany(initialSeedData);
  }

  buildMongoFilter(params: IAssociationFilterParams): Record<string, any> {
    const filter: Record<string, any> = {};

    if (params.type === 'new') {
      filter.isExisting = false;
      if (!params.status) {
        filter.status = 'Pending';
      }
    } else if (params.type === 'existing') {
      filter.isExisting = true;
      if (!params.status) {
        filter.status = { $in: ['Active', 'Approved', 'Accepted'] };
      }
    }

    if (params.status) {
      if (params.status.includes(',')) {
        filter.status = { $in: params.status.split(',').map(s => s.trim()) };
      } else {
        filter.status = params.status;
      }
    }

    if (params.department) {
      filter.department = { $regex: new RegExp(params.department, 'i') };
    }

    if (params.targetDepartment) {
      filter.targetDepartment = { $regex: new RegExp(params.targetDepartment, 'i') };
    }

    if (params.associationType) {
      filter.associationType = { $regex: new RegExp(params.associationType, 'i') };
    }

    if (params.employeeName) {
      filter.employeeName = { $regex: new RegExp(params.employeeName, 'i') };
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { associationCode: regex },
        { employeeName: regex },
        { requestDetails: regex },
        { department: regex },
        { targetDepartment: regex },
        { associatedEntity: regex },
        { notes: regex },
      ];
    }

    if (params.fromDate || params.toDate) {
      const dateQuery: Record<string, any> = {};
      if (params.fromDate) dateQuery.$gte = new Date(params.fromDate);
      if (params.toDate) dateQuery.$lte = new Date(params.toDate);
      filter.createdAt = dateQuery;
    }

    return filter;
  }

  async findAll(
    params: IAssociationFilterParams
  ): Promise<{ items: IAssociationDocument[]; total: number }> {
    const filter = this.buildMongoFilter(params);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortDirection = params.sortOrder === 'asc' ? 1 : -1;
    const sortOption: Record<string, any> = { [sortField]: sortDirection };

    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<IAssociationDocument | null> {
    const decoded = decodeURIComponent(id);
    if (decoded.match(/^[0-9a-fA-F]{24}$/)) {
      return this.model.findById(decoded).exec();
    }
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    return this.model.findOne({ $or: [{ associationCode: decoded }, { associationCode: withHash }] }).exec();
  }

  async create(data: Partial<IAssociation>): Promise<IAssociationDocument> {
    const created = await this.model.create(data);
    return created;
  }

  async update(id: string, updateData: Partial<IAssociation>): Promise<IAssociationDocument | null> {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const query = isMongoId ? { _id: decoded } : { $or: [{ associationCode: decoded }, { associationCode: withHash }] };
    return this.model.findOneAndUpdate(query, updateData, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<IAssociationDocument | null> {
    const decoded = decodeURIComponent(id);
    const isMongoId = decoded.match(/^[0-9a-fA-F]{24}$/);
    const withHash = decoded.startsWith('#') ? decoded : `#${decoded}`;
    const query = isMongoId ? { _id: decoded } : { $or: [{ associationCode: decoded }, { associationCode: withHash }] };
    return this.model.findOneAndDelete(query).exec();
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async getNextCode(): Promise<string> {
    const count = await this.model.countDocuments();
    return `#ASC-${1000 + count + 1}`;
  }

  async getOverviewStats(): Promise<IAssociationOverviewStats> {
    const [
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      activeExisting,
    ] = await Promise.all([
      this.model.countDocuments({ isExisting: false }),
      this.model.countDocuments({ status: 'Pending', isExisting: false }),
      this.model.countDocuments({ status: { $in: ['Approved', 'Accepted'] } }),
      this.model.countDocuments({ status: { $in: ['Rejected', 'Cancelled'] } }),
      this.model.countDocuments({ isExisting: true, status: 'Active' }),
    ]);

    return {
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      activeExisting,
    };
  }
}

export const associationRepository = new AssociationRepository();
