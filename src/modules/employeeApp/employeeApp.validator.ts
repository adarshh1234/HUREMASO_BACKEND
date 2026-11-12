import { z } from 'zod';

export const permissionsSchema = z.object({
  canViewPayslip: z.boolean().optional(),
  canApplyLeave: z.boolean().optional(),
  canSubmitClaims: z.boolean().optional(),
  canPunchAttendance: z.boolean().optional(),
  canViewDirectory: z.boolean().optional(),
  canSubmitRequests: z.boolean().optional(),
  canViewAnnouncements: z.boolean().optional(),
  canChatSupport: z.boolean().optional(),
  canDownloadDocuments: z.boolean().optional(),
  canUpdateProfilePhoto: z.boolean().optional(),
});

// App User Validators
export const createAppUserSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  appUserId: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required').trim(),
  designation: z.string().min(1, 'Designation is required').trim(),
  avatarUrl: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Pending_Activation']).optional().default('Active'),
  role: z.enum(['Standard', 'Manager', 'Field_Staff', 'Executive', 'Admin']).optional().default('Standard'),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  deviceType: z.enum(['iOS', 'Android', 'Web', 'Tablet']).optional().default('iOS'),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  pushToken: z.string().optional(),
  biometricEnabled: z.boolean().optional().default(true),
  twoFactorEnabled: z.boolean().optional().default(true),
  permissions: permissionsSchema.optional(),
  sessionTimeoutMinutes: z.number().min(5).max(480).optional().default(30),
  notes: z.string().optional(),
});

export const updateAppUserSchema = createAppUserSchema.partial();

export const toggleUserStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Pending_Activation']),
  notes: z.string().optional(),
});

export const updatePermissionsSchema = z.object({
  permissions: permissionsSchema,
  role: z.enum(['Standard', 'Manager', 'Field_Staff', 'Executive', 'Admin']).optional(),
});

export const resetDeviceSchema = z.object({
  reason: z.string().optional().default('Admin requested device unbinding'),
});

// App Announcement / Notification Validators
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Announcement title is required').trim(),
  message: z.string().min(1, 'Announcement message is required').trim(),
  type: z.enum(['Announcement', 'Alert', 'Update', 'Maintenance', 'Policy']).optional().default('Announcement'),
  targetAudience: z.enum(['All', 'Department', 'Role', 'Specific_Employees']).optional().default('All'),
  targetDepartments: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetEmployeeIds: z.array(z.string()).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  scheduledFor: z.string().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(['Draft', 'Scheduled', 'Sent', 'Archived']).optional().default('Sent'),
  clickActionUrl: z.string().optional(),
  sendPushNotification: z.boolean().optional().default(true),
  sendInApp: z.boolean().optional().default(true),
  createdBy: z.string().optional().default('HR Admin'),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// App Employee Request Validators
export const createAppEmployeeRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  employeeName: z.string().min(1, 'Employee name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  requestType: z.enum(['Device_Change', 'Access_Unlock', 'Feature_Permission', 'Profile_Update', 'Data_Sync_Issue', 'Offboard_Wipe']),
  title: z.string().min(1, 'Request title is required').trim(),
  details: z.string().min(1, 'Request details are required').trim(),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  deviceInfo: z.string().optional(),
});

export const updateAppEmployeeRequestStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected', 'In_Review']),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional().default('Admin Reviewer'),
});

// App Settings Validators
export const updateAppSettingsSchema = z.object({
  appName: z.string().min(1).optional(),
  currentVersion: z.string().optional(),
  minimumSupportedVersion: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  forceUpdate: z.boolean().optional(),
  allowBiometricLogin: z.boolean().optional(),
  sessionTimeoutMinutes: z.number().min(5).max(480).optional(),
  allowOfflineMode: z.boolean().optional(),
  maxDevicesPerUser: z.number().min(1).max(10).optional(),
  allowedFeatures: z.object({
    attendanceGeofence: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    offlineSync: z.boolean().optional(),
    documentDownload: z.boolean().optional(),
    darkTheme: z.boolean().optional(),
    profilePhotoUpload: z.boolean().optional(),
  }).optional(),
  securityPolicy: z.object({
    passcodeExpiryDays: z.number().min(0).max(365).optional(),
    blockRootedDevices: z.boolean().optional(),
    screenshotBlocked: z.boolean().optional(),
    enforceStrongPassword: z.boolean().optional(),
  }).optional(),
  supportContactEmail: z.string().email().optional(),
  supportContactPhone: z.string().optional(),
  updatedBy: z.string().optional(),
});
