import {
  UserProfileModel,
  UserPreferencesModel,
  SecuritySettingsModel,
  UserContactsModel,
  UserSubscriptionsModel,
  UserNotificationModel,
} from './profile.model';
import {
  IUpdateProfileDto,
  IUpdatePreferencesDto,
  IUpdateSecurityDto,
} from './profile.types';

const DEFAULT_HELP_ARTICLES = [
  { id: 'h_1', title: 'See and control the data in your account', category: 'Privacy' },
  { id: 'h_2', title: 'Manage your HRMS settings', category: 'Account' },
  { id: 'h_3', title: 'Secure an account that has suspicious activity', category: 'Security' },
  { id: 'h_4', title: 'How to reset your password', category: 'Security' },
  { id: 'h_5', title: 'Manage notification preferences', category: 'Account' },
];

const SEED_NOTIFICATIONS = [
  {
    userId: 'default',
    title: 'Welcome to HRMS!',
    message: 'Your account has been set up. Explore the features available to you.',
    type: 'success' as const,
    isRead: false,
  },
  {
    userId: 'default',
    title: 'Leave Request Approved',
    message: 'Your annual leave request for Oct 1–3 has been approved by your manager.',
    type: 'success' as const,
    isRead: false,
  },
  {
    userId: 'default',
    title: 'Payroll Processed',
    message: 'Your September payroll has been processed. View your payslip now.',
    type: 'info' as const,
    isRead: false,
  },
  {
    userId: 'default',
    title: 'Performance Review Due',
    message: 'Your Q3 performance self-review is due by October 15th.',
    type: 'warning' as const,
    isRead: false,
  },
  {
    userId: 'default',
    title: 'Document Expiring Soon',
    message: 'Your work permit expires in 30 days. Please submit a renewal request.',
    type: 'warning' as const,
    isRead: true,
  },
];

export class ProfileRepository {
  // ─── Profile ─────────────────────────────────────────────────────────────

  async getProfile(userId = 'default') {
    let doc = await UserProfileModel.findOne({ userId });
    if (!doc) {
      doc = await UserProfileModel.create({ userId });
    }
    return doc;
  }

  async updateProfile(userId = 'default', updates: IUpdateProfileDto) {
    const doc = await UserProfileModel.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    return doc!;
  }

  async updatePasswordHash(userId = 'default', hash: string, dateLabel: string) {
    return UserProfileModel.findOneAndUpdate(
      { userId },
      { $set: { passwordHash: hash, passwordLastChanged: dateLabel } },
      { new: true, upsert: true }
    );
  }

  async getProfileWithPasswordHash(userId = 'default') {
    return UserProfileModel.findOne({ userId }).select('+passwordHash');
  }

  // ─── Preferences ─────────────────────────────────────────────────────────

  async getPreferences(userId = 'default') {
    let doc = await UserPreferencesModel.findOne({ userId });
    if (!doc) {
      doc = await UserPreferencesModel.create({ userId });
    }
    return doc;
  }

  async updatePreferences(userId = 'default', updates: IUpdatePreferencesDto) {
    const doc = await UserPreferencesModel.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    return doc!;
  }

  // ─── Security ─────────────────────────────────────────────────────────────

  async getSecuritySettings(userId = 'default') {
    let doc = await SecuritySettingsModel.findOne({ userId });
    if (!doc) {
      doc = await SecuritySettingsModel.create({ userId });
    }
    return doc;
  }

  async updateSecuritySettings(userId = 'default', updates: IUpdateSecurityDto) {
    const setPayload: Record<string, any> = { ...updates };

    // Auto-resolve the 2FA issue when enabled
    const doc = await SecuritySettingsModel.findOneAndUpdate(
      { userId },
      { $set: setPayload },
      { new: true, upsert: true, runValidators: true }
    );

    // Update issues list based on the new state
    if (doc) {
      const updatedDoc = await SecuritySettingsModel.findOne({ userId });
      if (updatedDoc) {
        const has2FAIssue = !updatedDoc.twoStepVerification;
        const newIssues = has2FAIssue
          ? [{ id: 'sec_1', title: '2-Step Verification disabled', description: 'Add an extra layer of security to prevent unauthorized access.', severity: 'medium' as const }]
          : [];
        await SecuritySettingsModel.findOneAndUpdate({ userId }, { $set: { issues: newIssues } });
      }
    }

    return SecuritySettingsModel.findOne({ userId });
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────

  async getContacts(userId = 'default') {
    let doc = await UserContactsModel.findOne({ userId });
    if (!doc) {
      doc = await UserContactsModel.create({ userId });
    }
    return doc.contacts;
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  async getSubscriptions(userId = 'default') {
    let doc = await UserSubscriptionsModel.findOne({ userId });
    if (!doc) {
      doc = await UserSubscriptionsModel.create({ userId });
    }
    return doc.subscriptions;
  }

  // ─── Storage (derived – static for now) ──────────────────────────────────

  getStorageUsage() {
    return { usedGb: 0.68, totalGb: 15, usedPercentage: 4 };
  }

  // ─── Help Articles ────────────────────────────────────────────────────────

  getHelpArticles() {
    return DEFAULT_HELP_ARTICLES;
  }

  // ─── User Bell Notifications ──────────────────────────────────────────────

  async getNotifications(userId = 'default') {
    const count = await UserNotificationModel.countDocuments({ userId });
    if (count === 0) {
      // Seed initial notifications for new users
      await UserNotificationModel.insertMany(SEED_NOTIFICATIONS);
    }
    const notifications = await UserNotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await UserNotificationModel.countDocuments({ userId, isRead: false });
    return { notifications, unreadCount };
  }

  async markNotificationRead(userId = 'default', notifId: string) {
    return UserNotificationModel.findOneAndUpdate(
      { _id: notifId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllNotificationsRead(userId = 'default') {
    await UserNotificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    return UserNotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }
}

export const profileRepository = new ProfileRepository();
