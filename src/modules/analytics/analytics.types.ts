export interface IReportFilterParams {
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  department?: string;
  status?: string;
  category?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  timeframe?: '7d' | '30d' | '90d' | '180d' | '1y' | 'all';
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IMetricCard {
  label: string;
  value: number | string;
  prevValue?: number | string;
  changePct?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  badge?: string;
}

export interface IChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  date?: string;
}

export interface IDistributionItem {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

// ================= REPORTS TYPES =================

export interface IEmployeeReportData {
  summary: {
    totalEmployees: number;
    activeCount: number;
    terminatedCount: number;
    retentionRate: number;
    turnoverRate: number;
    averageTenureYears: number;
    maleCount: number;
    femaleCount: number;
  };
  categoryBreakdown: Record<string, number>;
  departmentDistribution: IDistributionItem[];
  employmentStatusDistribution: IDistributionItem[];
  recentHiresCount: number;
  records: Array<{
    id: string;
    employeeId: string;
    name: string;
    email: string;
    department: string;
    jobTitle: string;
    employmentStatus: string;
    category: string;
    joinedDate?: string;
    attendanceStatus: string;
    isTerminated: boolean;
  }>;
  pagination: IPaginationMeta;
}

export interface IAttendanceTimeReportData {
  summary: {
    totalAttendanceRecords: number;
    presentCount: number;
    lateCount: number;
    halfDayCount: number;
    absentCount: number;
    onLeaveCount: number;
    averagePunctualityRate: number;
    totalWorkingHours: number;
    averageDailyHours: number;
    totalOvertimeHours: number;
  };
  dailyTrend: IChartDataPoint[];
  statusDistribution: IDistributionItem[];
  departmentAttendance: Array<{
    department: string;
    attendanceRate: number;
    lateRate: number;
    avgHours: number;
  }>;
  records: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    status: string;
    totalWorkingHours: string;
    totalWorkingMinutes: number;
    punchesCount: number;
  }>;
  pagination: IPaginationMeta;
}

export interface ILeaveReportData {
  summary: {
    totalRequests: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalDaysTaken: number;
    avgDaysPerRequest: number;
  };
  leaveTypeDistribution: IDistributionItem[];
  monthlyTrend: IChartDataPoint[];
  departmentBreakdown: Array<{
    department: string;
    daysTaken: number;
    requestsCount: number;
  }>;
  records: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    numberOfDays: number;
    status: string;
    dateRequested?: string;
  }>;
  pagination: IPaginationMeta;
}

export interface IPayrollReportData {
  summary: {
    totalPayrollRecords: number;
    totalGrossDisbursed: number;
    totalNetDisbursed: number;
    totalDeductions: number;
    paidRecordsCount: number;
    pendingRecordsCount: number;
    averageSalary: number;
    benefitAdvancesTotal: number;
    financeRequestsTotal: number;
  };
  payrollByDepartment: Array<{
    department: string;
    totalAmount: number;
    employeeCount: number;
    avgSalary: number;
  }>;
  monthlyDisbursementTrend: IChartDataPoint[];
  paymentStatusDistribution: IDistributionItem[];
  records: Array<{
    id: string;
    employeeName: string;
    employeeId?: string;
    department: string;
    period: string;
    amount: number;
    paidAmount: number;
    status: string;
    category: string;
    paymentMethod: string;
    paidAt?: string;
  }>;
  pagination: IPaginationMeta;
}

export interface IRecruitmentReportData {
  summary: {
    totalCandidates: number;
    activeVacancies: number;
    totalApplications: number;
    interviewsScheduled: number;
    offersExtended: number;
    hiredCount: number;
    rejectedCount: number;
    offerAcceptanceRate: number;
  };
  funnelStages: Array<{
    stage: string;
    count: number;
    conversionRate: number;
    conversionPct?: number;
  }>;
  sourceDistribution: IDistributionItem[];
  departmentVacancies: Array<{
    department: string;
    openVacancies: number;
    applicantCount: number;
  }>;
  records: Array<{
    id: string;
    name: string;
    email: string;
    vacancy?: string;
    status: string;
    experienceYears: number;
    source: string;
    dateApplied?: string;
  }>;
  pagination: IPaginationMeta;
}

export interface IOnboardingReportData {
  summary: {
    totalOnboarding: number;
    completedCount: number;
    inProgressCount: number;
    verificationPendingCount: number;
    completionRate: number;
    avgCompletionDays: number;
  };
  statusDistribution: IDistributionItem[];
  departmentBreakdown: Array<{
    department: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  records: Array<{
    id: string;
    candidateId: string;
    name: string;
    role: string;
    department: string;
    startDate: string;
    status: string;
    progress?: number;
  }>;
  pagination: IPaginationMeta;
}

export interface IOffboardingReportData {
  summary: {
    totalOffboarding: number;
    completedCount: number;
    noticePeriodCount: number;
    settlementPendingCount: number;
    clearanceInProgressCount: number;
    avgExitProcessingDays: number;
  };
  separationTypeDistribution: IDistributionItem[];
  departmentBreakdown: Array<{
    department: string;
    count: number;
    completed: number;
  }>;
  records: Array<{
    id: string;
    recordId: string;
    employeeName: string;
    employeeId?: string;
    role: string;
    department: string;
    exitDate: string;
    separationType: string;
    status: string;
  }>;
  pagination: IPaginationMeta;
}

export interface IPerformanceReportData {
  summary: {
    totalAppraisals: number;
    completedAppraisals: number;
    pendingReviews: number;
    averageScore: number;
    topPerformerTierCount: number;
    completionRate: number;
  };
  ratingDistribution: IDistributionItem[];
  departmentAverages: Array<{
    department: string;
    avgScore: number;
    count: number;
  }>;
  topPerformers: Array<{
    employeeName: string;
    department: string;
    role: string;
    score: number;
    tier: string;
  }>;
  records: Array<{
    id: string;
    recordId: string;
    employeeName: string;
    department: string;
    role: string;
    cycle: string;
    status: string;
    overallAiScore?: number;
  }>;
  pagination: IPaginationMeta;
}

export interface IEmployeeAppReportData {
  summary: {
    totalAppUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    pendingActivation: number;
    adoptionRate: number;
    totalAnnouncements: number;
    totalRequests: number;
  };
  deviceTypeDistribution: IDistributionItem[];
  roleDistribution: IDistributionItem[];
  requestStatusDistribution: IDistributionItem[];
  records: Array<{
    id: string;
    appUserId: string;
    fullName: string;
    email: string;
    department: string;
    role: string;
    deviceType: string;
    status: string;
    lastActiveAt?: string;
  }>;
  pagination: IPaginationMeta;
}

export interface IWellnessReportData {
  summary: {
    totalIncentivesGranted: number;
    totalBonusBudget: number;
    totalDevelopmentPrograms: number;
    completedPrograms: number;
    totalHealthClaims: number;
    approvedHealthClaimsAmount: number;
    totalFringeReimbursed: number;
    avgWellnessDaysUsed: number;
  };
  programCategoryDistribution: IDistributionItem[];
  fringeCategoryDistribution: IDistributionItem[];
  departmentWellnessEngagement: Array<{
    department: string;
    programsCount: number;
    claimsCount: number;
    avgBonusAchievement: number;
  }>;
  pagination: IPaginationMeta;
}

export interface IEventsReportData {
  summary: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalBudget: number;
    totalSpent: number;
    budgetUtilizationRate: number;
    totalAttendees: number;
  };
  eventTypeDistribution: IDistributionItem[];
  statusDistribution: IDistributionItem[];
  monthlyEventsCount: IChartDataPoint[];
  records: Array<{
    id: string;
    title: string;
    eventType: string;
    category?: string;
    startDate: string;
    venue?: string;
    locationType: string;
    status: string;
    attendeeCount: number;
  }>;
  pagination: IPaginationMeta;
}

export interface INotificationsReportData {
  summary: {
    totalNotifications: number;
    sentCount: number;
    draftCount: number;
    totalAudienceReach: number;
    activeChannelsCount: number;
  };
  channelDistribution: IDistributionItem[];
  recipientTypeDistribution: IDistributionItem[];
  statusDistribution: IDistributionItem[];
  records: Array<{
    id: string;
    channel: string;
    subject?: string;
    recipientType: string;
    recipients: string;
    status: string;
    createdAt?: string;
  }>;
  pagination: IPaginationMeta;
}

// ================= ANALYTICS TYPES =================

export interface IEmployeeOverviewAnalytics {
  metrics: {
    totalEmployees: IMetricCard;
    activeEmployees: IMetricCard;
    newHiresMonth: IMetricCard;
    turnoverRate: IMetricCard;
    retentionRate: IMetricCard;
    averageTenure: IMetricCard;
  };
  headcountTrend: IChartDataPoint[];
  departmentDistribution: IDistributionItem[];
  genderRatio: IDistributionItem[];
  employmentStatusBreakdown: IDistributionItem[];
  turnoverByDepartment: Array<{ department: string; rate: number; count: number }>;
}

export interface IAttendanceTrendsAnalytics {
  metrics: {
    attendanceRate: IMetricCard;
    punctualityRate: IMetricCard;
    averageHoursPerDay: IMetricCard;
    totalOvertimeHours: IMetricCard;
  };
  dailyAttendanceTrend: IChartDataPoint[];
  weeklyHoursTrend: IChartDataPoint[];
  departmentPunctualityRanking: Array<{
    department: string;
    punctualityRate: number;
    attendanceRate: number;
  }>;
  attendanceBreakdown: IDistributionItem[];
}

export interface ILeaveTrendsAnalytics {
  metrics: {
    totalLeaveDaysTaken: IMetricCard;
    pendingApprovalRequests: IMetricCard;
    approvedRate: IMetricCard;
    utilizationRate: IMetricCard;
  };
  monthlyLeaveVolume: IChartDataPoint[];
  leaveTypeBreakdown: IDistributionItem[];
  departmentLeaveIntensity: Array<{
    department: string;
    daysTaken: number;
    averagePerEmployee: number;
  }>;
  statusBreakdown: IDistributionItem[];
}

export interface IPayrollSummaryAnalytics {
  metrics: {
    totalPayrollSpend: IMetricCard;
    averageSalary: IMetricCard;
    totalDeductions: IMetricCard;
    benefitAdvances: IMetricCard;
  };
  monthlySpendTrend: IChartDataPoint[];
  departmentSpendBreakdown: Array<{
    department: string;
    totalCost: number;
    percentage: number;
    headcount: number;
  }>;
  salaryRanges: IDistributionItem[];
  paymentStatusSummary: IDistributionItem[];
}

export interface IRecruitmentMetricsAnalytics {
  metrics: {
    activeOpenings: IMetricCard;
    totalApplicants: IMetricCard;
    interviewsConducted: IMetricCard;
    averageTimeToHire: IMetricCard;
    offerAcceptanceRate: IMetricCard;
  };
  applicantFunnel: Array<{ stage: string; count: number; conversionPct: number }>;
  sourcingChannelEfficiency: Array<{
    source: string;
    candidatesCount: number;
    hiredCount: number;
    hireRatePct: number;
  }>;
  monthlyHiringVelocity: IChartDataPoint[];
}

export interface IPerformanceMetricsAnalytics {
  metrics: {
    averageAppraisalScore: IMetricCard;
    reviewsCompletedPct: IMetricCard;
    topPerformerRatio: IMetricCard;
    flightRiskIndex: IMetricCard;
  };
  scoreDistributionBellCurve: Array<{
    scoreRange: string;
    count: number;
    percentage: number;
  }>;
  departmentPerformanceComparison: Array<{
    department: string;
    averageScore: number;
    completionPct: number;
  }>;
  topCoreCompetencies: Array<{
    competency: string;
    averageScore: number;
    benchmark: number;
  }>;
}

export interface IEmployeeOfPeriodRecord {
  periodType: 'week' | 'month' | 'year';
  periodLabel: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  avatar?: string;
  ratingScore: number;
  punctualityScore: number;
  achievementHighlights: string[];
  keyQuote?: string;
  badge: string;
  awardedDate: string;
}

export interface IEmployeeOfPeriodAnalytics {
  employeeOfWeek: IEmployeeOfPeriodRecord | null;
  employeeOfMonth: IEmployeeOfPeriodRecord | null;
  employeeOfYear: IEmployeeOfPeriodRecord | null;
  hallOfFame: IEmployeeOfPeriodRecord[];
}

export interface IExecutiveDashboardAnalytics {
  kpiCards: {
    totalEmployees: IMetricCard;
    attendanceRate: IMetricCard;
    leaveApprovalRate: IMetricCard;
    payrollMonthlySpend: IMetricCard;
    hiringPipeline: IMetricCard;
    averagePerformance: IMetricCard;
  };
  headcountTrend: IChartDataPoint[];
  attendanceMonthlyTrend: IChartDataPoint[];
  departmentDistribution: IDistributionItem[];
  recentActivityLogs: Array<{
    module: string;
    description: string;
    timestamp: string;
    severity?: 'info' | 'success' | 'warning';
  }>;
  spotlightPerformer: IEmployeeOfPeriodRecord | null;
}
