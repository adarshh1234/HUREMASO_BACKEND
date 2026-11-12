import { leaveSalaryRepository, LeaveSalaryRepository } from './leaveSalary.repository';
import { CreateLeaveSalaryDTO, ILeaveSalary, ILeaveSalaryDocument, ILeaveSalaryMetrics, LeaveSalaryQueryParams, LeaveSalaryStatus } from './leaveSalary.types';
import { EmployeeModel } from '../../employee/employee.model';
import { LeaveEntitlementModel } from '../../employee/leave/leave.model';
import { NotificationService } from '../../notification/notification.service';
import { NotificationChannel, RecipientType, NotificationStatus } from '../../notification/notification.types';

export class LeaveSalaryService {
  private repository: LeaveSalaryRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = leaveSalaryRepository;
    this.notificationService = new NotificationService();
  }

  async getAllLeaveSalaries(params: LeaveSalaryQueryParams): Promise<{ items: ILeaveSalary[]; total: number }> {
    const res = await this.repository.findAll(params);
    return {
      items: res.items.map((doc) => doc.toObject() as unknown as ILeaveSalary),
      total: res.total,
    };
  }

  async getLeaveSalaryById(id: string): Promise<ILeaveSalary | null> {
    const doc = await this.repository.findById(id);
    return doc ? (doc.toObject() as unknown as ILeaveSalary) : null;
  }

  async getMetrics(): Promise<ILeaveSalaryMetrics> {
    return this.repository.getMetrics();
  }

  async calculateEncashment(employeeId?: string, daysEncashing = 0, leaveType = 'Annual Leave') {
    let employeeName = 'Employee';
    let department = 'Operations';
    const dailyRate = 125.0;
    let availableBalance = 24;

    if (employeeId) {
      const emp: any = await EmployeeModel.findById(employeeId);
      if (emp) {
        employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || employeeName;
        department = emp.department || department;
      }

      // Check leave entitlement if exists
      const ent = await LeaveEntitlementModel.findOne({
        $or: [{ employeeId }, { employeeRef: employeeId }],
        leaveType: { $regex: leaveType, $options: 'i' },
      });
      if (ent) {
        availableBalance = ent.days || availableBalance;
      }
    }

    const totalValuation = Number((daysEncashing * dailyRate).toFixed(2));

    return {
      employeeId,
      employeeName,
      department,
      leaveType,
      availableBalance,
      availableBalanceText: `${availableBalance} Days Available`,
      daysEncashing,
      daysEncashingText: `${daysEncashing} Days`,
      dailyRate,
      dailyRateText: `$${dailyRate.toFixed(2)}/day`,
      totalValuation,
      totalValuationText: `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };
  }

  async createLeaveSalary(dto: CreateLeaveSalaryDTO): Promise<ILeaveSalary> {
    let employeeName = dto.employeeName;
    let department = dto.department || 'Operations';
    const dailyRate = dto.dailyRate || 125.0;
    let availableBalance = dto.availableBalance ?? 24;

    if (dto.employeeId) {
      const emp: any = await EmployeeModel.findById(dto.employeeId);
      if (emp) {
        if (!employeeName) {
          employeeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name;
        }
        if (!dto.department) {
          department = emp.department || department;
        }
      }
      if (dto.availableBalance === undefined) {
        const ent = await LeaveEntitlementModel.findOne({
          $or: [{ employeeId: dto.employeeId }, { employeeRef: dto.employeeId }],
        });
        if (ent) {
          availableBalance = ent.days || availableBalance;
        }
      }
    }

    const totalValuation = Number((dto.daysEncashing * dailyRate).toFixed(2));

    const data: Partial<ILeaveSalaryDocument> = {
      employeeId: dto.employeeId as any,
      employeeName: employeeName || 'Employee',
      department,
      leaveType: dto.leaveType || 'Annual Leave',
      availableBalance,
      availableBalanceText: `${availableBalance} Days Available`,
      daysEncashing: dto.daysEncashing,
      daysEncashingText: `${dto.daysEncashing} Days`,
      dailyRate,
      dailyRateText: `$${dailyRate.toFixed(2)}/day`,
      totalValuation,
      totalValuationText: `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: dto.status || 'Pending',
      reason: dto.reason,
    };

    const doc = await this.repository.create(data);

    // Send notification
    try {
      await this.notificationService.createNotification({
        channel: NotificationChannel.EMPLOYEE_APP,
        recipientType: RecipientType.EMPLOYEES,
        recipients: data.employeeName || 'Employee',
        subject: 'Leave Salary Encashment Requested',
        message: `${data.employeeName} submitted an encashment request for ${dto.daysEncashing} days ($${totalValuation}).`,
        status: NotificationStatus.SENT,
      });
    } catch {
      // Non-blocking notification
    }

    return doc.toObject() as unknown as ILeaveSalary;
  }

  async updateLeaveSalary(id: string, dto: Partial<CreateLeaveSalaryDTO>): Promise<ILeaveSalary | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const daysEncashing = dto.daysEncashing ?? existing.daysEncashing;
    const dailyRate = dto.dailyRate ?? existing.dailyRate;
    const totalValuation = Number((daysEncashing * dailyRate).toFixed(2));

    const updateData: Partial<ILeaveSalaryDocument> = {
      ...dto,
      employeeId: (dto.employeeId || existing.employeeId) as any,
      daysEncashing,
      dailyRate,
      totalValuation,
      daysEncashingText: `${daysEncashing} Days`,
      dailyRateText: `$${dailyRate.toFixed(2)}/day`,
      totalValuationText: `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };

    const updated = await this.repository.update(id, updateData);
    return updated ? (updated.toObject() as unknown as ILeaveSalary) : null;
  }

  async updateStatus(id: string, status: LeaveSalaryStatus): Promise<ILeaveSalary | null> {
    const updateData: Partial<ILeaveSalaryDocument> = { status };
    if (status === 'Disbursed') {
      updateData.disbursedDate = new Date();
    }

    const updated = await this.repository.update(id, updateData);
    if (updated) {
      try {
        await this.notificationService.createNotification({
          channel: NotificationChannel.EMPLOYEE_APP,
          recipientType: RecipientType.EMPLOYEES,
          recipients: updated.employeeName,
          subject: `Leave Salary Encashment ${status}`,
          message: `Your encashment request for ${updated.daysEncashing} days has been marked as ${status}.`,
          status: NotificationStatus.SENT,
        });
      } catch {
        // Non-blocking
      }
    }
    return updated ? (updated.toObject() as unknown as ILeaveSalary) : null;
  }

  async deleteLeaveSalary(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return !!deleted;
  }
}

export const leaveSalaryService = new LeaveSalaryService();
