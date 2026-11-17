import mongoose, { Schema, Document } from 'mongoose';
import {
  NotificationChannel,
  RecipientType,
  NotificationStatus,
  DeliveryStatus,
  INotification,
  IRecipientDelivery,
} from './notification.types';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

const RecipientDeliverySchema = new Schema<IRecipientDelivery>(
  {
    recipientId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, default: 'General', trim: true },
    contactAddress: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.QUEUED,
    },
    error: { type: String, default: '', trim: true },
    messageId: { type: String, default: '', trim: true },
    sentAt: { type: Date },
    readAt: { type: Date },
  },
  { _id: false }
);

const NotificationSchema = new Schema<INotificationDocument>(
  {
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: [true, 'Channel is required'],
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    recipients: {
      type: String,
      required: [true, 'Recipients display description is required'],
      trim: true,
    },
    recipientType: {
      type: String,
      enum: Object.values(RecipientType),
      required: [true, 'Recipient type is required'],
      default: RecipientType.ALL_EMPLOYEES,
    },
    departmentIds: {
      type: [String],
      default: [],
    },
    employeeIds: {
      type: [String],
      default: [],
    },
    announcementCategory: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      required: [true, 'Status is required'],
      default: NotificationStatus.DRAFT,
    },
    createdBy: {
      type: String,
      default: 'System User',
    },
    recipientDeliveries: {
      type: [RecipientDeliverySchema],
      default: [],
    },
    totalRecipientsCount: {
      type: Number,
      default: 0,
    },
    validRecipientsCount: {
      type: Number,
      default: 0,
    },
    invalidRecipientsCount: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ channel: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ createdBy: 1 });
NotificationSchema.index({ channel: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ 'recipientDeliveries.recipientId': 1 });
NotificationSchema.index({ 'recipientDeliveries.status': 1 });

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
