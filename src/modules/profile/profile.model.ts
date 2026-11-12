import mongoose, { Schema, Document } from 'mongoose';
import {
  IUserProfile,
  IUserPreferences,
  ISecuritySettings,
  IUserContacts,
  IUserSubscriptions,
  IUserNotification,
} from './profile.types';

// ─── 1. UserProfile ────────────────────────────────────────────────────────

export interface IUserProfileDocument extends Omit<IUserProfile, '_id'>, Document {}

const UserProfileSchema = new Schema<IUserProfileDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, default: 'default' },
    name: { type: String, required: true, trim: true, default: 'Alex Morgan' },
    nickname: { type: String, trim: true, default: 'Alex' },
    email: { type: String, trim: true, lowercase: true, default: 'alex.morgan@example.com' },
    phone: { type: String, trim: true, default: '+1 (555) 019-2834' },
    avatarText: { type: String, trim: true, default: 'A' },
    birthday: { type: String, trim: true, default: 'October 14, 1994' },
    gender: { type: String, trim: true, default: 'Rather not say' },
    passwordHash: { type: String, select: false },
    passwordLastChanged: { type: String, default: 'Aug 8, 2023' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).passwordHash;
      },
    },
  }
);

export const UserProfileModel = mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);

// ─── 2. UserPreferences ────────────────────────────────────────────────────

export interface IUserPreferencesDocument extends Omit<IUserPreferences, '_id'>, Document {}

const ActivityControlSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['On', 'Off', 'Paused'], default: 'On' },
  },
  { _id: false }
);

const UserPreferencesSchema = new Schema<IUserPreferencesDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, default: 'default' },
    activityControls: {
      type: [ActivityControlSchema],
      default: [
        { id: 'act_1', title: 'Web & App Activity', status: 'On' },
        { id: 'act_2', title: 'Location History', status: 'On' },
        { id: 'act_3', title: 'Usage History', status: 'On' },
      ],
    },
    businessPersonalization: { type: Boolean, default: false },
    adPersonalization: { type: Boolean, default: true },
    language: { type: String, default: 'English (United States)' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  }
);

export const UserPreferencesModel = mongoose.model<IUserPreferencesDocument>('UserPreferences', UserPreferencesSchema);

// ─── 3. SecuritySettings ───────────────────────────────────────────────────

export interface ISecuritySettingsDocument extends Omit<ISecuritySettings, '_id'>, Document {}

const SecurityIssueSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { _id: false }
);

const SecuritySettingsSchema = new Schema<ISecuritySettingsDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, default: 'default' },
    twoStepVerification: { type: Boolean, default: false },
    lessSecureApps: { type: Boolean, default: false },
    phoneSignIn: { type: Boolean, default: false },
    issues: {
      type: [SecurityIssueSchema],
      default: [
        {
          id: 'sec_1',
          title: '2-Step Verification disabled',
          description: 'Add an extra layer of security to prevent unauthorized access.',
          severity: 'medium',
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  }
);

export const SecuritySettingsModel = mongoose.model<ISecuritySettingsDocument>('SecuritySettings', SecuritySettingsSchema);

// ─── 4. UserContacts ───────────────────────────────────────────────────────

export interface IUserContactsDocument extends Omit<IUserContacts, '_id'>, Document {}

const ContactSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    avatarText: { type: String },
  },
  { _id: false }
);

const UserContactsSchema = new Schema<IUserContactsDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, default: 'default' },
    contacts: {
      type: [ContactSchema],
      default: [
        { id: 'c_1', name: 'Sarah Connor', email: 'sarah@example.com', avatarText: 'S' },
        { id: 'c_2', name: 'John Doe', email: 'john@example.com', avatarText: 'J' },
        { id: 'c_3', name: 'Emma Watson', email: 'emma@example.com', avatarText: 'E' },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  }
);

export const UserContactsModel = mongoose.model<IUserContactsDocument>('UserContacts', UserContactsSchema);

// ─── 5. UserSubscriptions ──────────────────────────────────────────────────

export interface IUserSubscriptionsDocument extends Omit<IUserSubscriptions, '_id'>, Document {}

const SubscriptionItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    cost: { type: String },
    status: { type: String, enum: ['Active', 'Cancelled', 'Expired'], default: 'Active' },
  },
  { _id: false }
);

const UserSubscriptionsSchema = new Schema<IUserSubscriptionsDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, default: 'default' },
    subscriptions: {
      type: [SubscriptionItemSchema],
      default: [
        { id: 'sub_1', title: 'HRMS Storage Plus', description: '100 GB Cloud Storage', cost: '$1.99/mo', status: 'Active' },
        { id: 'sub_2', title: 'HRMS Security Pass', description: 'Advanced protection suite', cost: '$4.99/mo', status: 'Active' },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  }
);

export const UserSubscriptionsModel = mongoose.model<IUserSubscriptionsDocument>('UserSubscriptions', UserSubscriptionsSchema);

// ─── 6. UserNotification (Bell/Inbox) ──────────────────────────────────────

export interface IUserNotificationDocument extends Omit<IUserNotification, '_id'>, Document {}

const UserNotificationSchema = new Schema<IUserNotificationDocument>(
  {
    userId: { type: String, required: true, index: true, default: 'default' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  }
);

UserNotificationSchema.index({ userId: 1, createdAt: -1 });
UserNotificationSchema.index({ userId: 1, isRead: 1 });

export const UserNotificationModel = mongoose.model<IUserNotificationDocument>('UserNotification', UserNotificationSchema);
