import { notificationRepository, NotificationRepository } from './notification.repository';
import { providerRegistry } from './providers/index';
import {
  INotification,
  INotificationQuery,
  IPaginatedResult,
  NotificationStatus,
  NotificationChannel,
  RecipientType,
  DeliveryStatus,
  IRecipientDelivery,
  IRecipientItem,
  IDepartmentItem,
} from './notification.types';
import { AppError } from '../../common/errors/AppError';
import { INotificationDocument } from './notification.model';
import { EmployeeModel } from '../employee/employee.model';
import { DepartmentModel } from '../admin/jobConfig/department.model';

export class NotificationService {
  constructor(private repo: NotificationRepository = notificationRepository) {}

  /**
   * Helper to validate recipient contact address based on channel
   */
  private validateContactForChannel(
    channel: NotificationChannel,
    email?: string,
    phone?: string,
    isTerminated?: boolean
  ): { isValid: boolean; error?: string } {
    if (isTerminated) {
      return { isValid: false, error: 'Employee account is inactive or terminated' };
    }

    switch (channel) {
      case NotificationChannel.EMAIL: {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
          return { isValid: false, error: 'Missing or invalid email address' };
        }
        return { isValid: true };
      }
      case NotificationChannel.SMS: {
        const digits = (phone || '').replace(/[^\d]/g, '');
        if (digits.length < 7 || digits.length > 15) {
          return { isValid: false, error: 'Missing or invalid phone number for SMS' };
        }
        return { isValid: true };
      }
      case NotificationChannel.WHATSAPP: {
        const digits = (phone || '').replace(/[^\d]/g, '');
        if (digits.length < 7 || digits.length > 15) {
          return { isValid: false, error: 'Missing or invalid WhatsApp phone number' };
        }
        return { isValid: true };
      }
      case NotificationChannel.EMPLOYEE_APP:
      case NotificationChannel.HUREMASO:
      default:
        return { isValid: true };
    }
  }

  /**
   * Retrieve dynamic recipients and departments with channel validation
   */
  async getRecipients(channel: NotificationChannel): Promise<{
    departments: IDepartmentItem[];
    employees: IRecipientItem[];
    summary: { totalEmployees: number; validCount: number; invalidCount: number };
  }> {
    // 1. Fetch active employees
    const employees = await EmployeeModel.find({ isTerminated: { $ne: true } })
      .select('employeeId firstName lastName name email phone department')
      .sort({ name: 1 })
      .exec();

    // 2. Fetch or compute departments
    const dbDepts = await DepartmentModel.find({}).sort({ name: 1 }).exec();
    const deptMap = new Map<string, IDepartmentItem>();

    // Seed from DepartmentModel
    for (const d of dbDepts) {
      deptMap.set(d.name.toLowerCase(), {
        id: (d._id as any).toString(),
        name: d.name,
        code: d.code || d.name.substring(0, 4).toUpperCase(),
        employeeCount: 0,
      });
    }

    // Process employees and update department counts
    let validCount = 0;
    let invalidCount = 0;

    const recipientEmployees: IRecipientItem[] = employees.map((emp) => {
      const deptName = emp.department || 'General';
      const deptKey = deptName.toLowerCase();

      if (!deptMap.has(deptKey)) {
        deptMap.set(deptKey, {
          id: `DEPT-${deptName.toUpperCase().replace(/\s+/g, '_')}`,
          name: deptName,
          code: deptName.substring(0, 4).toUpperCase(),
          employeeCount: 0,
        });
      }
      const deptEntry = deptMap.get(deptKey)!;
      deptEntry.employeeCount += 1;

      const validation = this.validateContactForChannel(channel, emp.email, emp.phone, false);
      if (validation.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }

      return {
        id: (emp._id as any).toString(),
        employeeId: emp.employeeId,
        name: emp.name || `${emp.firstName} ${emp.lastName}`.trim(),
        department: deptName,
        email: emp.email,
        phone: emp.phone || '',
        isValidForChannel: validation.isValid,
        validationError: validation.error,
      };
    });

    return {
      departments: Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      employees: recipientEmployees,
      summary: {
        totalEmployees: employees.length,
        validCount,
        invalidCount,
      },
    };
  }

  /**
   * Helper to build recipient delivery roster from database for notification creation
   */
  private async buildRecipientDeliveries(
    channel: NotificationChannel,
    recipientType: RecipientType,
    departmentIds?: string[],
    employeeIds?: string[]
  ): Promise<{
    deliveries: IRecipientDelivery[];
    validCount: number;
    invalidCount: number;
    recipientsLabel: string;
  }> {
    let queryFilter: any = { isTerminated: { $ne: true } };

    if (recipientType === RecipientType.EMPLOYEES && employeeIds && employeeIds.length > 0) {
      queryFilter.$or = [
        { employeeId: { $in: employeeIds } },
        { _id: { $in: employeeIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
      ];
    } else if (recipientType === RecipientType.DEPARTMENT && departmentIds && departmentIds.length > 0) {
      // Find matching department names
      const dbDepts = await DepartmentModel.find({
        $or: [
          { _id: { $in: departmentIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
          { name: { $in: departmentIds } },
          { code: { $in: departmentIds } },
        ],
      }).exec();

      const names = [
        ...departmentIds,
        ...dbDepts.map((d) => d.name),
      ];

      queryFilter.department = { $in: names };
    }

    const matchedEmployees = await EmployeeModel.find(queryFilter)
      .select('employeeId firstName lastName name email phone department isTerminated')
      .exec();

    const deliveries: IRecipientDelivery[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const emp of matchedEmployees) {
      const fullName = emp.name || `${emp.firstName} ${emp.lastName}`.trim();
      const validation = this.validateContactForChannel(channel, emp.email, emp.phone, emp.isTerminated);

      let contactAddress = emp.email || '';
      if (channel === NotificationChannel.SMS || channel === NotificationChannel.WHATSAPP) {
        contactAddress = emp.phone || '';
      } else if (channel === NotificationChannel.EMPLOYEE_APP || channel === NotificationChannel.HUREMASO) {
        contactAddress = emp.employeeId || (emp._id as any).toString();
      }

      if (validation.isValid) {
        validCount++;
        deliveries.push({
          recipientId: emp.employeeId || (emp._id as any).toString(),
          name: fullName,
          department: emp.department || 'General',
          contactAddress,
          status: DeliveryStatus.QUEUED,
        });
      } else {
        invalidCount++;
        deliveries.push({
          recipientId: emp.employeeId || (emp._id as any).toString(),
          name: fullName,
          department: emp.department || 'General',
          contactAddress,
          status: DeliveryStatus.FAILED,
          error: validation.error || 'Recipient invalid for channel',
        });
      }
    }

    let recipientsLabel = 'All Employees';
    if (recipientType === RecipientType.EMPLOYEES) {
      recipientsLabel = `${deliveries.length} Selected Employee(s)`;
    } else if (recipientType === RecipientType.DEPARTMENT && departmentIds && departmentIds.length > 0) {
      recipientsLabel = `Department(s): ${departmentIds.join(', ')}`;
    }

    return { deliveries, validCount, invalidCount, recipientsLabel };
  }

  async createNotification(
    data: Partial<INotification>,
    user?: { id?: string; name?: string }
  ): Promise<INotificationDocument> {
    const channel = data.channel || NotificationChannel.EMAIL;
    const recipientType = data.recipientType || RecipientType.ALL_EMPLOYEES;

    // Build recipient roster if not supplied or build from criteria
    let deliveries = data.recipientDeliveries || [];
    let validCount = data.validRecipientsCount || 0;
    let invalidCount = data.invalidRecipientsCount || 0;
    let recipientsText = data.recipients;

    if (!deliveries || deliveries.length === 0) {
      const roster = await this.buildRecipientDeliveries(
        channel,
        recipientType,
        data.departmentIds,
        data.employeeIds
      );
      deliveries = roster.deliveries;
      validCount = roster.validCount;
      invalidCount = roster.invalidCount;
      if (!recipientsText || recipientsText.trim() === '') {
        recipientsText = roster.recipientsLabel;
      }
    }

    const payload: Partial<INotification> = {
      ...data,
      channel,
      recipients: recipientsText || 'All Employees',
      recipientType,
      recipientDeliveries: deliveries,
      totalRecipientsCount: deliveries.length,
      validRecipientsCount: validCount,
      invalidRecipientsCount: invalidCount,
      status: NotificationStatus.DRAFT,
      createdBy: user?.name || user?.id || data.createdBy || 'System User',
    };

    const created = await this.repo.create(payload);
    return created;
  }

  async sendNotification(id: string): Promise<INotificationDocument> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Notification with ID '${id}' not found`);
    }

    // 1. Idempotency Check BEFORE send logic: If already marked as SENT, return
    if (existing.status === NotificationStatus.SENT) {
      return existing;
    }

    if (!existing.message || existing.message.trim() === '') {
      throw AppError.badRequest('Cannot send notification without message content');
    }

    // Ensure recipientDeliveries roster is built if it was created empty
    if (!existing.recipientDeliveries || existing.recipientDeliveries.length === 0) {
      const roster = await this.buildRecipientDeliveries(
        existing.channel,
        existing.recipientType,
        existing.departmentIds,
        existing.employeeIds
      );
      existing.recipientDeliveries = roster.deliveries as any;
      existing.totalRecipientsCount = roster.deliveries.length;
      existing.validRecipientsCount = roster.validCount;
      existing.invalidRecipientsCount = roster.invalidCount;
      await existing.save();
    }

    // 2. Race-condition protection: Atomically mark status as SENT before calling provider
    const claimed = await this.repo.findAndMarkAsSent(id);
    if (!claimed) {
      const reChecked = await this.repo.findById(id);
      if (reChecked && reChecked.status === NotificationStatus.SENT) {
        return reChecked;
      }
      throw AppError.internal('Failed to update notification status');
    }

    if (!claimed.recipientDeliveries || claimed.recipientDeliveries.length === 0) {
      claimed.recipientDeliveries = existing.recipientDeliveries;
      claimed.totalRecipientsCount = existing.totalRecipientsCount;
      claimed.validRecipientsCount = existing.validRecipientsCount;
      claimed.invalidRecipientsCount = existing.invalidRecipientsCount;
    }

    try {
      // 3. Trigger provider dispatch
      const provider = providerRegistry.getProvider(claimed.channel);
      const deliveries = claimed.recipientDeliveries || [];
      const eligibleDeliveries = deliveries.filter((d) => d.status !== DeliveryStatus.FAILED);
      const sendResult = await provider.send(claimed, eligibleDeliveries);

      // 4. Update individual recipient delivery results
      if (sendResult.results && sendResult.results.length > 0) {
        const resultMap = new Map(sendResult.results.map((r: any) => [r.recipientId, r]));
        for (const delivery of deliveries) {
          const res = resultMap.get(delivery.recipientId);
          if (res) {
            delivery.status = res.status;
            delivery.error = res.error || '';
            delivery.messageId = res.messageId || '';
            delivery.sentAt = new Date();
          }
        }
      } else {
        // Fallback for providers that dispatch globally (e.g. stub or mock)
        for (const delivery of deliveries) {
          if (delivery.status !== DeliveryStatus.FAILED) {
            delivery.status = DeliveryStatus.SENT;
            delivery.sentAt = new Date();
          }
        }
      }

      claimed.sentCount = deliveries.filter(
        (d) => d.status === DeliveryStatus.SENT || d.status === DeliveryStatus.DELIVERED
      ).length;
      claimed.deliveredCount = deliveries.filter(
        (d) => d.status === DeliveryStatus.DELIVERED
      ).length;
      claimed.failedCount = deliveries.filter(
        (d) => d.status === DeliveryStatus.FAILED || d.status === DeliveryStatus.BOUNCED
      ).length;

      await claimed.save();
      return claimed;
    } catch (err) {
      // Revert status to DRAFT if provider dispatch completely fails so it can be retried
      await this.repo.updateById(id, { status: NotificationStatus.DRAFT });
      throw err;
    }
  }

  /**
   * Retry failed recipient deliveries for a notification
   */
  async retryNotification(id: string): Promise<INotificationDocument> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Notification with ID '${id}' not found`);
    }

    const deliveries = existing.recipientDeliveries || [];
    const failedDeliveries = deliveries.filter(
      (d) => d.status === DeliveryStatus.FAILED || d.status === DeliveryStatus.BOUNCED
    );

    if (failedDeliveries.length === 0) {
      return existing;
    }

    const provider = providerRegistry.getProvider(existing.channel);
    const retryResult = await provider.send(existing, failedDeliveries);

    if (retryResult.results && retryResult.results.length > 0) {
      const resultMap = new Map(retryResult.results.map((r: any) => [r.recipientId, r]));
      for (const delivery of failedDeliveries) {
        const res = resultMap.get(delivery.recipientId);
        if (res) {
          delivery.status = res.status;
          delivery.error = res.error || '';
          delivery.messageId = res.messageId || '';
          delivery.sentAt = new Date();
        }
      }
    }

    existing.retryCount = (existing.retryCount || 0) + 1;
    existing.sentCount = deliveries.filter(
      (d) => d.status === DeliveryStatus.SENT || d.status === DeliveryStatus.DELIVERED
    ).length;
    existing.deliveredCount = deliveries.filter(
      (d) => d.status === DeliveryStatus.DELIVERED
    ).length;
    existing.failedCount = deliveries.filter(
      (d) => d.status === DeliveryStatus.FAILED || d.status === DeliveryStatus.BOUNCED
    ).length;

    await existing.save();
    return existing;
  }

  async getNotificationById(id: string): Promise<INotificationDocument> {
    const notification = await this.repo.findById(id);
    if (!notification) {
      throw AppError.notFound(`Notification with ID '${id}' not found`);
    }
    return notification;
  }

  async updateNotification(id: string, updateData: Partial<INotification>): Promise<INotificationDocument> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Notification with ID '${id}' not found`);
    }

    if (existing.status === NotificationStatus.SENT) {
      throw AppError.badRequest('Cannot modify a notification that has already been sent');
    }

    if (updateData.status === NotificationStatus.SENT) {
      throw AppError.badRequest('Cannot set status to SENT via update. Use /send endpoint instead');
    }

    const payload = {
      ...updateData,
      status: NotificationStatus.DRAFT,
    };

    const updated = await this.repo.updateById(id, payload);
    if (!updated) {
      throw AppError.internal('Failed to update notification');
    }

    return updated;
  }

  async deleteNotification(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Notification with ID '${id}' not found`);
    }

    if (existing.status === NotificationStatus.SENT) {
      throw AppError.badRequest('Cannot delete a notification that has already been sent');
    }

    const deleted = await this.repo.deleteById(id);
    if (!deleted) {
      throw AppError.internal('Failed to delete notification');
    }
  }

  async getNotifications(query: INotificationQuery): Promise<IPaginatedResult<INotificationDocument>> {
    return await this.repo.findWithPagination(query);
  }

  /**
   * In-App Employee Notifications endpoints
   */
  async getEmployeeInAppNotifications(
    employeeId: string,
    email?: string,
    page = 1,
    limit = 20
  ): Promise<{ data: INotificationDocument[]; total: number; unreadCount: number }> {
    return await this.repo.findEmployeeNotifications(employeeId, email, page, limit);
  }

  async markNotificationAsRead(id: string, recipientId: string): Promise<boolean> {
    return await this.repo.markRecipientAsRead(id, recipientId);
  }

  async markAllNotificationsAsRead(recipientId: string): Promise<number> {
    return await this.repo.markAllRecipientsAsRead(recipientId);
  }
}

export const notificationService = new NotificationService();
