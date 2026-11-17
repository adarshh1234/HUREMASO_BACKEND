export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  EMPLOYEE_APP = 'EMPLOYEE_APP',
  HUREMASO = 'HUREMASO',
}

export enum RecipientType {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  DEPARTMENT = 'DEPARTMENT',
  EMPLOYEES = 'EMPLOYEES',
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_SENT = 'PARTIALLY_SENT',
  FAILED = 'FAILED',
}

export enum DeliveryStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  READ = 'READ',
}

export type AnnouncementCategory =
  | 'General Announcement'
  | 'HR Announcement'
  | 'Company News'
  | 'Policy Update'
  | 'Emergency Notice'
  | 'Event Announcement';

export interface IRecipientDelivery {
  recipientId: string;
  name: string;
  department: string;
  contactAddress: string;
  status: DeliveryStatus;
  error?: string;
  messageId?: string;
  sentAt?: Date;
  readAt?: Date;
}

export interface INotification {
  _id?: any;
  channel: NotificationChannel;
  subject?: string;
  message: string;
  recipients: string;
  recipientType: RecipientType;
  departmentIds?: string[];
  employeeIds?: string[];
  announcementCategory?: AnnouncementCategory;
  status: NotificationStatus;
  createdBy?: string;
  recipientDeliveries?: IRecipientDelivery[];
  totalRecipientsCount?: number;
  validRecipientsCount?: number;
  invalidRecipientsCount?: number;
  sentCount?: number;
  deliveredCount?: number;
  failedCount?: number;
  readCount?: number;
  retryCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationQuery {
  page?: number;
  limit?: number;
  search?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IRecipientItem {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  isValidForChannel: boolean;
  validationError?: string;
}

export interface IDepartmentItem {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
}
