import { notificationService } from '../../notification/notification.service';
import { NotificationChannel, RecipientType, NotificationStatus } from '../../notification/notification.types';
import { EmployeeModel } from '../employee.model';
import { IMassMessagePayload, IMassMessageLog } from './massMessage.types';

export class MassMessageService {
  async getRecipients(): Promise<{ departments: string[]; employees: { name: string; dept: string }[] }> {
    const employees = await EmployeeModel.find({ isTerminated: { $ne: true } }).select('name department');
    const deptSet = new Set<string>(['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Software']);
    const empList: { name: string; dept: string }[] = [];

    employees.forEach((emp) => {
      if (emp.department) deptSet.add(emp.department);
      empList.push({ name: emp.name, dept: emp.department || 'General' });
    });

    return {
      departments: ['All Departments', ...Array.from(deptSet)],
      employees: empList.length > 0 ? empList : [
        { name: 'Karthika Balan', dept: 'IT' },
        { name: 'Sarah Jo', dept: 'Marketing' },
        { name: 'Michael', dept: 'Finance' },
        { name: 'David', dept: 'Operations' },
        { name: 'Sarah Joseph', dept: 'HR' },
      ],
    };
  }

  async sendMassMessage(payload: IMassMessagePayload): Promise<IMassMessageLog> {
    const isAllDepts = payload.departments?.includes('All Departments');
    let recipientSummary = 'All Employees';

    if (!isAllDepts && payload.departments && payload.departments.length > 0) {
      recipientSummary = `${payload.departments.join(', ')} Departments`;
    } else if (payload.employees && payload.employees.length > 0) {
      recipientSummary = `${payload.employees.length} Selected Employees`;
    }

    // Create notification record in existing notification module
    const notif = await notificationService.createNotification({
      channel: NotificationChannel.EMAIL,
      subject: payload.subject,
      message: payload.message,
      recipients: recipientSummary,
      recipientType: isAllDepts ? RecipientType.ALL_EMPLOYEES : RecipientType.DEPARTMENT,
      status: NotificationStatus.DRAFT,
    });

    let status: 'Send' | 'Draft' = 'Draft';
    if (!payload.isDraft) {
      await notificationService.sendNotification(notif.id);
      status = 'Send';
    }

    const now = new Date();
    const dateTime = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: notif.id,
      dateTime,
      message: payload.subject,
      recipients: recipientSummary,
      status,
      read: status === 'Send' ? 'All' : '-',
    };
  }

  async getHistory(): Promise<IMassMessageLog[]> {
    const notifications = await notificationService.getNotifications({ limit: 50 });
    return notifications.data.map((n) => {
      const now = n.createdAt ? new Date(n.createdAt) : new Date();
      const dateTime = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: n.id,
        dateTime,
        message: n.subject || n.message,
        recipients: n.recipients || 'All Employees',
        status: n.status === 'SENT' ? 'Send' : 'Draft',
        read: n.status === 'SENT' ? 'All' : '-',
      };
    });
  }

  async deleteHistory(id: string): Promise<void> {
    await notificationService.deleteNotification(id);
  }
}

export const massMessageService = new MassMessageService();
