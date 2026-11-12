import { employeeAppRepository } from './employeeApp.repository';
import {
  IEmployeeAppUser,
  IEmployeeAppUserDocument,
  IAppAnnouncement,
  IAppAnnouncementDocument,
  IAppEmployeeRequest,
  IAppEmployeeRequestDocument,
  IAppActivityLogDocument,
  IAppSettingsConfig,
  IAppSettingsDocument,
  IEmployeeAppStats,
  AppUserStatus,
  RequestStatus,
} from './employeeApp.types';

export class EmployeeAppService {
  // ================= STATS / SUMMARY =================
  async getStats(): Promise<IEmployeeAppStats> {
    const [
      totalUsers,
      activeUsers,
      pendingActivations,
      suspendedUsers,
      pendingRequests,
      totalAnnouncements,
      iosCount,
      androidCount,
      webCount,
    ] = await Promise.all([
      employeeAppRepository.countUsers({}),
      employeeAppRepository.countUsers({ status: 'Active' }),
      employeeAppRepository.countUsers({ status: 'Pending_Activation' }),
      employeeAppRepository.countUsers({ status: 'Suspended' }),
      (await employeeAppRepository.findRequests({ status: 'Pending' })).total,
      (await employeeAppRepository.findAnnouncements({})).total,
      employeeAppRepository.countUsers({ deviceType: 'iOS' }),
      employeeAppRepository.countUsers({ deviceType: 'Android' }),
      employeeAppRepository.countUsers({ deviceType: 'Web' }),
    ]);

    const activeToday = await employeeAppRepository.countUsers({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const biometricUsers = await employeeAppRepository.countUsers({ biometricEnabled: true });
    const biometricAdoptionRate = totalUsers > 0 ? Math.round((biometricUsers / totalUsers) * 100) : 0;

    return {
      totalUsers,
      activeUsers,
      pendingActivations,
      suspendedUsers,
      activeToday,
      pendingRequests,
      totalAnnouncements,
      iosCount,
      androidCount,
      webCount,
      biometricAdoptionRate,
    };
  }

  // ================= APP USERS =================
  async getAppUsers(query: {
    status?: string;
    role?: string;
    department?: string;
    deviceType?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  }): Promise<{ items: IEmployeeAppUserDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }
    if (query.role && query.role !== 'All') {
      filter.role = query.role;
    }
    if (query.department && query.department !== 'All') {
      filter.department = query.department;
    }
    if (query.deviceType && query.deviceType !== 'All') {
      filter.deviceType = query.deviceType;
    }
    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { appUserId: searchRegex },
        { department: searchRegex },
        { designation: searchRegex },
      ];
    }

    const { users, total } = await employeeAppRepository.findUsers(filter, skip, limit, { createdAt: -1 });

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAppUserById(id: string): Promise<IEmployeeAppUserDocument | null> {
    return employeeAppRepository.findUserById(id);
  }

  async createAppUser(data: Partial<IEmployeeAppUser>): Promise<IEmployeeAppUserDocument> {
    if (!data.appUserId) {
      data.appUserId = `APP-USR-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const created = await employeeAppRepository.createUser(data);

    await employeeAppRepository.createActivityLog({
      employeeId: created.employeeId,
      employeeName: created.fullName,
      action: 'Employee App Account Created',
      category: 'Access_Change',
      status: 'Success',
      details: `New mobile app user registered with status '${created.status}' and role '${created.role}'.`,
    });

    return created;
  }

  async updateAppUser(id: string, data: Partial<IEmployeeAppUser>): Promise<IEmployeeAppUserDocument | null> {
    const updated = await employeeAppRepository.updateUser(id, data);
    if (updated) {
      await employeeAppRepository.createActivityLog({
        employeeId: updated.employeeId,
        employeeName: updated.fullName,
        action: 'App User Profile Updated',
        category: 'Access_Change',
        status: 'Success',
        details: `Updated mobile profile metadata for ${updated.fullName}.`,
      });
    }
    return updated;
  }

  async toggleUserStatus(id: string, status: AppUserStatus, notes?: string): Promise<IEmployeeAppUserDocument | null> {
    const user = await employeeAppRepository.findUserById(id);
    if (!user) return null;

    const previousStatus = user.status;
    user.status = status;
    if (notes) {
      user.notes = notes;
    }
    const updated = await user.save();

    await employeeAppRepository.createActivityLog({
      employeeId: updated.employeeId,
      employeeName: updated.fullName,
      action: `App Access Status Changed: ${previousStatus} → ${status}`,
      category: 'Access_Change',
      status: status === 'Suspended' ? 'Warning' : 'Success',
      details: notes ? `Status updated to ${status}. Note: ${notes}` : `Status updated to ${status}.`,
    });

    return updated;
  }

  async updateUserPermissions(
    id: string,
    permissions: Partial<IEmployeeAppUser['permissions']>,
    role?: IEmployeeAppUser['role']
  ): Promise<IEmployeeAppUserDocument | null> {
    const user = await employeeAppRepository.findUserById(id);
    if (!user) return null;

    user.permissions = { ...user.permissions, ...permissions };
    if (role) {
      user.role = role;
    }
    const updated = await user.save();

    await employeeAppRepository.createActivityLog({
      employeeId: updated.employeeId,
      employeeName: updated.fullName,
      action: 'App Feature Permissions Modified',
      category: 'Permission_Update',
      status: 'Success',
      details: `Updated mobile capability matrix for role '${updated.role}'.`,
    });

    return updated;
  }

  async resetDeviceBinding(id: string, reason?: string): Promise<IEmployeeAppUserDocument | null> {
    const user = await employeeAppRepository.findUserById(id);
    if (!user) return null;

    const oldDevice = user.deviceName || user.deviceId || 'Unknown Device';
    user.deviceId = undefined;
    user.deviceName = undefined;
    user.pushToken = undefined;
    user.isOnline = false;
    const updated = await user.save();

    await employeeAppRepository.createActivityLog({
      employeeId: updated.employeeId,
      employeeName: updated.fullName,
      action: 'Device Unlinked / Reset Binding',
      category: 'Security_Event',
      status: 'Warning',
      details: `Device '${oldDevice}' unbound from user account. Reason: ${reason || 'Admin reset request'}.`,
    });

    return updated;
  }

  async deleteAppUser(id: string): Promise<IEmployeeAppUserDocument | null> {
    const user = await employeeAppRepository.findUserById(id);
    if (!user) return null;

    const deleted = await employeeAppRepository.deleteUser(id);
    if (deleted) {
      await employeeAppRepository.createActivityLog({
        employeeId: deleted.employeeId,
        employeeName: deleted.fullName,
        action: 'App User Account Removed',
        category: 'Access_Change',
        status: 'Warning',
        details: `Deleted mobile app user account for ${deleted.fullName}.`,
      });
    }
    return deleted;
  }

  // ================= ANNOUNCEMENTS =================
  async getAnnouncements(query: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  }): Promise<{ items: IAppAnnouncementDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.type && query.type !== 'All') {
      filter.type = query.type;
    }
    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }
    if (query.priority && query.priority !== 'All') {
      filter.priority = query.priority;
    }
    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { message: searchRegex }, { createdBy: searchRegex }];
    }

    const { announcements, total } = await employeeAppRepository.findAnnouncements(filter, skip, limit);
    return {
      items: announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAnnouncementById(id: string): Promise<IAppAnnouncementDocument | null> {
    return employeeAppRepository.findAnnouncementById(id);
  }

  async createAnnouncement(data: Partial<IAppAnnouncement>): Promise<IAppAnnouncementDocument> {
    if (data.status === 'Sent' && !data.sentAt) {
      data.sentAt = new Date();
    }
    const totalUsers = await employeeAppRepository.countUsers({ status: 'Active' });
    data.totalRecipients = totalUsers || 100;
    data.readCount = 0;

    const created = await employeeAppRepository.createAnnouncement(data);

    await employeeAppRepository.createActivityLog({
      action: `New Mobile Broadcast: "${created.title}"`,
      category: 'Broadcast',
      status: 'Success',
      details: `Dispatched ${created.type} broadcast to audience '${created.targetAudience}' (Priority: ${created.priority}).`,
    });

    return created;
  }

  async updateAnnouncement(id: string, data: Partial<IAppAnnouncement>): Promise<IAppAnnouncementDocument | null> {
    return employeeAppRepository.updateAnnouncement(id, data);
  }

  async deleteAnnouncement(id: string): Promise<IAppAnnouncementDocument | null> {
    return employeeAppRepository.deleteAnnouncement(id);
  }

  // ================= REQUESTS =================
  async getRequests(query: {
    status?: string;
    requestType?: string;
    priority?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  }): Promise<{ items: IAppEmployeeRequestDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }
    if (query.requestType && query.requestType !== 'All') {
      filter.requestType = query.requestType;
    }
    if (query.priority && query.priority !== 'All') {
      filter.priority = query.priority;
    }
    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { details: searchRegex },
        { employeeName: searchRegex },
        { employeeId: searchRegex },
        { department: searchRegex },
      ];
    }

    const { requests, total } = await employeeAppRepository.findRequests(filter, skip, limit);
    return {
      items: requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getRequestById(id: string): Promise<IAppEmployeeRequestDocument | null> {
    return employeeAppRepository.findRequestById(id);
  }

  async createRequest(data: Partial<IAppEmployeeRequest>): Promise<IAppEmployeeRequestDocument> {
    const created = await employeeAppRepository.createRequest(data);
    await employeeAppRepository.createActivityLog({
      employeeId: created.employeeId,
      employeeName: created.employeeName,
      action: `Employee App Request Submitted: ${created.requestType}`,
      category: 'Request_Action',
      status: 'Success',
      details: `Request '${created.title}' lodged for department ${created.department}.`,
    });
    return created;
  }

  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    reviewNotes?: string,
    reviewedBy: string = 'Admin'
  ): Promise<IAppEmployeeRequestDocument | null> {
    const request = await employeeAppRepository.findRequestById(id);
    if (!request) return null;

    request.status = status;
    request.reviewNotes = reviewNotes;
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date();
    const updated = await request.save();

    // If device unbinding request approved, auto unbind device
    if (status === 'Approved' && updated.requestType === 'Device_Change') {
      const user = await employeeAppRepository.findUserByEmployeeId(updated.employeeId);
      if (user) {
        await this.resetDeviceBinding(user._id.toString(), 'Approved device change request');
      }
    }

    await employeeAppRepository.createActivityLog({
      employeeId: updated.employeeId,
      employeeName: updated.employeeName,
      action: `Request ${updated.requestType} Status: ${status}`,
      category: 'Request_Action',
      status: status === 'Approved' ? 'Success' : status === 'Rejected' ? 'Warning' : 'Success',
      details: `Reviewed by ${reviewedBy}. Note: ${reviewNotes || 'No extra notes provided.'}`,
    });

    return updated;
  }

  // ================= ACTIVITY LOGS =================
  async getActivityLogs(query: {
    category?: string;
    status?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  }): Promise<{ items: IAppActivityLogDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 30));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }
    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }
    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { action: searchRegex },
        { details: searchRegex },
        { employeeName: searchRegex },
        { employeeId: searchRegex },
      ];
    }

    const { logs, total } = await employeeAppRepository.findActivityLogs(filter, skip, limit);
    return {
      items: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ================= SETTINGS =================
  async getSettings(): Promise<IAppSettingsDocument> {
    return employeeAppRepository.getSettings();
  }

  async updateSettings(data: Partial<IAppSettingsConfig>): Promise<IAppSettingsDocument | null> {
    const updated = await employeeAppRepository.updateSettings(data);
    if (updated) {
      await employeeAppRepository.createActivityLog({
        action: 'App Global Configuration Updated',
        category: 'Config_Change',
        status: 'Success',
        details: `Updated mobile application parameters by ${data.updatedBy || 'Admin'}.`,
      });
    }
    return updated;
  }
}

export const employeeAppService = new EmployeeAppService();
