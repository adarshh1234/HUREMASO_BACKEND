import { Document } from 'mongoose';

// ================= 1. PREDICTIVE WORKFORCE & FLIGHT RISK =================

export type FlightRiskLevel = 'High' | 'Medium' | 'Low';
export type FlightRiskStatus = 'Open' | 'Mitigating' | 'Resolved' | 'Dismissed';

export interface IFlightRiskIndicator {
  factor: string;
  weight: number; // 0 - 100
  description?: string;
}

export interface IFlightRisk {
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle?: string;
  riskLevel: FlightRiskLevel;
  riskScore: number; // 0 - 100
  indicators: IFlightRiskIndicator[];
  recommendedActions: string[];
  status: FlightRiskStatus;
  notes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFlightRiskDocument extends IFlightRisk, Document {}

export interface IWorkforceAnalyticsSummary {
  projectedTurnoverRate: number; // percentage
  industryTurnoverBenchmark: number; // percentage
  retentionScore: number; // percentage
  workforceHealthIndex: number; // 0 - 100
  totalEmployeesEvaluated: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  departmentRiskDistribution: Record<string, { high: number; medium: number; low: number }>;
}

// ================= 2. PERFORMANCE & SKILL MANAGEMENT =================

export type SkillCategory = 'Technical' | 'Soft Skills' | 'Leadership' | 'Domain' | 'Tools';
export type DevelopmentPlanStatus = 'Suggested' | 'In Progress' | 'Completed' | 'Deferred';

export interface ISkillGap {
  department: string;
  skillName: string;
  category: SkillCategory;
  targetCompetencyScore: number; // 0 - 100
  currentTeamScore: number; // 0 - 100
  gapPercentage: number; // 0 - 100
  readinessLevel: number; // 0 - 100 percentage
  requiredStaffCount: number;
  qualifiedStaffCount: number;
  upskillingRecommended: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISkillGapDocument extends ISkillGap, Document {}

export interface IDevelopmentRecommendation {
  employeeId: string;
  employeeName: string;
  department: string;
  skillName: string;
  recommendationTitle: string;
  recommendationType: 'Course' | 'Certification' | 'Mentorship' | 'Project Assignment';
  priority: 'High' | 'Medium' | 'Low';
  status: DevelopmentPlanStatus;
  targetCompletionDate?: string;
  completionProgress?: number; // 0 - 100
  assignedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDevelopmentRecommendationDocument extends IDevelopmentRecommendation, Document {}

// ================= 3. EMPLOYEE EXPERIENCE (EX) & CONVERSATIONAL HR =================

export type ChatSender = 'user' | 'ai' | 'system';
export type QueryCategory = 'Policy' | 'Leave' | 'Payroll' | 'Performance' | 'Onboarding' | 'General';

export interface IChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
  category?: QueryCategory;
  suggestedActions?: string[];
  isDraftTemplate?: boolean;
}

export interface IAIConversation {
  conversationId: string;
  userId: string;
  userName: string;
  title: string;
  messages: IChatMessage[];
  lastActivity: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAIConversationDocument extends IAIConversation, Document {}

export interface IEmployeeSentimentMetrics {
  sentimentScore: number; // e.g. 8.6 out of 10
  sentimentRating: 'Positive' | 'Neutral' | 'Critical';
  engagementIndex: number;
  sampleResponsesCount: number;
  topDrivers: string[];
  keyRiskAreas: string[];
}

// ================= 4. AUTOMATED COMPLIANCE & BORDERLESS OPS =================

export type ComplianceStatus = 'Compliant' | 'At Risk' | 'Non-Compliant' | 'Audit Ready';
export type ComplianceCategory = 'Statutory' | 'Labor Law' | 'Tax' | 'Safety' | 'Privacy & Data' | 'Internal Policy';

export interface IComplianceRecord {
  complianceCode: string;
  title: string;
  category: ComplianceCategory;
  jurisdiction: string;
  status: ComplianceStatus;
  auditScore: number; // 0 - 100
  discrepanciesCount: number;
  lastAuditedAt: string;
  nextDeadline: string;
  description: string;
  autoScanEnabled: boolean;
  affectedEmployeesCount?: number;
  remediationSteps?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IComplianceRecordDocument extends IComplianceRecord, Document {}

export interface IComplianceScanResult {
  scanTimestamp: string;
  totalRecordsScanned: number;
  auditReadinessScore: number;
  discrepanciesFound: number;
  status: ComplianceStatus;
  summary: string;
}
