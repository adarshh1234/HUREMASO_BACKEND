import bcrypt from 'bcryptjs';
import { profileRepository, ProfileRepository } from './profile.repository';
import { AppError } from '../../common/errors/AppError';
import { IUpdateProfileDto, IUpdatePreferencesDto, IUpdateSecurityDto } from './profile.types';

export class ProfileService {
  constructor(private repo: ProfileRepository = profileRepository) {}

  // ─── Profile ─────────────────────────────────────────────────────────────

  async getProfile(userId = 'default') {
    return this.repo.getProfile(userId);
  }

  async updateProfile(userId = 'default', updates: IUpdateProfileDto) {
    // Derive avatarText from name if not explicitly provided
    if (updates.name && !updates.avatarText) {
      updates.avatarText = updates.name.trim().charAt(0).toUpperCase();
    }
    return this.repo.updateProfile(userId, updates);
  }

  async changePassword(userId = 'default', currentPassword: string, newPassword: string) {
    const profileWithHash = await this.repo.getProfileWithPasswordHash(userId);
    if (!profileWithHash) {
      throw AppError.notFound('Profile not found');
    }

    // If no hash stored yet, accept any currentPassword (first-time setup)
    if (profileWithHash.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, profileWithHash.passwordHash);
      if (!isMatch) {
        throw AppError.badRequest('Current password is incorrect');
      }
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    await this.repo.updatePasswordHash(userId, newHash, dateLabel);
    return { message: 'Password changed successfully' };
  }

  // ─── Preferences ─────────────────────────────────────────────────────────

  async getPreferences(userId = 'default') {
    return this.repo.getPreferences(userId);
  }

  async updatePreferences(userId = 'default', updates: IUpdatePreferencesDto) {
    return this.repo.updatePreferences(userId, updates);
  }

  // ─── Security ─────────────────────────────────────────────────────────────

  async getSecuritySettings(userId = 'default') {
    return this.repo.getSecuritySettings(userId);
  }

  async updateSecuritySettings(userId = 'default', updates: IUpdateSecurityDto) {
    return this.repo.updateSecuritySettings(userId, updates);
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────

  async getContacts(userId = 'default') {
    return this.repo.getContacts(userId);
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  async getSubscriptions(userId = 'default') {
    return this.repo.getSubscriptions(userId);
  }

  // ─── Storage ──────────────────────────────────────────────────────────────

  getStorageUsage() {
    return this.repo.getStorageUsage();
  }

  // ─── Help ─────────────────────────────────────────────────────────────────

  getHelpArticles() {
    return this.repo.getHelpArticles();
  }

  // ─── User Bell Notifications ──────────────────────────────────────────────

  async getNotifications(userId = 'default') {
    return this.repo.getNotifications(userId);
  }

  async markNotificationRead(userId = 'default', notifId: string) {
    const updated = await this.repo.markNotificationRead(userId, notifId);
    if (!updated) {
      throw AppError.notFound('Notification not found');
    }
    return updated;
  }

  async markAllNotificationsRead(userId = 'default') {
    return this.repo.markAllNotificationsRead(userId);
  }
}

export const profileService = new ProfileService();
