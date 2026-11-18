import { TimesheetRepository, timesheetRepository } from './timesheet.repository';
import {
  CreateTimesheetDTO,
  TimesheetQueryParams,
  ITimesheet,
  ITimesheetRow,
} from './timesheet.types';
import { TimesheetModel } from './timesheet.model';
import { EmployeeModel } from '../../employee/employee.model';
import { AppError } from '../../../common/errors/AppError';

export function calculateHoursBetween(tIn?: string, tOut?: string): number {
  if (!tIn || !tOut) return 0;

  const parseToMinutes = (str: string): number | null => {
    const s = str.trim();
    const isPM = /pm/i.test(s);
    const isAM = /am/i.test(s);
    const cleanStr = s.replace(/am|pm/gi, '').trim();
    const parts = cleanStr.split(':');
    if (parts.length < 2) return null;
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  };

  const mIn = parseToMinutes(tIn);
  const mOut = parseToMinutes(tOut);
  if (mIn === null || mOut === null) return 0;

  let diffMinutes = mOut - mIn;
  if (diffMinutes < 0) {
    // Cross-midnight overnight shift
    diffMinutes += 24 * 60;
  }
  return Math.round((diffMinutes / 60) * 10) / 10;
}

export class TimesheetService {
  constructor(private repo: TimesheetRepository = timesheetRepository) {}

  private calculateRows(rows: ITimesheetRow[] = []): { computedRows: ITimesheetRow[]; totalPeriodHours: number } {
    let totalPeriodHours = 0;
    const computedRows = rows.map((r) => {
      const mon = Number(r.monHours) || 0;
      const tue = Number(r.tueHours) || 0;
      const wed = Number(r.wedHours) || 0;
      const thu = Number(r.thuHours) || 0;
      const fri = Number(r.friHours) || 0;
      const sat = Number(r.satHours) || 0;
      const sun = Number(r.sunHours) || 0;
      const total = mon + tue + wed + thu + fri + sat + sun;
      totalPeriodHours += total;
      return {
        ...r,
        monHours: mon,
        tueHours: tue,
        wedHours: wed,
        thuHours: thu,
        friHours: fri,
        satHours: sat,
        sunHours: sun,
        totalHours: total,
      };
    });

    return { computedRows, totalPeriodHours };
  }

  async saveTimesheet(dto: CreateTimesheetDTO): Promise<ITimesheet> {
    let employeeId = dto.employeeId;
    let employeeName = dto.employeeName || '';
    let employeeCode = dto.employeeCode || '';
    let companyName = dto.companyName || 'HUREMASO Global Technologies';
    let jobDescription = dto.jobDescription || '';
    let officeLocation = dto.officeLocation || '';

    // Auto-populate from Employee record if available
    if (employeeId) {
      const emp = await EmployeeModel.findById(employeeId);
      if (emp) {
        if (!employeeName) employeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        if (!employeeCode) employeeCode = emp.employeeId || '';
        if (!jobDescription) jobDescription = emp.jobTitle || '';
        if (!officeLocation) officeLocation = emp.location || 'Kochi';
      }
    } else if (employeeName) {
      const emp = await EmployeeModel.findOne({
        $or: [
          { name: { $regex: `^${employeeName}$`, $options: 'i' } },
          { firstName: { $regex: `^${employeeName}$`, $options: 'i' } },
        ],
      });
      if (emp) {
        employeeId = emp._id.toString();
        if (!employeeCode) employeeCode = emp.employeeId || '';
        if (!jobDescription) jobDescription = emp.jobTitle || '';
        if (!officeLocation) officeLocation = emp.location || 'Kochi';
      }
    }

    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
        if (!employeeName) employeeName = firstEmp.name || `${firstEmp.firstName || ''} ${firstEmp.lastName || ''}`.trim();
        if (!employeeCode) employeeCode = firstEmp.employeeId || '';
        if (!jobDescription) jobDescription = firstEmp.jobTitle || '';
        if (!officeLocation) officeLocation = firstEmp.location || 'Kochi';
      } else {
        employeeName = employeeName || 'Employee';
        employeeCode = employeeCode || 'EMP-001';
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const date = dto.date || todayStr;
    const periodStartDate = dto.periodStartDate || date;
    const periodEndDate = dto.periodEndDate || date;
    const period = dto.period || (periodStartDate === periodEndDate ? periodStartDate : `${periodStartDate} to ${periodEndDate}`);

    // Compute working hours from times if not directly supplied
    const timeIn = dto.timeIn || dto.loginTime || dto.checkInTime || '';
    const timeOut = dto.timeOut || dto.logoutTime || dto.checkOutTime || '';
    let calculatedFromTimes = 0;
    if (timeIn && timeOut) {
      calculatedFromTimes = calculateHoursBetween(timeIn, timeOut);
    }

    let workingHours = Number(dto.workingHours) || Number(dto.hours) || calculatedFromTimes || 8;
    const overtimeHours = dto.overtimeHours !== undefined ? Number(dto.overtimeHours) : Math.max(0, Math.round((workingHours - 8.0) * 10) / 10);

    let { computedRows, totalPeriodHours } = this.calculateRows(dto.rows || []);
    if (computedRows.length === 0) {
      totalPeriodHours = workingHours;
      computedRows = [
        {
          projectName: dto.projectName || dto.siteName || dto.location || 'General Operations',
          activity: dto.workDetails || dto.assignedField || 'Standard Shift Work',
          monHours: totalPeriodHours,
          tueHours: 0,
          wedHours: 0,
          thuHours: 0,
          friHours: 0,
          satHours: 0,
          sunHours: 0,
          totalHours: totalPeriodHours,
        },
      ];
    }

    // Check if updating existing record by id
    const targetId = dto.id || dto._id;
    let timesheet = targetId ? await this.repo.findById(targetId) : null;

    if (!timesheet) {
      timesheet = new TimesheetModel({
        employeeId,
        employeeCode,
        employeeName,
        companyName,
        jobDescription,
        workType: dto.workType || 'office',
        officeLocation,
        loginSource: dto.loginSource || (dto.workType === 'office' ? 'Mobile App Sign-in' : undefined),
        loginTime: dto.loginTime || timeIn,
        logoutTime: dto.logoutTime || timeOut,
        signInMethod: dto.signInMethod || (dto.workType === 'access_control' ? 'Biometric Sign-in' : undefined),
        gpsLocation: dto.gpsLocation || (dto.workType === 'access_control' ? '9.9312° N, 76.2673° E' : undefined),
        projectName: dto.projectName || dto.siteName,
        projectLocation: dto.projectLocation || dto.location,
        siteLocation: dto.siteLocation,
        siteName: dto.siteName || dto.projectName,
        supervisorName: dto.supervisorName,
        supervisorId: dto.supervisorId,
        timeIn,
        timeOut,
        workingHours,
        overtimeHours,
        assignedField: dto.assignedField,
        date,
        location: dto.location || dto.projectLocation || dto.officeLocation,
        workDetails: dto.workDetails,
        checkInTime: dto.checkInTime || timeIn,
        checkOutTime: dto.checkOutTime || timeOut,
        deviceSource: dto.deviceSource,
        periodStartDate,
        periodEndDate,
        period,
        rows: computedRows,
        totalPeriodHours,
        status: dto.status || 'Draft',
        actions: [
          {
            action: dto.status === 'Submitted' ? 'Submitted' : 'Created',
            performedBy: employeeName,
            comment: dto.comment || 'Timesheet entry created',
            date: new Date(),
          },
        ],
      });
    } else {
      // Update existing
      if (employeeId) timesheet.employeeId = employeeId;
      if (employeeCode) timesheet.employeeCode = employeeCode;
      if (employeeName) timesheet.employeeName = employeeName;
      if (companyName) timesheet.companyName = companyName;
      if (jobDescription) timesheet.jobDescription = jobDescription;
      if (dto.workType) timesheet.workType = dto.workType;
      if (officeLocation) timesheet.officeLocation = officeLocation;
      if (dto.loginSource) timesheet.loginSource = dto.loginSource;
      if (dto.loginTime) timesheet.loginTime = dto.loginTime;
      if (dto.logoutTime) timesheet.logoutTime = dto.logoutTime;
      if (dto.signInMethod) timesheet.signInMethod = dto.signInMethod;
      if (dto.gpsLocation) timesheet.gpsLocation = dto.gpsLocation;
      if (dto.projectName) timesheet.projectName = dto.projectName;
      if (dto.projectLocation) timesheet.projectLocation = dto.projectLocation;
      if (dto.siteLocation) timesheet.siteLocation = dto.siteLocation;
      if (dto.siteName) timesheet.siteName = dto.siteName;
      if (dto.supervisorName) timesheet.supervisorName = dto.supervisorName;
      if (dto.supervisorId) timesheet.supervisorId = dto.supervisorId;
      if (timeIn) timesheet.timeIn = timeIn;
      if (timeOut) timesheet.timeOut = timeOut;
      timesheet.workingHours = workingHours;
      timesheet.overtimeHours = overtimeHours;
      if (dto.assignedField) timesheet.assignedField = dto.assignedField;
      if (date) timesheet.date = date;
      if (dto.location) timesheet.location = dto.location;
      if (dto.workDetails) timesheet.workDetails = dto.workDetails;
      if (dto.checkInTime) timesheet.checkInTime = dto.checkInTime;
      if (dto.checkOutTime) timesheet.checkOutTime = dto.checkOutTime;
      if (dto.deviceSource) timesheet.deviceSource = dto.deviceSource;
      if (periodStartDate) timesheet.periodStartDate = periodStartDate;
      if (periodEndDate) timesheet.periodEndDate = periodEndDate;
      if (period) timesheet.period = period;
      timesheet.rows = computedRows as any;
      timesheet.totalPeriodHours = totalPeriodHours;
      if (dto.status) timesheet.status = dto.status;

      timesheet.actions.push({
        action: dto.status === 'Submitted' ? 'Submitted' : 'Updated',
        performedBy: employeeName,
        comment: dto.comment || 'Timesheet record updated',
        date: new Date(),
      });
    }

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async updateTimesheet(id: string, dto: Partial<CreateTimesheetDTO>): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    if (dto.employeeCode) timesheet.employeeCode = dto.employeeCode;
    if (dto.employeeName) timesheet.employeeName = dto.employeeName;
    if (dto.companyName) timesheet.companyName = dto.companyName;
    if (dto.jobDescription) timesheet.jobDescription = dto.jobDescription;
    if (dto.officeLocation) timesheet.officeLocation = dto.officeLocation;
    if (dto.loginSource) timesheet.loginSource = dto.loginSource;
    if (dto.loginTime) timesheet.loginTime = dto.loginTime;
    if (dto.logoutTime) timesheet.logoutTime = dto.logoutTime;
    if (dto.signInMethod) timesheet.signInMethod = dto.signInMethod;
    if (dto.gpsLocation) timesheet.gpsLocation = dto.gpsLocation;
    if (dto.projectName) timesheet.projectName = dto.projectName;
    if (dto.projectLocation) timesheet.projectLocation = dto.projectLocation;
    if (dto.siteLocation) timesheet.siteLocation = dto.siteLocation;
    if (dto.siteName) timesheet.siteName = dto.siteName;
    if (dto.supervisorName) timesheet.supervisorName = dto.supervisorName;
    if (dto.supervisorId) timesheet.supervisorId = dto.supervisorId;
    if (dto.timeIn) timesheet.timeIn = dto.timeIn;
    if (dto.timeOut) timesheet.timeOut = dto.timeOut;
    if (dto.assignedField) timesheet.assignedField = dto.assignedField;
    if (dto.date) timesheet.date = dto.date;
    if (dto.location) timesheet.location = dto.location;
    if (dto.workDetails) timesheet.workDetails = dto.workDetails;
    if (dto.checkInTime) timesheet.checkInTime = dto.checkInTime;
    if (dto.checkOutTime) timesheet.checkOutTime = dto.checkOutTime;
    if (dto.deviceSource) timesheet.deviceSource = dto.deviceSource;
    if (dto.periodStartDate) timesheet.periodStartDate = dto.periodStartDate;
    if (dto.periodEndDate) timesheet.periodEndDate = dto.periodEndDate;
    if (dto.period) timesheet.period = dto.period;

    // Working hours & overtime calculation
    const tIn = dto.timeIn || timesheet.timeIn || timesheet.loginTime || timesheet.checkInTime;
    const tOut = dto.timeOut || timesheet.timeOut || timesheet.logoutTime || timesheet.checkOutTime;
    if (dto.workingHours !== undefined || dto.hours !== undefined) {
      timesheet.workingHours = Number(dto.workingHours || dto.hours) || 0;
    } else if (tIn && tOut) {
      timesheet.workingHours = calculateHoursBetween(tIn, tOut);
    }
    if (dto.overtimeHours !== undefined) {
      timesheet.overtimeHours = Number(dto.overtimeHours) || 0;
    } else {
      timesheet.overtimeHours = Math.max(0, Math.round(((timesheet.workingHours || 0) - 8.0) * 10) / 10);
    }
    timesheet.totalPeriodHours = timesheet.workingHours || 0;

    if (dto.status) timesheet.status = dto.status;

    timesheet.actions.push({
      action: 'Updated',
      performedBy: dto.employeeName || timesheet.employeeName || 'Admin',
      comment: dto.comment || 'Timesheet record updated',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  getAccessControlStatus() {
    return {
      configured: false,
      hardwareStatus: 'disconnected',
      provider: 'Biometric Access Gateway v2.1',
      lastSync: null,
      message: 'Access-control hardware integration is currently offline / not configured.',
    };
  }

  async submitTimesheet(id: string, comment?: string): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    timesheet.status = 'Submitted';
    timesheet.actions.push({
      action: 'Submitted',
      performedBy: timesheet.employeeName || 'Employee',
      comment: comment || 'Timesheet submitted for manager approval',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async approveTimesheet(id: string, approverName = 'Manager', comment?: string): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    timesheet.status = 'Approved';
    timesheet.actions.push({
      action: 'Approved',
      performedBy: approverName,
      comment: comment || 'Timesheet approved',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async rejectTimesheet(id: string, approverName = 'Manager', comment?: string): Promise<ITimesheet> {
    const timesheet = await this.repo.findById(id);
    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    timesheet.status = 'Rejected';
    timesheet.actions.push({
      action: 'Rejected',
      performedBy: approverName,
      comment: comment || 'Timesheet rejected',
      date: new Date(),
    });

    const saved = await this.repo.save(timesheet);
    return saved.toJSON() as unknown as ITimesheet;
  }

  async getMyTimesheets(employeeId?: string, period?: string): Promise<ITimesheet[]> {
    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
      }
    }
    if (!employeeId) return [];

    const query: TimesheetQueryParams = { employeeId };
    if (period) query.period = period;

    const { items } = await this.repo.findAll(query);
    return items.map((i) => i.toJSON() as unknown as ITimesheet);
  }

  async getPendingTimesheets(params: TimesheetQueryParams = {}) {
    const query: TimesheetQueryParams = { ...params, status: 'Submitted' };
    const { items, total } = await this.repo.findAll(query);
    return {
      items: items.map((i) => i.toJSON() as unknown as ITimesheet),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getAllTimesheets(params: TimesheetQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as ITimesheet),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getTimesheetById(id: string): Promise<ITimesheet | null> {
    const doc = await this.repo.findById(id);
    return doc ? (doc.toJSON() as unknown as ITimesheet) : null;
  }

  async updateStatus(id: string, status: string, approverName = 'Manager', comment?: string): Promise<ITimesheet | null> {
    if (status === 'Approved') {
      return this.approveTimesheet(id, approverName, comment);
    } else if (status === 'Rejected') {
      return this.rejectTimesheet(id, approverName, comment);
    } else {
      const timesheet = await this.repo.findById(id);
      if (!timesheet) return null;
      timesheet.status = status as any;
      const saved = await this.repo.save(timesheet);
      return saved.toJSON() as unknown as ITimesheet;
    }
  }

  async deleteTimesheet(id: string): Promise<boolean> {
    const doc = await this.repo.findById(id);
    if (!doc) return false;
    await doc.deleteOne();
    return true;
  }
}

export const timesheetService = new TimesheetService();
