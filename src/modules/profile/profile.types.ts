// ─── Profile ───────────────────────────────────────────────────────────────

export interface IUserProfile {
  _id?: any;
  userId: string;           // key – defaults to 'default' when no auth
  name: string;
  nickname: string;
  email: string;
  phone: string;
  avatarText: string;
  birthday: string;
  gender: string;
  passwordHash?: string;
  passwordLastChanged: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Preferences ───────────────────────────────────────────────────────────

export interface IActivityControl {
  id: string;
  title: string;
  status: 'On' | 'Off' | 'Paused';
}

export interface IUserPreferences {
  _id?: any;
  userId: string;
  activityControls: IActivityControl[];
  businessPersonalization: boolean;
  adPersonalization: boolean;
  language: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Security ──────────────────────────────────────────────────────────────

export interface ISecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ISecuritySettings {
  _id?: any;
  userId: string;
  twoStepVerification: boolean;
  lessSecureApps: boolean;
  phoneSignIn: boolean;
  issues: ISecurityIssue[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Contacts ──────────────────────────────────────────────────────────────

export interface IContact {
  id: string;
  name: string;
  email: string;
  avatarText: string;
}

export interface IUserContacts {
  _id?: any;
  userId: string;
  contacts: IContact[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Subscriptions ─────────────────────────────────────────────────────────

export interface ISubscriptionItem {
  id: string;
  title: string;
  description: string;
  cost: string;
  status: 'Active' | 'Cancelled' | 'Expired';
}

export interface IUserSubscriptions {
  _id?: any;
  userId: string;
  subscriptions: ISubscriptionItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Help ──────────────────────────────────────────────────────────────────

export interface IHelpArticle {
  id: string;
  title: string;
  category: string;
}

// ─── Storage ───────────────────────────────────────────────────────────────

export interface IStorageUsage {
  usedGb: number;
  totalGb: number;
  usedPercentage: number;
}

// ─── User Bell Notifications ───────────────────────────────────────────────

export interface IUserNotification {
  _id?: any;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────

export interface IUpdateProfileDto {
  name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  avatarText?: string;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdatePreferencesDto {
  activityControls?: IActivityControl[];
  businessPersonalization?: boolean;
  adPersonalization?: boolean;
  language?: string;
}

export interface IUpdateSecurityDto {
  twoStepVerification?: boolean;
  lessSecureApps?: boolean;
  phoneSignIn?: boolean;
}
