export interface IDashboardFilter {
  startDate?: string;
  endDate?: string;
  department?: string;
  location?: string;
  subUnit?: string;
  employeeId?: string;
}

export interface ITimeWeeklyDayMetric {
  day: string;
  shortDay: string;
  date: string;
  hours: number;
}

export interface ITimeAtWorkMetric {
  punchedIn: boolean;
  punchedAt?: string;
  statusText: string;
  todayDurationMinutes: number;
  todayFormattedTime: string;
  weekRangeLabel: string;
  weeklyHours: ITimeWeeklyDayMetric[];
}

export interface IDistributionItem {
  name: string;
  count: number;
  percentage?: number;
}

export interface IWorkforceMetrics {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  terminatedEmployees: number;
  departmentDistribution: IDistributionItem[];
  subUnitDistribution: IDistributionItem[];
  locationDistribution: IDistributionItem[];
  employmentStatusDistribution: IDistributionItem[];
}

export interface IEmployeeOnLeaveItem {
  id: string;
  employeeId: string;
  name: string;
  subUnit: string;
  department: string;
  leaveType: string;
  avatar?: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
}

export interface IAttendanceLeaveMetrics {
  todayPresents: number;
  todayAbsence: number;
  onLeaveToday: number;
  pendingLeaveRequestsCount: number;
  approvedLeaveRequestsCount: number;
  employeesOnLeaveToday: IEmployeeOnLeaveItem[];
  leaveTypeDistribution: IDistributionItem[];
}

export interface IPayrollMetrics {
  totalMonthlyPayroll: number;
  paidAmount: number;
  pendingAmount: number;
  disbursedCount: number;
  pendingCount: number;
  currency: string;
}

export interface IRecruitmentOnboardingMetrics {
  openVacanciesCount: number;
  activeCandidatesCount: number;
  candidatesToInterviewCount: number;
  onboardingCount: number;
  offboardingCount: number;
  newApplicationsCount: number;
}

export interface IPerformanceMetrics {
  pendingSelfReviewsCount: number;
  pendingAppraisalsCount: number;
  completedAppraisalsCount: number;
  averagePerformanceRating: number;
}

export interface IActionItem {
  id: string;
  title: string;
  count: number;
  module: string;
  route: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface IMyActionsMetrics {
  pendingSelfReviews: number;
  candidatesToInterview: number;
  timesheetsToApprove: number;
  pendingLeaveApprovals: number;
  pendingEmployeeRequests: number;
  pendingTasksCount: number;
  items: IActionItem[];
}

export interface IBuzzPost {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  formattedDate: string;
  content: string;
  type: string;
  title?: string;
}

export interface IRecentActivityItem {
  id: string;
  type: 'leave' | 'recruitment' | 'attendance' | 'payroll' | 'employee' | 'task' | 'general';
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  actor?: string;
  badge?: string;
}

export interface IDashboardOverviewResponse {
  timeAtWork: ITimeAtWorkMetric;
  workforce: IWorkforceMetrics;
  attendanceLeave: IAttendanceLeaveMetrics;
  payroll: IPayrollMetrics;
  recruitment: IRecruitmentOnboardingMetrics;
  performance: IPerformanceMetrics;
  myActions: IMyActionsMetrics;
  buzzPosts: IBuzzPost[];
  recentActivities: IRecentActivityItem[];
}

export interface IDashboardSummaryMetrics {
  totalEmployees: number;
  todayPresents: number;
  todayAbsence: number;
  onLeaveToday: number;
  openVacancies: number;
  pendingActionsTotal: number;
  monthlyPayrollTotal: number;
}
