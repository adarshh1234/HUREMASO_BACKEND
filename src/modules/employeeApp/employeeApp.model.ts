import { Schema, model } from 'mongoose';
import {
  IEmployeeAppUserDocument,
  IAppAnnouncementDocument,
  IAppEmployeeRequestDocument,
  IAppActivityLogDocument,
  IAppSettingsDocument,
} from './employeeApp.types';

// Permissions Sub-Schema
const EmployeeAppPermissionsSchema = new Schema(
  {
    canViewPayslip: { type: Boolean, default: true },
    canApplyLeave: { type: Boolean, default: true },
    canSubmitClaims: { type: Boolean, default: true },
    canPunchAttendance: { type: Boolean, default: true },
    canViewDirectory: { type: Boolean, default: true },
    canSubmitRequests: { type: Boolean, default: true },
    canViewAnnouncements: { type: Boolean, default: true },
    canChatSupport: { type: Boolean, default: true },
    canDownloadDocuments: { type: Boolean, default: true },
    canUpdateProfilePhoto: { type: Boolean, default: false },
  },
  { _id: false }
);

// 1. Employee App User Schema
const EmployeeAppUserSchema = new Schema<IEmployeeAppUserDocument>(
  {
    employeeId: { type: String, required: true, index: true },
    appUserId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    designation: { type: String, required: true, trim: true },
    avatarUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Pending_Activation'],
      default: 'Active',
      index: true,
    },
    role: {
      type: String,
      enum: ['Standard', 'Manager', 'Field_Staff', 'Executive', 'Admin'],
      default: 'Standard',
      index: true,
    },
    deviceId: { type: String, trim: true },
    deviceName: { type: String, trim: true },
    deviceType: {
      type: String,
      enum: ['iOS', 'Android', 'Web', 'Tablet'],
      default: 'iOS',
      index: true,
    },
    osVersion: { type: String, trim: true },
    appVersion: { type: String, default: 'v2.4.0', trim: true },
    pushToken: { type: String, trim: true },
    biometricEnabled: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },
    registeredAt: { type: Date, default: Date.now },
    permissions: { type: EmployeeAppPermissionsSchema, default: () => ({}) },
    sessionTimeoutMinutes: { type: Number, default: 30 },
    isOnline: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

EmployeeAppUserSchema.index({ fullName: 'text', email: 'text', department: 'text' });
export const EmployeeAppUserModel = model<IEmployeeAppUserDocument>('EmployeeAppUser', EmployeeAppUserSchema);

// 2. App Announcement / Notification Schema
const AppAnnouncementSchema = new Schema<IAppAnnouncementDocument>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Announcement', 'Alert', 'Update', 'Maintenance', 'Policy'],
      default: 'Announcement',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Department', 'Role', 'Specific_Employees'],
      default: 'All',
      index: true,
    },
    targetDepartments: [{ type: String, trim: true }],
    targetRoles: [{ type: String, trim: true }],
    targetEmployeeIds: [{ type: String, trim: true }],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Sent', 'Archived'],
      default: 'Sent',
      index: true,
    },
    readCount: { type: Number, default: 0 },
    totalRecipients: { type: Number, default: 0 },
    clickActionUrl: { type: String, trim: true },
    sendPushNotification: { type: Boolean, default: true },
    sendInApp: { type: Boolean, default: true },
    createdBy: { type: String, default: 'HR Admin', trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

AppAnnouncementSchema.index({ createdAt: -1, status: 1 });
export const AppAnnouncementModel = model<IAppAnnouncementDocument>('AppAnnouncement', AppAnnouncementSchema);

// 3. Employee App Requests Schema
const AppEmployeeRequestSchema = new Schema<IAppEmployeeRequestDocument>(
  {
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    requestType: {
      type: String,
      enum: ['Device_Change', 'Access_Unlock', 'Feature_Permission', 'Profile_Update', 'Data_Sync_Issue', 'Offboard_Wipe'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'In_Review'],
      default: 'Pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true,
    },
    submittedAt: { type: Date, default: Date.now, index: true },
    reviewedBy: { type: String, trim: true },
    reviewNotes: { type: String, trim: true },
    reviewedAt: { type: Date },
    deviceInfo: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

AppEmployeeRequestSchema.index({ status: 1, submittedAt: -1 });
export const AppEmployeeRequestModel = model<IAppEmployeeRequestDocument>('AppEmployeeRequest', AppEmployeeRequestSchema);

// 4. App Activity & Audit Log Schema
const AppActivityLogSchema = new Schema<IAppActivityLogDocument>(
  {
    employeeId: { type: String, index: true },
    employeeName: { type: String, trim: true },
    action: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Auth', 'Access_Change', 'Permission_Update', 'Broadcast', 'Request_Action', 'Config_Change', 'Security_Event'],
      required: true,
      index: true,
    },
    ipAddress: { type: String, default: '192.168.1.1', trim: true },
    deviceType: { type: String, default: 'iOS Mobile', trim: true },
    status: {
      type: String,
      enum: ['Success', 'Failure', 'Warning'],
      default: 'Success',
      index: true,
    },
    details: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

AppActivityLogSchema.index({ createdAt: -1, category: 1 });
export const AppActivityLogModel = model<IAppActivityLogDocument>('AppActivityLog', AppActivityLogSchema);

// 5. App Settings Configuration Schema
const AppSettingsSchema = new Schema<IAppSettingsDocument>(
  {
    appName: { type: String, default: 'Huremaso Mobile HR', trim: true },
    currentVersion: { type: String, default: 'v2.4.0', trim: true },
    minimumSupportedVersion: { type: String, default: 'v2.0.0', trim: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: 'The employee portal is undergoing routine maintenance. Please try again shortly.',
      trim: true,
    },
    forceUpdate: { type: Boolean, default: false },
    allowBiometricLogin: { type: Boolean, default: true },
    sessionTimeoutMinutes: { type: Number, default: 45 },
    allowOfflineMode: { type: Boolean, default: true },
    maxDevicesPerUser: { type: Number, default: 2 },
    allowedFeatures: {
      attendanceGeofence: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      offlineSync: { type: Boolean, default: true },
      documentDownload: { type: Boolean, default: true },
      darkTheme: { type: Boolean, default: true },
      profilePhotoUpload: { type: Boolean, default: false },
    },
    securityPolicy: {
      passcodeExpiryDays: { type: Number, default: 90 },
      blockRootedDevices: { type: Boolean, default: true },
      screenshotBlocked: { type: Boolean, default: true },
      enforceStrongPassword: { type: Boolean, default: true },
    },
    supportContactEmail: { type: String, default: 'app-support@huremaso.com', trim: true },
    supportContactPhone: { type: String, default: '+1 (800) 555-0199', trim: true },
    updatedBy: { type: String, default: 'System Admin', trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

export const AppSettingsModel = model<IAppSettingsDocument>('AppSettings', AppSettingsSchema);
