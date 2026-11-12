import {
  EmployeeAppUserModel,
  AppAnnouncementModel,
  AppEmployeeRequestModel,
  AppActivityLogModel,
  AppSettingsModel,
} from './employeeApp.model';
import {
  IEmployeeAppUser,
  IEmployeeAppUserDocument,
  IAppAnnouncement,
  IAppAnnouncementDocument,
  IAppEmployeeRequest,
  IAppEmployeeRequestDocument,
  IAppActivityLog,
  IAppActivityLogDocument,
  IAppSettingsConfig,
  IAppSettingsDocument,
} from './employeeApp.types';

export class EmployeeAppRepository {
  // ================= USERS =================
  async findUsers(
    filter: Record<string, any>,
    skip: number = 0,
    limit: number = 50,
    sort: Record<string, any> = { createdAt: -1 }
  ): Promise<{ users: IEmployeeAppUserDocument[]; total: number }> {
    await this.ensureSeedData();
    const [users, total] = await Promise.all([
      EmployeeAppUserModel.find(filter).sort(sort).skip(skip).limit(limit),
      EmployeeAppUserModel.countDocuments(filter),
    ]);
    return { users, total };
  }

  async findUserById(id: string): Promise<IEmployeeAppUserDocument | null> {
    return EmployeeAppUserModel.findById(id);
  }

  async findUserByAppUserId(appUserId: string): Promise<IEmployeeAppUserDocument | null> {
    return EmployeeAppUserModel.findOne({ appUserId });
  }

  async findUserByEmployeeId(employeeId: string): Promise<IEmployeeAppUserDocument | null> {
    return EmployeeAppUserModel.findOne({ employeeId });
  }

  async createUser(userData: Partial<IEmployeeAppUser>): Promise<IEmployeeAppUserDocument> {
    return EmployeeAppUserModel.create(userData);
  }

  async updateUser(id: string, updateData: Partial<IEmployeeAppUser>): Promise<IEmployeeAppUserDocument | null> {
    return EmployeeAppUserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async deleteUser(id: string): Promise<IEmployeeAppUserDocument | null> {
    return EmployeeAppUserModel.findByIdAndDelete(id);
  }

  async countUsers(filter: Record<string, any> = {}): Promise<number> {
    return EmployeeAppUserModel.countDocuments(filter);
  }

  // ================= ANNOUNCEMENTS =================
  async findAnnouncements(
    filter: Record<string, any>,
    skip: number = 0,
    limit: number = 50,
    sort: Record<string, any> = { createdAt: -1 }
  ): Promise<{ announcements: IAppAnnouncementDocument[]; total: number }> {
    await this.ensureSeedData();
    const [announcements, total] = await Promise.all([
      AppAnnouncementModel.find(filter).sort(sort).skip(skip).limit(limit),
      AppAnnouncementModel.countDocuments(filter),
    ]);
    return { announcements, total };
  }

  async findAnnouncementById(id: string): Promise<IAppAnnouncementDocument | null> {
    return AppAnnouncementModel.findById(id);
  }

  async createAnnouncement(data: Partial<IAppAnnouncement>): Promise<IAppAnnouncementDocument> {
    return AppAnnouncementModel.create(data);
  }

  async updateAnnouncement(id: string, data: Partial<IAppAnnouncement>): Promise<IAppAnnouncementDocument | null> {
    return AppAnnouncementModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteAnnouncement(id: string): Promise<IAppAnnouncementDocument | null> {
    return AppAnnouncementModel.findByIdAndDelete(id);
  }

  // ================= REQUESTS =================
  async findRequests(
    filter: Record<string, any>,
    skip: number = 0,
    limit: number = 50,
    sort: Record<string, any> = { submittedAt: -1 }
  ): Promise<{ requests: IAppEmployeeRequestDocument[]; total: number }> {
    await this.ensureSeedData();
    const [requests, total] = await Promise.all([
      AppEmployeeRequestModel.find(filter).sort(sort).skip(skip).limit(limit),
      AppEmployeeRequestModel.countDocuments(filter),
    ]);
    return { requests, total };
  }

  async findRequestById(id: string): Promise<IAppEmployeeRequestDocument | null> {
    return AppEmployeeRequestModel.findById(id);
  }

  async createRequest(data: Partial<IAppEmployeeRequest>): Promise<IAppEmployeeRequestDocument> {
    return AppEmployeeRequestModel.create(data);
  }

  async updateRequest(id: string, data: Partial<IAppEmployeeRequest>): Promise<IAppEmployeeRequestDocument | null> {
    return AppEmployeeRequestModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // ================= ACTIVITY LOGS =================
  async findActivityLogs(
    filter: Record<string, any>,
    skip: number = 0,
    limit: number = 50,
    sort: Record<string, any> = { createdAt: -1 }
  ): Promise<{ logs: IAppActivityLogDocument[]; total: number }> {
    await this.ensureSeedData();
    const [logs, total] = await Promise.all([
      AppActivityLogModel.find(filter).sort(sort).skip(skip).limit(limit),
      AppActivityLogModel.countDocuments(filter),
    ]);
    return { logs, total };
  }

  async createActivityLog(log: Partial<IAppActivityLog>): Promise<IAppActivityLogDocument> {
    return AppActivityLogModel.create(log);
  }

  // ================= SETTINGS =================
  async getSettings(): Promise<IAppSettingsDocument> {
    let settings = await AppSettingsModel.findOne();
    if (!settings) {
      settings = await AppSettingsModel.create({
        appName: 'Huremaso Mobile HR',
        currentVersion: 'v2.4.0',
        minimumSupportedVersion: 'v2.0.0',
        maintenanceMode: false,
        maintenanceMessage: 'The employee portal is undergoing scheduled maintenance.',
        forceUpdate: false,
        allowBiometricLogin: true,
        sessionTimeoutMinutes: 45,
        allowOfflineMode: true,
        maxDevicesPerUser: 2,
        allowedFeatures: {
          attendanceGeofence: true,
          pushNotifications: true,
          offlineSync: true,
          documentDownload: true,
          darkTheme: true,
          profilePhotoUpload: false,
        },
        securityPolicy: {
          passcodeExpiryDays: 90,
          blockRootedDevices: true,
          screenshotBlocked: true,
          enforceStrongPassword: true,
        },
        supportContactEmail: 'app-support@huremaso.com',
        supportContactPhone: '+1 (800) 555-0199',
        updatedBy: 'System Administrator',
      });
    }
    return settings;
  }

  async updateSettings(data: Partial<IAppSettingsConfig>): Promise<IAppSettingsDocument | null> {
    let settings = await AppSettingsModel.findOne();
    if (!settings) {
      return AppSettingsModel.create(data);
    }
    return AppSettingsModel.findByIdAndUpdate(settings._id, { $set: data }, { new: true });
  }

  // ================= SEED INITIAL DATA =================
  private seedAttempted = false;

  private async ensureSeedData(): Promise<void> {
    if (this.seedAttempted) return;
    this.seedAttempted = true;

    try {
      const userCount = await EmployeeAppUserModel.countDocuments();
      if (userCount === 0) {
        await EmployeeAppUserModel.insertMany([
          {
            employeeId: 'EMP-1001',
            appUserId: 'APP-USR-1001',
            fullName: 'Sarah Joseph',
            email: 'sarah.j@company.com',
            phone: '+1 (555) 234-5678',
            department: 'Human Resources',
            designation: 'Senior HR Director',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            status: 'Active',
            role: 'Admin',
            deviceId: 'DEV-IPH-15PRO-889',
            deviceName: 'iPhone 15 Pro Max',
            deviceType: 'iOS',
            osVersion: 'iOS 17.5.1',
            appVersion: 'v2.4.0',
            biometricEnabled: true,
            twoFactorEnabled: true,
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 18),
            lastActiveAt: new Date(),
            registeredAt: new Date('2024-01-15'),
            isOnline: true,
            permissions: {
              canViewPayslip: true,
              canApplyLeave: true,
              canSubmitClaims: true,
              canPunchAttendance: true,
              canViewDirectory: true,
              canSubmitRequests: true,
              canViewAnnouncements: true,
              canChatSupport: true,
              canDownloadDocuments: true,
              canUpdateProfilePhoto: true,
            },
            sessionTimeoutMinutes: 60,
          },
          {
            employeeId: 'EMP-1002',
            appUserId: 'APP-USR-1002',
            fullName: 'Alexander Wright',
            email: 'alex.w@company.com',
            phone: '+1 (555) 345-6789',
            department: 'Engineering',
            designation: 'Principal Architect',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            status: 'Active',
            role: 'Manager',
            deviceId: 'DEV-PIX-8PRO-224',
            deviceName: 'Google Pixel 8 Pro',
            deviceType: 'Android',
            osVersion: 'Android 14',
            appVersion: 'v2.4.0',
            biometricEnabled: true,
            twoFactorEnabled: true,
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 65),
            lastActiveAt: new Date(Date.now() - 1000 * 60 * 30),
            registeredAt: new Date('2024-02-01'),
            isOnline: true,
            permissions: {
              canViewPayslip: true,
              canApplyLeave: true,
              canSubmitClaims: true,
              canPunchAttendance: true,
              canViewDirectory: true,
              canSubmitRequests: true,
              canViewAnnouncements: true,
              canChatSupport: true,
              canDownloadDocuments: true,
              canUpdateProfilePhoto: false,
            },
            sessionTimeoutMinutes: 45,
          },
          {
            employeeId: 'EMP-1003',
            appUserId: 'APP-USR-1003',
            fullName: 'Elena Rostova',
            email: 'elena.r@company.com',
            phone: '+1 (555) 456-7890',
            department: 'Design',
            designation: 'Lead Product Designer',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            status: 'Active',
            role: 'Standard',
            deviceId: 'DEV-IPH-14-551',
            deviceName: 'iPhone 14',
            deviceType: 'iOS',
            osVersion: 'iOS 17.4',
            appVersion: 'v2.4.0',
            biometricEnabled: true,
            twoFactorEnabled: false,
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
            lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
            registeredAt: new Date('2024-02-15'),
            isOnline: false,
            permissions: {
              canViewPayslip: true,
              canApplyLeave: true,
              canSubmitClaims: true,
              canPunchAttendance: true,
              canViewDirectory: true,
              canSubmitRequests: true,
              canViewAnnouncements: true,
              canChatSupport: true,
              canDownloadDocuments: false,
              canUpdateProfilePhoto: false,
            },
            sessionTimeoutMinutes: 30,
          },
          {
            employeeId: 'EMP-1004',
            appUserId: 'APP-USR-1004',
            fullName: 'Marcus Vance',
            email: 'marcus.v@company.com',
            phone: '+1 (555) 567-8901',
            department: 'Operations',
            designation: 'Logistics Supervisor',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            status: 'Suspended',
            role: 'Field_Staff',
            deviceId: 'DEV-SAM-S23-909',
            deviceName: 'Samsung Galaxy S23 Ultra',
            deviceType: 'Android',
            osVersion: 'Android 13',
            appVersion: 'v2.3.1',
            biometricEnabled: false,
            twoFactorEnabled: true,
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
            registeredAt: new Date('2024-03-01'),
            isOnline: false,
            notes: 'Suspended pending security clearance review.',
            permissions: {
              canViewPayslip: true,
              canApplyLeave: false,
              canSubmitClaims: false,
              canPunchAttendance: false,
              canViewDirectory: false,
              canSubmitRequests: true,
              canViewAnnouncements: true,
              canChatSupport: true,
              canDownloadDocuments: false,
              canUpdateProfilePhoto: false,
            },
            sessionTimeoutMinutes: 15,
          },
          {
            employeeId: 'EMP-1005',
            appUserId: 'APP-USR-1005',
            fullName: 'Priya Patel',
            email: 'priya.p@company.com',
            phone: '+1 (555) 678-9012',
            department: 'Finance',
            designation: 'Senior Financial Analyst',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            status: 'Pending_Activation',
            role: 'Standard',
            deviceType: 'iOS',
            biometricEnabled: true,
            twoFactorEnabled: true,
            registeredAt: new Date(),
            isOnline: false,
            permissions: {
              canViewPayslip: true,
              canApplyLeave: true,
              canSubmitClaims: true,
              canPunchAttendance: true,
              canViewDirectory: true,
              canSubmitRequests: true,
              canViewAnnouncements: true,
              canChatSupport: true,
              canDownloadDocuments: true,
              canUpdateProfilePhoto: false,
            },
            sessionTimeoutMinutes: 30,
          },
        ]);
      }

      const announcementCount = await AppAnnouncementModel.countDocuments();
      if (announcementCount === 0) {
        await AppAnnouncementModel.insertMany([
          {
            title: 'Huremaso Mobile App Update v2.4 Released',
            message: 'A brand-new mobile app release with enhanced GPS geofencing attendance, biometrics face unlock, and dark mode support.',
            type: 'Update',
            targetAudience: 'All',
            priority: 'High',
            status: 'Sent',
            sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
            readCount: 142,
            totalRecipients: 180,
            sendPushNotification: true,
            sendInApp: true,
            createdBy: 'System Admin',
          },
          {
            title: 'Urgent: Tax Declaration Window Closing Soon',
            message: 'Please review and submit your updated investment declarations before month end via the Mobile Self Service tab.',
            type: 'Alert',
            targetAudience: 'All',
            priority: 'Urgent',
            status: 'Sent',
            sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            readCount: 165,
            totalRecipients: 180,
            sendPushNotification: true,
            sendInApp: true,
            createdBy: 'Finance Dept',
          },
          {
            title: 'Scheduled Cloud Maintenance Notice',
            message: 'Mobile punch-in will undergo a 15-minute background sync window on Sunday 2:00 AM UTC. Offline punching is enabled.',
            type: 'Maintenance',
            targetAudience: 'Role',
            targetRoles: ['Field_Staff', 'Standard'],
            priority: 'Medium',
            status: 'Scheduled',
            scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 36),
            readCount: 0,
            totalRecipients: 120,
            sendPushNotification: true,
            sendInApp: true,
            createdBy: 'DevOps Lead',
          },
        ]);
      }

      const requestCount = await AppEmployeeRequestModel.countDocuments();
      if (requestCount === 0) {
        await AppEmployeeRequestModel.insertMany([
          {
            employeeId: 'EMP-1002',
            employeeName: 'Alexander Wright',
            department: 'Engineering',
            requestType: 'Device_Change',
            title: 'Upgrade to new corporate iPhone 15 Pro device binding',
            details: 'Received new company phone. Requesting unbinding of old Pixel 8 device ID to bind new device token.',
            status: 'Pending',
            priority: 'Medium',
            submittedAt: new Date(Date.now() - 1000 * 60 * 120),
            deviceInfo: 'iOS 17.5.1 / iPhone 15 Pro',
          },
          {
            employeeId: 'EMP-1004',
            employeeName: 'Marcus Vance',
            department: 'Operations',
            requestType: 'Access_Unlock',
            title: 'Account unlock after multiple failed biometric attempts',
            details: 'Entered incorrect PIN while on field inspection. Kindly reset locked session and re-enable biometric access.',
            status: 'In_Review',
            priority: 'High',
            submittedAt: new Date(Date.now() - 1000 * 60 * 360),
            reviewedBy: 'Sarah Joseph',
            reviewNotes: 'Verifying identity with direct manager.',
            deviceInfo: 'Android 13 / Samsung S23',
          },
          {
            employeeId: 'EMP-1003',
            employeeName: 'Elena Rostova',
            department: 'Design',
            requestType: 'Feature_Permission',
            title: 'Request Offline Document Download Permission',
            details: 'Need offline viewing access for project brand guideline documents during client travel flights.',
            status: 'Approved',
            priority: 'Low',
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            reviewedBy: 'Sarah Joseph',
            reviewNotes: 'Granted temporary 30-day offline download permission.',
            reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
          },
        ]);
      }

      const logCount = await AppActivityLogModel.countDocuments();
      if (logCount === 0) {
        await AppActivityLogModel.insertMany([
          {
            employeeId: 'EMP-1001',
            employeeName: 'Sarah Joseph',
            action: 'Biometric Login via FaceID',
            category: 'Auth',
            ipAddress: '172.56.21.90',
            deviceType: 'iPhone 15 Pro (iOS)',
            status: 'Success',
            details: 'User authenticated successfully via FaceID session token.',
          },
          {
            employeeId: 'EMP-1002',
            employeeName: 'Alexander Wright',
            action: 'Geofenced Attendance Clock In',
            category: 'Auth',
            ipAddress: '108.45.19.12',
            deviceType: 'Pixel 8 Pro (Android)',
            status: 'Success',
            details: 'Punch validated within Downtown HQ geofence perimeter (accuracy 4.2m).',
          },
          {
            employeeId: 'EMP-1004',
            employeeName: 'Marcus Vance',
            action: 'App Access Suspended by Admin',
            category: 'Access_Change',
            ipAddress: '192.168.1.10',
            deviceType: 'Admin Web Console',
            status: 'Warning',
            details: 'App user status changed from Active to Suspended.',
          },
          {
            employeeId: 'EMP-1003',
            employeeName: 'Elena Rostova',
            action: 'Offline Document Cache Sync',
            category: 'Permission_Update',
            ipAddress: '142.250.190.46',
            deviceType: 'iPhone 14 (iOS)',
            status: 'Success',
            details: 'Offline document bundle downloaded with encrypted key.',
          },
        ]);
      }
    } catch (e) {
      console.error('Failed seeding employee app default data:', e);
    }
  }
}

export const employeeAppRepository = new EmployeeAppRepository();
