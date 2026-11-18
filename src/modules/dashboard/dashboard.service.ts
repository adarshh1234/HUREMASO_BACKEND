import mongoose, { FilterQuery } from 'mongoose';
import { EmployeeModel } from '../employee/employee.model';
import { IEmployee } from '../employee/employee.types';
import { AttendanceModel } from '../time/attendance/attendance.model';
import { TimesheetModel } from '../time/timesheet/timesheet.model';
import { LeaveRequestModel, LeaveTypeModel } from '../employee/leave/leave.model';
import { PayrollRecordModel } from '../payroll/record/payrollRecord.model';
import { SalaryDisbursementModel } from '../payroll/salaryDisbursement/salaryDisbursement.model';
import { CandidateModel } from '../recruitment/candidate/candidate.model';
import { VacancyModel } from '../recruitment/vacancy/vacancy.model';
import { OnboardingCandidateModel } from '../onboarding/candidate/onboardingCandidate.model';
import { OffboardingRecordModel } from '../offboarding/record/offboardingRecord.model';
import { PerformanceAppraisalModel } from '../performance/performanceAppraisal.model';
import { EmployeeRequestModel } from '../employee/requests/request.model';
import { TaskModel } from '../tasks/tasks.model';
import { NotificationModel } from '../notification/notification.model';
import { CompanyEventModel, EventsNewsletterModel } from '../events/event.model';
import { attendanceService } from '../time/attendance/attendance.service';
import { BuzzPostModel } from './buzz/buzzPost.model';
import {
  ClockInInput,
  ClockOutInput,
  CreateBuzzPostInput,
  UpdateBuzzPostInput,
} from './dashboard.validator';
import {
  IDashboardFilter,
  IDashboardOverviewResponse,
  IDashboardSummaryMetrics,
  ITimeAtWorkMetric,
  ITimeWeeklyDayMetric,
  IWorkforceMetrics,
  IAttendanceLeaveMetrics,
  IEmployeeOnLeaveItem,
  IPayrollMetrics,
  IRecruitmentOnboardingMetrics,
  IPerformanceMetrics,
  IMyActionsMetrics,
  IActionItem,
  IBuzzPost,
  IRecentActivityItem,
  IDistributionItem,
} from './dashboard.types';

function formatTimeAgo(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
}

function getWeekDateRange(baseDate = new Date()): { start: Date; end: Date; label: string; days: Date[] } {
  const current = new Date(baseDate);
  const day = current.getDay();
  // Adjust so Monday is 0, Sunday is 6
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  const sunday = days[6];
  const startMonth = monday.toLocaleString('en-US', { month: 'short' });
  const endMonth = sunday.toLocaleString('en-US', { month: 'short' });
  const label =
    startMonth === endMonth
      ? `${startMonth} ${monday.getDate()} - ${sunday.getDate()}`
      : `${startMonth} ${monday.getDate()} - ${endMonth} ${sunday.getDate()}`;

  return { start: monday, end: sunday, label, days };
}

export class DashboardService {
  // ================= 1. TIME AT WORK =================
  async getTimeAtWork(filter?: IDashboardFilter): Promise<ITimeAtWorkMetric> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const { label: weekRangeLabel, days } = getWeekDateRange(today);

    const weekDatesStr = days.map((d) => d.toISOString().split('T')[0]);

    const attendanceQuery: FilterQuery<any> = {
      date: { $in: weekDatesStr },
    };
    if (filter?.employeeId) {
      const isOid = mongoose.isValidObjectId(filter.employeeId);
      if (isOid) {
        attendanceQuery.employeeId = filter.employeeId;
      } else {
        const emp = await EmployeeModel.findOne({ employeeId: filter.employeeId }).lean().exec();
        if (emp) {
          attendanceQuery.employeeId = (emp as any)._id;
        }
      }
    }

    const attendances = await AttendanceModel.find(attendanceQuery).lean().exec();

    // Calculate daily hours for Mon-Sun
    const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fullDaysName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const weeklyHours: ITimeWeeklyDayMetric[] = days.map((d, index) => {
      const dStr = d.toISOString().split('T')[0];
      const matchingRecords = attendances.filter((a) => a.date === dStr);
      const totalMinutes = matchingRecords.reduce((sum, r) => sum + (r.totalWorkingMinutes || 0), 0);
      const hours = matchingRecords.length > 0 ? Number((totalMinutes / 60).toFixed(1)) : 0;
      return {
        day: fullDaysName[index],
        shortDay: daysName[index],
        date: dStr,
        hours,
      };
    });

    // Today's specific metrics
    const todayRecords = attendances.filter((a) => a.date === todayStr);
    const todayTotalMinutes = todayRecords.reduce((sum, r) => sum + (r.totalWorkingMinutes || 0), 0);
    const todayHours = Math.floor(todayTotalMinutes / 60);
    const todayRemainingMinutes = todayTotalMinutes % 60;
    const todayFormattedTime = `${todayHours}h ${todayRemainingMinutes}m Today`;

    // Active punch status
    let punchedIn = false;
    let punchedAt: string | undefined;

    if (todayRecords.length > 0) {
      const allPunches = todayRecords.flatMap((r) => r.punches || []);
      if (allPunches.length > 0) {
        const lastPunch = allPunches[allPunches.length - 1];
        if (lastPunch.punchInTime && !lastPunch.punchOutTime) {
          punchedIn = true;
          punchedAt = new Date(lastPunch.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    }

    // Default fallback representation if no punch events recorded today
    if (!punchedAt) {
      punchedAt = `Today at ${today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (GMT)`;
    }

    // Determine current employee identity
    let employeeName = 'Sarah Joseph';
    let employeeAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

    if (filter?.employeeId) {
      const isOid = mongoose.isValidObjectId(filter.employeeId);
      const emp = await EmployeeModel.findOne(
        isOid
          ? { $or: [{ _id: filter.employeeId }, { employeeId: filter.employeeId }] }
          : { employeeId: filter.employeeId }
      ).lean().exec();
      if (emp) {
        employeeName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || employeeName;
        if ((emp as any).profileImage) employeeAvatar = (emp as any).profileImage;
      }
    } else {
      const firstEmp = await EmployeeModel.findOne({ isTerminated: false }).lean().exec();
      if (firstEmp) {
        employeeName = firstEmp.name || `${firstEmp.firstName || ''} ${firstEmp.lastName || ''}`.trim() || employeeName;
        if ((firstEmp as any).profileImage) employeeAvatar = (firstEmp as any).profileImage;
      }
    }

    return {
      punchedIn,
      punchedAt,
      statusText: punchedIn ? 'Punched In' : 'Punched Out',
      todayDurationMinutes: todayTotalMinutes,
      todayFormattedTime,
      weekRangeLabel,
      weeklyHours,
      employeeName,
      employeeAvatar,
    };
  }

  async clockIn(dto: ClockInInput): Promise<ITimeAtWorkMetric> {
    let resolvedEmployeeId = dto.employeeId;
    if (dto.employeeId) {
      const isOid = mongoose.isValidObjectId(dto.employeeId);
      const emp = await EmployeeModel.findOne(
        isOid
          ? { $or: [{ _id: dto.employeeId }, { employeeId: dto.employeeId }] }
          : { employeeId: dto.employeeId }
      ).exec();
      if (emp) {
        resolvedEmployeeId = emp._id.toString();
      }
    }
    await attendanceService.punchIn({
      ...dto,
      employeeId: resolvedEmployeeId,
    });
    return this.getTimeAtWork({ employeeId: resolvedEmployeeId });
  }

  async clockOut(dto: ClockOutInput): Promise<ITimeAtWorkMetric> {
    let resolvedEmployeeId = dto.employeeId;
    if (dto.employeeId) {
      const isOid = mongoose.isValidObjectId(dto.employeeId);
      const emp = await EmployeeModel.findOne(
        isOid
          ? { $or: [{ _id: dto.employeeId }, { employeeId: dto.employeeId }] }
          : { employeeId: dto.employeeId }
      ).exec();
      if (emp) {
        resolvedEmployeeId = emp._id.toString();
      }
    }
    await attendanceService.punchOut({
      ...dto,
      employeeId: resolvedEmployeeId,
    });
    return this.getTimeAtWork({ employeeId: resolvedEmployeeId });
  }

  // ================= 2. WORKFORCE METRICS =================
  async getWorkforceMetrics(filter?: IDashboardFilter): Promise<IWorkforceMetrics> {
    const employeeQuery: FilterQuery<IEmployee> = {};

    if (filter?.department) {
      employeeQuery.department = new RegExp(`^${filter.department}$`, 'i');
    }
    if (filter?.location) {
      employeeQuery.location = new RegExp(`^${filter.location}$`, 'i');
    }
    if (filter?.subUnit) {
      employeeQuery.subUnit = new RegExp(`^${filter.subUnit}$`, 'i');
    }

    const employees = await EmployeeModel.find(employeeQuery).lean().exec();
    const totalEmployees = employees.length;

    const activeEmployees = employees.filter((e) => !e.isTerminated).length;
    const terminatedEmployees = employees.filter((e) => e.isTerminated).length;

    // New hires in current month
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newHiresThisMonth = employees.filter((e) => {
      const joined = (e as any).joinedDate || (e as any).createdAt;
      if (!joined) return false;
      const joinedStr = joined instanceof Date ? joined.toISOString() : String(joined);
      return joinedStr.startsWith(currentMonthPrefix);
    }).length;

    // Helper for distributions
    const getDistribution = (field: keyof IEmployee): IDistributionItem[] => {
      const map: Record<string, number> = {};
      employees.forEach((emp) => {
        const key = (emp[field] as string) || 'Unassigned';
        map[key] = (map[key] || 0) + 1;
      });

      return Object.entries(map).map(([name, count]) => ({
        name,
        count,
        percentage: totalEmployees > 0 ? Number(((count / totalEmployees) * 100).toFixed(1)) : 0,
      }));
    };

    const departmentDistribution = getDistribution('department');
    const subUnitDistribution = getDistribution('subUnit');
    const locationDistribution = getDistribution('location');
    const employmentStatusDistribution = getDistribution('employmentStatus');

    return {
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      terminatedEmployees,
      departmentDistribution,
      subUnitDistribution,
      locationDistribution,
      employmentStatusDistribution,
    };
  }

  // ================= 3. ATTENDANCE & LEAVE METRICS =================
  async getAttendanceLeaveMetrics(filter?: IDashboardFilter): Promise<IAttendanceLeaveMetrics> {
    const todayStr = new Date().toISOString().split('T')[0];

    const [employees, todayAttendances, activeLeaves, pendingLeaves, leaveTypes] = await Promise.all([
      EmployeeModel.find(filter?.department ? { department: filter.department } : {}).lean().exec(),
      AttendanceModel.find({ date: todayStr }).lean().exec(),
      LeaveRequestModel.find({
        status: 'Approved',
        fromDate: { $lte: todayStr },
        toDate: { $gte: todayStr },
      }).lean().exec(),
      LeaveRequestModel.countDocuments({ status: 'Pending' }).exec(),
      LeaveTypeModel.find().lean().exec(),
    ]);

    const totalEmployeesCount = employees.length;

    // Map employee attendance
    const attendanceMap = new Map<string, string>();
    todayAttendances.forEach((att) => {
      if (att.employeeId) attendanceMap.set(att.employeeId.toString(), att.status);
    });

    const leaveEmployeeIds = new Set(activeLeaves.map((l) => l.employeeId));

    let todayPresents = 0;
    let todayAbsence = 0;
    let onLeaveToday = activeLeaves.length;

    employees.forEach((emp) => {
      const empId = emp.employeeId || (emp as any)._id.toString();
      const attStatus = attendanceMap.get((emp as any)._id?.toString()) || emp.attendanceStatus;

      if (leaveEmployeeIds.has(empId) || attStatus === 'On Leave' || attStatus === 'On-Leave') {
        // counted in onLeaveToday
      } else if (attStatus === 'Present' || attStatus === 'Late' || attStatus === 'Half-Day') {
        todayPresents++;
      } else {
        todayAbsence++;
      }
    });

    // If attendance table is empty today, fall back to employee current attendance status
    if (todayAttendances.length === 0 && activeLeaves.length === 0) {
      todayPresents = employees.filter((e) => e.attendanceStatus === 'Present').length;
      onLeaveToday = employees.filter((e) => e.attendanceStatus === 'On-Leave' || e.attendanceStatus === 'On Leave').length;
      todayAbsence = totalEmployeesCount - (todayPresents + onLeaveToday);
      if (todayAbsence < 0) todayAbsence = 0;
    }

    // Detail list of employees on leave today
    const employeesOnLeaveToday: IEmployeeOnLeaveItem[] = activeLeaves.map((leave) => {
      const matchedEmp = employees.find((e) => e.employeeId === leave.employeeId || (e as any)._id?.toString() === leave.employeeRef?.toString());
      return {
        id: (leave as any)._id?.toString() || leave.employeeId || '',
        employeeId: leave.employeeId || '',
        name: leave.employeeName || matchedEmp?.name || 'Employee',
        subUnit: matchedEmp?.subUnit || 'General',
        department: leave.department || matchedEmp?.department || 'Operations',
        leaveType: leave.leaveType || 'General Leave',
        avatar: (matchedEmp as any)?.profileImage || (matchedEmp as any)?.avatar,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        numberOfDays: leave.numberOfDays || 1,
      };
    });

    // If activeLeaves had no records, but employees have attendanceStatus 'On-Leave', populate from employees
    if (employeesOnLeaveToday.length === 0) {
      const onLeaveEmps = employees.filter((e) => e.attendanceStatus === 'On-Leave' || e.attendanceStatus === 'On Leave');
      onLeaveEmps.forEach((emp) => {
        employeesOnLeaveToday.push({
          id: (emp as any)._id?.toString() || emp.employeeId || '',
          employeeId: emp.employeeId || '',
          name: emp.name || `${emp.firstName} ${emp.lastName}`,
          subUnit: emp.subUnit || 'Software',
          department: emp.department || 'Software',
          leaveType: 'Annual / Personal Leave',
          avatar: (emp as any)?.profileImage,
          fromDate: todayStr,
          toDate: todayStr,
          numberOfDays: 1,
        });
      });
    }

    // Leave distribution by type
    const leaveDistMap: Record<string, number> = {};
    activeLeaves.forEach((l) => {
      leaveDistMap[l.leaveType] = (leaveDistMap[l.leaveType] || 0) + 1;
    });
    if (Object.keys(leaveDistMap).length === 0 && leaveTypes.length > 0) {
      leaveTypes.forEach((lt) => {
        leaveDistMap[lt.name] = 0;
      });
    }

    const leaveTypeDistribution: IDistributionItem[] = Object.entries(leaveDistMap).map(([name, count]) => ({
      name,
      count,
    }));

    const approvedLeaveRequestsCount = await LeaveRequestModel.countDocuments({ status: 'Approved' }).exec();

    return {
      todayPresents,
      todayAbsence,
      onLeaveToday: Math.max(onLeaveToday, employeesOnLeaveToday.length),
      pendingLeaveRequestsCount: pendingLeaves,
      approvedLeaveRequestsCount,
      employeesOnLeaveToday,
      leaveTypeDistribution,
    };
  }

  // ================= 4. PAYROLL METRICS =================
  async getPayrollMetrics(filter?: IDashboardFilter): Promise<IPayrollMetrics> {
    const payrollQuery: FilterQuery<any> = {};
    if (filter?.department) {
      payrollQuery.department = new RegExp(`^${filter.department}$`, 'i');
    }

    const [payrollRecords, disbursements] = await Promise.all([
      PayrollRecordModel.find(payrollQuery).lean().exec(),
      SalaryDisbursementModel.find(payrollQuery).lean().exec(),
    ]);

    let totalMonthlyPayroll = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let disbursedCount = 0;
    let pendingCount = 0;

    if (disbursements.length > 0) {
      disbursements.forEach((d) => {
        const net = d.netAmount || 0;
        totalMonthlyPayroll += net;
        if (d.status === 'Paid') {
          paidAmount += net;
          disbursedCount++;
        } else {
          pendingAmount += net;
          pendingCount++;
        }
      });
    } else if (payrollRecords.length > 0) {
      payrollRecords.forEach((r) => {
        const amt = r.amount || 0;
        totalMonthlyPayroll += amt;
        if (r.status === 'Paid') {
          paidAmount += amt;
          disbursedCount++;
        } else {
          pendingAmount += amt;
          pendingCount++;
        }
      });
    }

    return {
      totalMonthlyPayroll: Number(totalMonthlyPayroll.toFixed(2)),
      paidAmount: Number(paidAmount.toFixed(2)),
      pendingAmount: Number(pendingAmount.toFixed(2)),
      disbursedCount,
      pendingCount,
      currency: 'USD',
    };
  }

  // ================= 5. RECRUITMENT & ONBOARDING =================
  async getRecruitmentOnboardingMetrics(filter?: IDashboardFilter): Promise<IRecruitmentOnboardingMetrics> {
    const vacancyQuery: FilterQuery<any> = { isArchived: { $ne: true } };
    const candidateQuery: FilterQuery<any> = { isArchived: { $ne: true } };

    if (filter?.department) {
      vacancyQuery.department = new RegExp(`^${filter.department}$`, 'i');
    }

    const [openVacanciesCount, activeCandidatesCount, candidatesToInterviewCount, onboardingCount, offboardingCount, newApplicationsCount] =
      await Promise.all([
        VacancyModel.countDocuments({ ...vacancyQuery, status: { $in: ['Available', 'Active'] } }).exec(),
        CandidateModel.countDocuments({ ...candidateQuery, status: { $nin: ['Rejected', 'Hired'] } }).exec(),
        CandidateModel.countDocuments({
          ...candidateQuery,
          status: { $in: ['Interview', 'Interview Scheduled', 'Screened', 'Shortlisted'] },
        }).exec(),
        OnboardingCandidateModel.countDocuments({ status: { $in: ['In Progress', 'Pending', 'Verification Pending'] } }).exec(),
        OffboardingRecordModel.countDocuments({ status: { $in: ['Initiated', 'Notice Period', 'Clearance In Progress'] } }).exec(),
        CandidateModel.countDocuments({ ...candidateQuery, status: 'Applied' }).exec(),
      ]);

    return {
      openVacanciesCount,
      activeCandidatesCount,
      candidatesToInterviewCount,
      onboardingCount,
      offboardingCount,
      newApplicationsCount,
    };
  }

  // ================= 6. PERFORMANCE METRICS =================
  async getPerformanceMetrics(filter?: IDashboardFilter): Promise<IPerformanceMetrics> {
    const appraisalQuery: FilterQuery<any> = {};
    if (filter?.department) {
      appraisalQuery.department = new RegExp(`^${filter.department}$`, 'i');
    }

    const [pendingSelfReviewsCount, pendingAppraisalsCount, completedAppraisalsCount, appraisals] = await Promise.all([
      PerformanceAppraisalModel.countDocuments({ ...appraisalQuery, status: 'Self Review Pending' }).exec(),
      PerformanceAppraisalModel.countDocuments({ ...appraisalQuery, status: 'Manager Review Pending' }).exec(),
      PerformanceAppraisalModel.countDocuments({ ...appraisalQuery, status: 'Completed' }).exec(),
      PerformanceAppraisalModel.find(appraisalQuery).select('reportsAi.overallAiScore').lean().exec(),
    ]);

    let totalScore = 0;
    let scoreCount = 0;
    appraisals.forEach((a) => {
      const score = a.reportsAi?.overallAiScore;
      if (typeof score === 'number' && score > 0) {
        totalScore += score;
        scoreCount++;
      }
    });

    const averagePerformanceRating = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(1)) : 4.8;

    return {
      pendingSelfReviewsCount,
      pendingAppraisalsCount,
      completedAppraisalsCount,
      averagePerformanceRating,
    };
  }

  // ================= 7. MY ACTIONS =================
  async getMyActions(_filter?: IDashboardFilter): Promise<IMyActionsMetrics> {
    const [pendingSelfReviews, candidatesToInterview, timesheetsToApprove, pendingLeaveApprovals, pendingEmployeeRequests, pendingTasksCount] =
      await Promise.all([
        PerformanceAppraisalModel.countDocuments({ status: 'Self Review Pending' }).exec(),
        CandidateModel.countDocuments({ status: { $in: ['Interview', 'Interview Scheduled'] } }).exec(),
        TimesheetModel.countDocuments({ status: 'Submitted' }).exec(),
        LeaveRequestModel.countDocuments({ status: 'Pending' }).exec(),
        EmployeeRequestModel.countDocuments({ status: 'Pending' }).exec(),
        TaskModel.countDocuments({ column: { $in: ['new-task', 'in-progress'] } }).exec(),
      ]);

    const items: IActionItem[] = [
      {
        id: 'action-self-review',
        title: `(${pendingSelfReviews || 1}) Pending Self Review`,
        count: pendingSelfReviews || 1,
        module: 'performance',
        route: '/performance',
        icon: 'CalendarClock',
        priority: 'high',
      },
      {
        id: 'action-interview',
        title: `(${candidatesToInterview || 0}) Candidates to Interview`,
        count: candidatesToInterview || 0,
        module: 'recruitment',
        route: '/recruitment',
        icon: 'UserCheck',
        priority: 'medium',
      },
      {
        id: 'action-timesheets',
        title: `(${timesheetsToApprove || 0}) Timesheets to Approve`,
        count: timesheetsToApprove || 0,
        module: 'time',
        route: '/time',
        icon: 'Users',
        priority: 'medium',
      },
    ];

    if (pendingLeaveApprovals > 0) {
      items.push({
        id: 'action-leaves',
        title: `(${pendingLeaveApprovals}) Leave Requests to Review`,
        count: pendingLeaveApprovals,
        module: 'leave',
        route: '/leave',
        icon: 'CalendarDays',
        priority: 'high',
      });
    }

    if (pendingEmployeeRequests > 0) {
      items.push({
        id: 'action-requests',
        title: `(${pendingEmployeeRequests}) Employee Requests Pending`,
        count: pendingEmployeeRequests,
        module: 'employee-requests',
        route: '/employee-requests',
        icon: 'FileText',
        priority: 'medium',
      });
    }

    return {
      pendingSelfReviews,
      candidatesToInterview,
      timesheetsToApprove,
      pendingLeaveApprovals,
      pendingEmployeeRequests,
      pendingTasksCount,
      items,
    };
  }

  // ================= 8. BUZZ POSTS & ANNOUNCEMENTS =================
  async getBuzzPosts(limit = 10): Promise<IBuzzPost[]> {
    const [userPosts, events, notifications, newsletters] = await Promise.all([
      BuzzPostModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec(),
      CompanyEventModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec(),
      NotificationModel.find({ status: { $ne: 'DRAFT' } }).sort({ createdAt: -1 }).limit(limit).lean().exec(),
      EventsNewsletterModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec(),
    ]);

    const buzzList: IBuzzPost[] = [];

    // Map user/community buzz posts
    userPosts.forEach((post) => {
      const createdDate = (post as any).createdAt ? new Date((post as any).createdAt) : new Date();
      buzzList.push({
        id: (post as any)._id?.toString(),
        author: post.author,
        avatar: post.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        date: createdDate.toISOString(),
        formattedDate: `${createdDate.toISOString().split('T')[0]} ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        content: post.content,
        type: post.type || 'post',
        title: post.title,
      });
    });

    // Map company events / announcements
    events.forEach((ev) => {
      const createdDate = (ev as any).createdAt ? new Date((ev as any).createdAt) : new Date();
      buzzList.push({
        id: (ev as any)._id?.toString(),
        author: ev.organizer || 'HR Communications Team',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        date: createdDate.toISOString(),
        formattedDate: `${createdDate.toISOString().split('T')[0]} ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        content: ev.description || ev.title,
        type: 'event',
        title: ev.title,
      });
    });

    // Map newsletters
    newsletters.forEach((nl) => {
      const createdDate = (nl as any).createdAt ? new Date((nl as any).createdAt) : new Date();
      buzzList.push({
        id: (nl as any)._id?.toString(),
        author: nl.author || 'Internal Comms',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        date: createdDate.toISOString(),
        formattedDate: `${createdDate.toISOString().split('T')[0]} ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        content: nl.summary || nl.title,
        type: 'newsletter',
        title: nl.title,
      });
    });

    // Map notifications
    notifications.forEach((notif) => {
      const createdDate = (notif as any).createdAt ? new Date((notif as any).createdAt) : new Date();
      buzzList.push({
        id: (notif as any)._id?.toString(),
        author: notif.createdBy || 'System Admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        date: createdDate.toISOString(),
        formattedDate: `${createdDate.toISOString().split('T')[0]} ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        content: notif.message,
        type: 'notification',
        title: notif.subject || 'Announcement',
      });
    });

    // Sort all buzz items by date descending
    buzzList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // If no buzz posts in DB at all, seed initial sample posts
    if (buzzList.length === 0) {
      const now = new Date();
      return [
        {
          id: 'buzz-1',
          author: 'Alexa',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          date: now.toISOString(),
          formattedDate: `${now.toISOString().split('T')[0]} 10:26 AM`,
          content: 'Hello. I am Alexa',
          type: 'post',
          title: 'Welcome Note',
        },
      ];
    }

    return buzzList.slice(0, limit);
  }

  async createBuzzPost(data: CreateBuzzPostInput): Promise<IBuzzPost> {
    const post = new BuzzPostModel({
      author: data.author,
      authorId: data.authorId,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      title: data.title,
      content: data.content,
      type: data.type || 'post',
    });
    const saved = await post.save();
    const d = saved.createdAt || new Date();
    return {
      id: saved._id.toString(),
      author: saved.author,
      avatar: saved.avatar,
      date: d.toISOString(),
      formattedDate: `${d.toISOString().split('T')[0]} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: saved.content,
      type: saved.type || 'post',
      title: saved.title,
    };
  }

  async updateBuzzPost(id: string, data: UpdateBuzzPostInput): Promise<IBuzzPost | null> {
    const updated = await BuzzPostModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
    if (!updated) return null;
    const d = (updated as any).createdAt || new Date();
    return {
      id: updated._id.toString(),
      author: updated.author,
      avatar: updated.avatar,
      date: d.toISOString(),
      formattedDate: `${d.toISOString().split('T')[0]} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: updated.content,
      type: updated.type || 'post',
      title: updated.title,
    };
  }

  async deleteBuzzPost(id: string): Promise<boolean> {
    const res = await BuzzPostModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async getSubUnitDistribution(filter?: IDashboardFilter): Promise<IDistributionItem[]> {
    const workforce = await this.getWorkforceMetrics(filter);
    return workforce.subUnitDistribution;
  }

  async getLocationDistribution(filter?: IDashboardFilter): Promise<IDistributionItem[]> {
    const workforce = await this.getWorkforceMetrics(filter);
    return workforce.locationDistribution;
  }

  async getEmployeesOnLeave(filter?: IDashboardFilter): Promise<IEmployeeOnLeaveItem[]> {
    const att = await this.getAttendanceLeaveMetrics(filter);
    return att.employeesOnLeaveToday;
  }

  // ================= 9. RECENT ACTIVITY FEED =================
  async getRecentActivities(limit = 10, type = 'all'): Promise<IRecentActivityItem[]> {
    const activities: IRecentActivityItem[] = [];

    const [recentLeaves, recentCandidates, recentRequests, recentTimesheets] = await Promise.all([
      type === 'all' || type === 'leave'
        ? LeaveRequestModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec()
        : [],
      type === 'all' || type === 'recruitment'
        ? CandidateModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec()
        : [],
      type === 'all' || type === 'employee'
        ? EmployeeRequestModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec()
        : [],
      type === 'all' || type === 'attendance'
        ? TimesheetModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec()
        : [],
    ]);

    // Format Leave activities
    recentLeaves.forEach((leave) => {
      const ts = (leave as any).createdAt || (leave as any).dateRequested || new Date();
      activities.push({
        id: `leave-${(leave as any)._id}`,
        type: 'leave',
        title: 'Leave Request',
        description: `${leave.employeeName} requested ${leave.numberOfDays || 1} day(s) of ${leave.leaveType || 'vacation'}`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        actor: leave.employeeName,
        badge: leave.status,
      });
    });

    // Format Candidate activities
    recentCandidates.forEach((cand) => {
      const ts = (cand as any).createdAt || (cand as any).dateApplied || new Date();
      activities.push({
        id: `cand-${(cand as any)._id}`,
        type: 'recruitment',
        title: 'New Job Application',
        description: `${cand.name || `${cand.firstName} ${cand.lastName}`} applied for ${cand.vacancy || 'open position'}`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        actor: cand.name,
        badge: cand.status,
      });
    });

    // Format Employee Request activities
    recentRequests.forEach((req) => {
      const ts = (req as any).createdAt || (req as any).date || new Date();
      activities.push({
        id: `req-${(req as any)._id}`,
        type: 'employee',
        title: `${req.type || 'General'} Request`,
        description: `${req.name} submitted a ${req.type} request ($${req.amount || '0.00'})`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        actor: req.name,
        badge: req.status,
      });
    });

    // Format Timesheet activities
    recentTimesheets.forEach((tsheet) => {
      const ts = (tsheet as any).createdAt || (tsheet as any).updatedAt || new Date();
      activities.push({
        id: `timesheet-${(tsheet as any)._id}`,
        type: 'attendance',
        title: 'Timesheet Submitted',
        description: `${tsheet.employeeName || 'Employee'} submitted timesheet for period ${tsheet.period || ''}`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        actor: tsheet.employeeName,
        badge: tsheet.status,
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Default fallback if database is fresh
    if (activities.length === 0) {
      const now = new Date();
      return [
        {
          id: 'activity-sample-1',
          type: 'leave',
          title: 'Leave Request',
          description: 'Michael Chen requested 3 days of vacation',
          timestamp: now.toISOString(),
          timeAgo: '4 hours ago',
          actor: 'Michael Chen',
          badge: 'Pending',
        },
        {
          id: 'activity-sample-2',
          type: 'recruitment',
          title: 'New Job Application',
          description: 'New applications received for Senior Designer position',
          timestamp: now.toISOString(),
          timeAgo: '8 hours ago',
          actor: 'Talent Acquisition',
          badge: 'Applied',
        },
      ];
    }

    return activities.slice(0, limit);
  }

  // ================= 10. COMPREHENSIVE OVERVIEW =================
  async getDashboardOverview(filter?: IDashboardFilter): Promise<IDashboardOverviewResponse> {
    const [
      timeAtWork,
      workforce,
      attendanceLeave,
      payroll,
      recruitment,
      performance,
      myActions,
      buzzPosts,
      recentActivities,
    ] = await Promise.all([
      this.getTimeAtWork(filter),
      this.getWorkforceMetrics(filter),
      this.getAttendanceLeaveMetrics(filter),
      this.getPayrollMetrics(filter),
      this.getRecruitmentOnboardingMetrics(filter),
      this.getPerformanceMetrics(filter),
      this.getMyActions(filter),
      this.getBuzzPosts(10),
      this.getRecentActivities(10),
    ]);

    return {
      timeAtWork,
      workforce,
      attendanceLeave,
      payroll,
      recruitment,
      performance,
      myActions,
      buzzPosts,
      recentActivities,
    };
  }

  // ================= 11. QUICK SUMMARY STATS =================
  async getSummaryMetrics(filter?: IDashboardFilter): Promise<IDashboardSummaryMetrics> {
    const [workforce, attendance, recruitment, actions, payroll] = await Promise.all([
      this.getWorkforceMetrics(filter),
      this.getAttendanceLeaveMetrics(filter),
      this.getRecruitmentOnboardingMetrics(filter),
      this.getMyActions(filter),
      this.getPayrollMetrics(filter),
    ]);

    const pendingActionsTotal = actions.items.reduce((sum, item) => sum + item.count, 0);

    return {
      totalEmployees: workforce.totalEmployees,
      todayPresents: attendance.todayPresents,
      todayAbsence: attendance.todayAbsence,
      onLeaveToday: attendance.onLeaveToday,
      openVacancies: recruitment.openVacanciesCount,
      pendingActionsTotal,
      monthlyPayrollTotal: payroll.totalMonthlyPayroll,
    };
  }
}

export const dashboardService = new DashboardService();
