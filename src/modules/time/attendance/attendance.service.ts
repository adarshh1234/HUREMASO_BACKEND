import { AttendanceRepository, attendanceRepository } from './attendance.repository';
import {
  PunchInDTO,
  PunchOutDTO,
  AttendanceQueryParams,
  IAttendance,
  IAttendanceConfig,
} from './attendance.types';
import { AttendanceModel } from './attendance.model';
import { EmployeeModel } from '../../employee/employee.model';
import { AppError } from '../../../common/errors/AppError';

export class AttendanceService {
  constructor(private repo: AttendanceRepository = attendanceRepository) {}

  private parseDateTime(dateStr?: string, timeStr?: string): Date {
    if (!dateStr) {
      dateStr = new Date().toISOString().split('T')[0];
    }
    if (!timeStr) {
      return new Date();
    }
    // Attempt parsing 12-hour or 24-hour time
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const d = new Date(dateStr);
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
    return new Date(`${dateStr}T${timeStr}`);
  }

  async punchIn(dto: PunchInDTO): Promise<IAttendance> {
    let employeeId = dto.employeeId;
    let employeeName = 'Employee';

    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
        employeeName = firstEmp.name || `${firstEmp.firstName || ''} ${firstEmp.lastName || ''}`.trim();
      } else {
        throw new AppError('No employee found to record attendance', 404);
      }
    } else {
      const emp = await EmployeeModel.findById(employeeId);
      if (emp) {
        employeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      }
    }

    const todayDate = dto.date || new Date().toISOString().split('T')[0];
    const punchInTime = this.parseDateTime(todayDate, dto.time);

    let record = await this.repo.findByEmployeeAndDate(employeeId, todayDate);

    if (!record) {
      record = new AttendanceModel({
        employeeId,
        employeeName,
        date: todayDate,
        punches: [
          {
            punchInTime,
            punchInNote: dto.note || '',
            durationMinutes: 0,
            durationHours: '00.00',
          },
        ],
        totalWorkingMinutes: 0,
        totalWorkingHours: '00.00',
        status: 'Present',
      });
    } else {
      // Check if already punched in without punch out
      const openPunch = record.punches.find((p) => !p.punchOutTime);
      if (openPunch) {
        throw new AppError('Already punched in. Please punch out first before punching in again.', 400);
      }

      record.punches.push({
        punchInTime,
        punchInNote: dto.note || '',
        durationMinutes: 0,
        durationHours: '00.00',
      } as any);
    }

    const saved = await this.repo.save(record);
    return saved.toJSON() as unknown as IAttendance;
  }

  async punchOut(dto: PunchOutDTO): Promise<IAttendance> {
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
      } else {
        throw new AppError('No employee found', 404);
      }
    }

    const todayDate = dto.date || new Date().toISOString().split('T')[0];
    const punchOutTime = this.parseDateTime(todayDate, dto.time);

    const record = await this.repo.findByEmployeeAndDate(employeeId, todayDate);
    if (!record || record.punches.length === 0) {
      throw new AppError('No punch-in record found for today. Please punch in first.', 400);
    }

    // Find the latest punch without a punch-out time
    const openPunchIndex = record.punches.findIndex((p) => !p.punchOutTime);
    if (openPunchIndex === -1) {
      throw new AppError('No active punch-in found to punch out from.', 400);
    }

    const currentPunch = record.punches[openPunchIndex];
    if (punchOutTime < currentPunch.punchInTime) {
      throw new AppError('Punch out time cannot be earlier than punch in time.', 400);
    }

    currentPunch.punchOutTime = punchOutTime;
    currentPunch.punchOutNote = dto.note || '';

    const diffMs = punchOutTime.getTime() - currentPunch.punchInTime.getTime();
    const durationMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const durationHrs = (durationMinutes / 60).toFixed(2);
    currentPunch.durationMinutes = durationMinutes;
    currentPunch.durationHours = durationHrs;

    // Recalculate total day working minutes
    let totalMinutes = 0;
    record.punches.forEach((p) => {
      totalMinutes += p.durationMinutes || 0;
    });

    record.totalWorkingMinutes = totalMinutes;
    record.totalWorkingHours = (totalMinutes / 60).toFixed(2);

    if (totalMinutes < 240) {
      record.status = 'Half-Day';
    } else {
      record.status = 'Present';
    }

    const saved = await this.repo.save(record);
    return saved.toJSON() as unknown as IAttendance;
  }

  async getMyRecords(employeeId?: string, date?: string): Promise<IAttendance[]> {
    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
      }
    }

    if (!employeeId) return [];

    const query: AttendanceQueryParams = { employeeId };
    if (date) query.date = date;

    const { items } = await this.repo.findAll(query);
    return items.map((i) => i.toJSON() as unknown as IAttendance);
  }

  async getEmployeeRecords(params: AttendanceQueryParams) {
    const { items, total } = await this.repo.findAll(params);
    return {
      items: items.map((i) => i.toJSON() as unknown as IAttendance),
      total,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 50,
    };
  }

  async getPunchStatus(employeeId?: string): Promise<{ punchedIn: boolean; time?: string; record?: IAttendance }> {
    if (!employeeId) {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false });
      if (firstEmp) {
        employeeId = firstEmp._id.toString();
      }
    }

    const todayDate = new Date().toISOString().split('T')[0];
    if (!employeeId) {
      return { punchedIn: false };
    }

    const record = await this.repo.findByEmployeeAndDate(employeeId, todayDate);
    if (!record || !record.punches || record.punches.length === 0) {
      return { punchedIn: false };
    }

    const openPunch = record.punches.find((p) => !p.punchOutTime);
    if (openPunch) {
      const timeStr = openPunch.punchInTime
        ? new Date(openPunch.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined;
      return {
        punchedIn: true,
        time: timeStr,
        record: record.toJSON() as unknown as IAttendance,
      };
    }

    return { punchedIn: false, record: record.toJSON() as unknown as IAttendance };
  }

  async getConfig(): Promise<IAttendanceConfig> {
    return this.repo.getConfig();
  }

  async saveConfig(data: Partial<IAttendanceConfig>): Promise<IAttendanceConfig> {
    return this.repo.saveConfig(data);
  }
}

export const attendanceService = new AttendanceService();

