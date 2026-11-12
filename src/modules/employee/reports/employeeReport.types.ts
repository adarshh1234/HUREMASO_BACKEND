export interface IHeadcountSummary {
  totalActive: number;
  retentionRate: string;
  averageTenure: string;
  categoryBreakdown: { [key: string]: number };
}

export interface IDepartmentDistribution {
  department: string;
  count: number;
  percentage: string;
}

export interface IPredictiveAnalytics {
  flightRiskTier: string;
  lastUpdated: string;
  projectedSkillGaps: Array<{ skill: string; demandTrend: string; urgency: string }>;
}
