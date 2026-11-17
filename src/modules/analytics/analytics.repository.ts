import { FilterQuery } from 'mongoose';
import { EmployeeModel } from '../employee/employee.model';
import { IEmployee } from '../employee/employee.types';
import { AttendanceModel } from '../time/attendance/attendance.model';
import { IAttendanceDocument } from '../time/attendance/attendance.types';
import { TimesheetModel } from '../time/timesheet/timesheet.model';
import { OvertimeModel } from '../time/overtime/overtime.model';
import { LeaveRequestModel } from '../employee/leave/leave.model';
import { ILeaveRequest } from '../employee/leave/leave.types';
import { PayrollRecordModel } from '../payroll/record/payrollRecord.model';
import { SalaryDisbursementModel } from '../payroll/salaryDisbursement/salaryDisbursement.model';
import { FinanceRequestModel } from '../payroll/financeRequest/financeRequest.model';
import { BenefitAdvanceModel } from '../payroll/benefitAdvance/benefitAdvance.model';
import { CandidateModel } from '../recruitment/candidate/candidate.model';
import { VacancyModel } from '../recruitment/vacancy/vacancy.model';
import { JobPostingModel } from '../recruitment/jobPosting/jobPosting.model';
import { ApplicationModel } from '../recruitment/application/application.model';
import { InterviewModel } from '../recruitment/interview/interview.model';
import { OnboardingCandidateModel } from '../onboarding/candidate/onboardingCandidate.model';
import { OffboardingRecordModel } from '../offboarding/record/offboardingRecord.model';
import { PerformanceAppraisalModel } from '../performance/performanceAppraisal.model';
import { PerformanceReviewModel } from '../employee/performance/performance.model';
import {
  EmployeeAppUserModel,
  AppAnnouncementModel,
  AppEmployeeRequestModel,
  AppActivityLogModel,
} from '../employeeApp/employeeApp.model';
import {
  FinancialIncentiveModel,
  EmployeeDevelopmentModel,
  HealthWellnessModel,
  WorkplaceLifeBalanceModel,
} from '../wellness/wellness.model';
import { CompanyEventModel } from '../events/event.model';
import { NotificationModel } from '../notification/notification.model';
import { TaskModel } from '../tasks/tasks.model';
import { EmployeeRecognitionModel } from './recognition.model';
import { IReportFilterParams } from './analytics.types';

export class AnalyticsRepository {
  // ================= 1. EMPLOYEE DATA =================
  async getEmployeeReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IEmployee> = {};
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    if (params.status && params.status !== 'All') {
      if (params.status.toLowerCase() === 'terminated') {
        filter.isTerminated = true;
      } else if (params.status.toLowerCase() === 'active') {
        filter.isTerminated = { $ne: true };
      } else {
        filter.employmentStatus = params.status;
      }
    }
    if (params.category && params.category !== 'All') {
      filter.category = params.category.toLowerCase() as any;
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { employeeId: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { department: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, deptAgg, statusAgg, categoryAgg, totalActive, totalTerminated, maleCount, femaleCount] =
      await Promise.all([
        EmployeeModel.countDocuments(filter),
        EmployeeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        EmployeeModel.aggregate([
          { $match: { isTerminated: { $ne: true } } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        EmployeeModel.aggregate([
          { $match: { isTerminated: { $ne: true } } },
          { $group: { _id: '$employmentStatus', count: { $sum: 1 } } },
        ]),
        EmployeeModel.aggregate([
          { $match: { isTerminated: { $ne: true } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),
        EmployeeModel.countDocuments({ isTerminated: { $ne: true } }),
        EmployeeModel.countDocuments({ isTerminated: true }),
        EmployeeModel.countDocuments({ gender: 'Male', isTerminated: { $ne: true } }),
        EmployeeModel.countDocuments({ gender: 'Female', isTerminated: { $ne: true } }),
      ]);

    return {
      total,
      records,
      deptAgg,
      statusAgg,
      categoryAgg,
      totalActive,
      totalTerminated,
      maleCount,
      femaleCount,
    };
  }

  // ================= 2. ATTENDANCE & TIME DATA =================
  async getAttendanceReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IAttendanceDocument> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    const from = params.fromDate || params.startDate;
    const to = params.toDate || params.endDate;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    if (params.search) {
      filter.employeeName = { $regex: params.search, $options: 'i' };
    }

    const [total, records, statusAgg, dailyAgg, overtimeRecords] = await Promise.all([
      AttendanceModel.countDocuments(filter),
      AttendanceModel.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      AttendanceModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      AttendanceModel.aggregate([
        {
          $group: {
            _id: '$date',
            present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
            totalMinutes: { $sum: '$totalWorkingMinutes' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      OvertimeModel.aggregate([{ $group: { _id: null, totalHours: { $sum: '$hours' } } }]),
    ]);

    return { total, records, statusAgg, dailyAgg, overtimeRecords };
  }

  // ================= 3. LEAVE DATA =================
  async getLeaveReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ILeaveRequest> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.type && params.type !== 'All') {
      filter.leaveType = params.type;
    }
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    const from = params.fromDate || params.startDate;
    const to = params.toDate || params.endDate;
    if (from || to) {
      filter.fromDate = {};
      if (from) filter.fromDate.$gte = from;
      if (to) filter.fromDate.$lte = to;
    }
    if (params.search) {
      filter.$or = [
        { employeeName: { $regex: params.search, $options: 'i' } },
        { leaveType: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, typeAgg, statusAgg, deptAgg] = await Promise.all([
      LeaveRequestModel.countDocuments(filter),
      LeaveRequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LeaveRequestModel.aggregate([
        { $group: { _id: '$leaveType', count: { $sum: 1 }, totalDays: { $sum: '$numberOfDays' } } },
        { $sort: { count: -1 } },
      ]),
      LeaveRequestModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalDays: { $sum: '$numberOfDays' } } },
      ]),
      LeaveRequestModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, days: { $sum: '$numberOfDays' } } },
        { $sort: { days: -1 } },
      ]),
    ]);

    return { total, records, typeAgg, statusAgg, deptAgg };
  }

  // ================= 4. PAYROLL DATA =================
  async getPayrollReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.category && params.category !== 'All') {
      filter.category = params.category;
    }
    if (params.search) {
      filter.employeeName = { $regex: params.search, $options: 'i' };
    }

    const [
      total,
      records,
      deptAgg,
      statusAgg,
      disbursementAgg,
      benefitTotal,
      financeTotal,
    ] = await Promise.all([
      PayrollRecordModel.countDocuments(filter),
      PayrollRecordModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PayrollRecordModel.aggregate([
        {
          $group: {
            _id: '$department',
            totalAmount: { $sum: '$amount' },
            paidAmount: { $sum: '$paidAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),
      PayrollRecordModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }]),
      SalaryDisbursementModel.aggregate([
        {
          $group: {
            _id: '$period',
            gross: { $sum: '$grossAmount' },
            net: { $sum: '$netAmount' },
            deductions: { $sum: '$deductions' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      BenefitAdvanceModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      FinanceRequestModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    return {
      total,
      records,
      deptAgg,
      statusAgg,
      disbursementAgg,
      benefitTotal: benefitTotal[0]?.total || 0,
      financeTotal: financeTotal[0]?.total || 0,
    };
  }

  // ================= 5. RECRUITMENT DATA =================
  async getRecruitmentReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { vacancy: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [
      totalCandidates,
      records,
      statusAgg,
      sourceAgg,
      activeVacancies,
      totalApplications,
      interviewsCount,
    ] = await Promise.all([
      CandidateModel.countDocuments(filter),
      CandidateModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CandidateModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      CandidateModel.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      VacancyModel.countDocuments({ status: { $in: ['Active', 'Open', 'Published'] } }),
      ApplicationModel.countDocuments(),
      InterviewModel.countDocuments(),
    ]);

    return {
      totalCandidates,
      records,
      statusAgg,
      sourceAgg,
      activeVacancies,
      totalApplications,
      interviewsCount,
    };
  }

  // ================= 6. ONBOARDING DATA =================
  async getOnboardingReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { candidateId: { $regex: params.search, $options: 'i' } },
        { role: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, statusAgg, deptAgg] = await Promise.all([
      OnboardingCandidateModel.countDocuments(filter),
      OnboardingCandidateModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OnboardingCandidateModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      OnboardingCandidateModel.aggregate([
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    return { total, records, statusAgg, deptAgg };
  }

  // ================= 7. OFFBOARDING DATA =================
  async getOffboardingReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    if (params.search) {
      filter.$or = [
        { employeeName: { $regex: params.search, $options: 'i' } },
        { recordId: { $regex: params.search, $options: 'i' } },
        { role: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, separationAgg, statusAgg, deptAgg] = await Promise.all([
      OffboardingRecordModel.countDocuments(filter),
      OffboardingRecordModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OffboardingRecordModel.aggregate([{ $group: { _id: '$separationType', count: { $sum: 1 } } }]),
      OffboardingRecordModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      OffboardingRecordModel.aggregate([
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    return { total, records, separationAgg, statusAgg, deptAgg };
  }

  // ================= 8. PERFORMANCE DATA =================
  async getPerformanceReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    if (params.search) {
      filter.$or = [
        { employeeName: { $regex: params.search, $options: 'i' } },
        { role: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, deptAgg, statusAgg, topPerformers] = await Promise.all([
      PerformanceAppraisalModel.countDocuments(filter),
      PerformanceAppraisalModel.find(filter).sort({ 'reportsAi.overallAiScore': -1 }).skip(skip).limit(limit).lean(),
      PerformanceAppraisalModel.aggregate([
        {
          $group: {
            _id: '$department',
            avgScore: { $avg: '$reportsAi.overallAiScore' },
            count: { $sum: 1 },
          },
        },
        { $sort: { avgScore: -1 } },
      ]),
      PerformanceAppraisalModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      PerformanceAppraisalModel.find({ 'reportsAi.overallAiScore': { $gte: 4.5 } })
        .sort({ 'reportsAi.overallAiScore': -1 })
        .limit(5)
        .lean(),
    ]);

    return { total, records, deptAgg, statusAgg, topPerformers };
  }

  // ================= 9. EMPLOYEE APP DATA =================
  async getEmployeeAppReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.department && params.department !== 'All') {
      filter.department = params.department;
    }
    if (params.search) {
      filter.$or = [
        { fullName: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { appUserId: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [totalUsers, records, deviceAgg, roleAgg, statusAgg, announcementsCount, requestsCount] =
      await Promise.all([
        EmployeeAppUserModel.countDocuments(filter),
        EmployeeAppUserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        EmployeeAppUserModel.aggregate([{ $group: { _id: '$deviceType', count: { $sum: 1 } } }]),
        EmployeeAppUserModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        EmployeeAppUserModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        AppAnnouncementModel.countDocuments(),
        AppEmployeeRequestModel.countDocuments(),
      ]);

    return {
      totalUsers,
      records,
      deviceAgg,
      roleAgg,
      statusAgg,
      announcementsCount,
      requestsCount,
    };
  }

  // ================= 10. WELLNESS DATA =================
  async getWellnessReport(params: IReportFilterParams) {
    const [incentives, development, health, lifeBalance] = await Promise.all([
      FinancialIncentiveModel.find().lean(),
      EmployeeDevelopmentModel.find().lean(),
      HealthWellnessModel.find().lean(),
      WorkplaceLifeBalanceModel.find().lean(),
    ]);

    return { incentives, development, health, lifeBalance };
  }

  // ================= 11. EVENTS DATA =================
  async getEventsReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.type && params.type !== 'All') {
      filter.eventType = params.type;
    }
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { organizer: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, typeAgg, statusAgg] = await Promise.all([
      CompanyEventModel.countDocuments(filter),
      CompanyEventModel.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit).lean(),
      CompanyEventModel.aggregate([{ $group: { _id: '$eventType', count: { $sum: 1 } } }]),
      CompanyEventModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    return { total, records, typeAgg, statusAgg };
  }

  // ================= 12. NOTIFICATIONS DATA =================
  async getNotificationsReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.status = params.status;
    }
    if (params.type && params.type !== 'All') {
      filter.channel = params.type;
    }
    if (params.search) {
      filter.$or = [
        { subject: { $regex: params.search, $options: 'i' } },
        { message: { $regex: params.search, $options: 'i' } },
        { recipients: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [total, records, channelAgg, recipientAgg, statusAgg] = await Promise.all([
      NotificationModel.countDocuments(filter),
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      NotificationModel.aggregate([{ $group: { _id: '$channel', count: { $sum: 1 } } }]),
      NotificationModel.aggregate([{ $group: { _id: '$recipientType', count: { $sum: 1 } } }]),
      NotificationModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    return { total, records, channelAgg, recipientAgg, statusAgg };
  }

  // ================= 13. TOP PERFORMERS / REVIEWS =================
  async getTopPerformers() {
    const [appraisals, reviews] = await Promise.all([
      PerformanceAppraisalModel.find().sort({ 'reportsAi.overallAiScore': -1 }).limit(10).lean(),
      PerformanceReviewModel.find().sort({ score: -1 }).limit(10).lean(),
    ]);
    return { appraisals, reviews };
  }

  // ================= 14. TASKS & PRODUCTIVITY REPORT =================
  async getTasksReport(params: IReportFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<any> = {};
    if (params.status && params.status !== 'All') {
      filter.column = params.status;
    }
    if (params.category && params.category !== 'All') {
      filter.priority = params.category;
    }
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { assigneeName: { $regex: params.search, $options: 'i' } },
        { type: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [
      total,
      records,
      priorityAgg,
      statusAgg,
      completedCount,
      inProgressCount,
      scheduledCount,
      newCount,
      overdueCount,
    ] = await Promise.all([
      TaskModel.countDocuments(filter),
      TaskModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TaskModel.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      TaskModel.aggregate([{ $group: { _id: '$column', count: { $sum: 1 } } }]),
      TaskModel.countDocuments({ column: 'completed' }),
      TaskModel.countDocuments({ column: 'in-progress' }),
      TaskModel.countDocuments({ column: 'scheduled' }),
      TaskModel.countDocuments({ column: 'new-task' }),
      TaskModel.countDocuments({
        column: { $ne: 'completed' },
        dueDate: { $lt: new Date().toISOString().split('T')[0] },
      }),
    ]);

    return {
      total,
      records,
      priorityAgg,
      statusAgg,
      completedCount,
      inProgressCount,
      scheduledCount,
      newCount,
      overdueCount,
    };
  }

  // ================= 15. RECOGNITION DATA & SCORING =================
  async getRecognitionCandidates(department?: string) {
    const empFilter: any = { isTerminated: { $ne: true } };
    if (department && department !== 'All' && department !== 'All Departments') {
      empFilter.department = department;
    }

    const [employees, appraisals, taskStats, attendanceStats] = await Promise.all([
      EmployeeModel.find(empFilter).lean(),
      PerformanceAppraisalModel.find().lean(),
      TaskModel.aggregate([
        {
          $group: {
            _id: '$assigneeName',
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$column', 'completed'] }, 1, 0] },
            },
          },
        },
      ]),
      AttendanceModel.aggregate([
        {
          $group: {
            _id: '$employeeId',
            totalDays: { $sum: 1 },
            presentDays: {
              $sum: {
                $cond: [{ $in: ['$status', ['Present', 'present']] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    return { employees, appraisals, taskStats, attendanceStats };
  }

  async getApprovedRecognitions(periodType?: string) {
    const filter: any = { status: 'Approved' };
    if (periodType && periodType !== 'all') {
      filter.periodType = periodType;
    }
    return await EmployeeRecognitionModel.find(filter).sort({ awardedDate: -1, createdAt: -1 }).lean();
  }

  async getRecognitionByPeriod(periodType: string, periodLabel: string) {
    return await EmployeeRecognitionModel.findOne({ periodType, periodLabel }).lean();
  }

  async saveRecognition(data: any) {
    return await EmployeeRecognitionModel.findOneAndUpdate(
      { periodType: data.periodType, periodLabel: data.periodLabel },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
  }
}

export const analyticsRepository = new AnalyticsRepository();
