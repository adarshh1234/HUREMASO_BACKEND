import { z } from 'zod';

// ================= 1. FLIGHT RISK VALIDATORS =================

export const createFlightRiskSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  department: z.string().min(1, 'Department is required'),
  jobTitle: z.string().optional(),
  riskLevel: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  riskScore: z.number().min(0).max(100),
  indicators: z.array(
    z.object({
      factor: z.string().min(1),
      weight: z.number().min(0).max(100),
      description: z.string().optional(),
    })
  ).optional().default([]),
  recommendedActions: z.array(z.string()).optional().default([]),
  status: z.enum(['Open', 'Mitigating', 'Resolved', 'Dismissed']).optional().default('Open'),
  notes: z.string().optional(),
});

export const updateFlightRiskSchema = createFlightRiskSchema.partial().extend({
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().optional(),
});

export const flightRiskQueryFilterSchema = z.object({
  department: z.string().optional(),
  riskLevel: z.enum(['High', 'Medium', 'Low']).optional(),
  status: z.enum(['Open', 'Mitigating', 'Resolved', 'Dismissed']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// ================= 2. SKILL GAP & DEVELOPMENT VALIDATORS =================

export const createSkillGapSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  skillName: z.string().min(1, 'Skill name is required'),
  category: z.enum(['Technical', 'Soft Skills', 'Leadership', 'Domain', 'Tools']).default('Technical'),
  targetCompetencyScore: z.number().min(0).max(100).default(85),
  currentTeamScore: z.number().min(0).max(100).default(60),
  readinessLevel: z.number().min(0).max(100).default(75),
  requiredStaffCount: z.number().min(0).default(5),
  qualifiedStaffCount: z.number().min(0).default(3),
  upskillingRecommended: z.boolean().default(true),
  notes: z.string().optional(),
});

export const updateSkillGapSchema = createSkillGapSchema.partial();

export const createDevelopmentRecommendationSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  department: z.string().min(1, 'Department is required'),
  skillName: z.string().min(1, 'Skill name is required'),
  recommendationTitle: z.string().min(1, 'Recommendation title is required'),
  recommendationType: z.enum(['Course', 'Certification', 'Mentorship', 'Project Assignment']).default('Course'),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  status: z.enum(['Suggested', 'In Progress', 'Completed', 'Deferred']).default('Suggested'),
  targetCompletionDate: z.string().optional(),
  completionProgress: z.number().min(0).max(100).optional().default(0),
  assignedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDevelopmentRecommendationSchema = createDevelopmentRecommendationSchema.partial();

// ================= 3. CONVERSATIONAL HR & CHAT VALIDATORS =================

export const sendChatMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, 'Message text is required'),
  userId: z.string().optional().default('user-1'),
  userName: z.string().optional().default('Sarah Joseph'),
  category: z.enum(['Policy', 'Leave', 'Payroll', 'Performance', 'Onboarding', 'General']).optional(),
});

// ================= 4. COMPLIANCE RECORD VALIDATORS =================

export const createComplianceRecordSchema = z.object({
  complianceCode: z.string().min(1, 'Compliance code is required'),
  title: z.string().min(1, 'Compliance title is required'),
  category: z.enum(['Statutory', 'Labor Law', 'Tax', 'Safety', 'Privacy & Data', 'Internal Policy']).default('Labor Law'),
  jurisdiction: z.string().optional().default('India & Global Entities'),
  status: z.enum(['Compliant', 'At Risk', 'Non-Compliant', 'Audit Ready']).default('Audit Ready'),
  auditScore: z.number().min(0).max(100).default(100),
  discrepanciesCount: z.number().min(0).default(0),
  nextDeadline: z.string().optional().default('Annual Recurring'),
  description: z.string().min(1, 'Description is required'),
  autoScanEnabled: z.boolean().default(true),
  affectedEmployeesCount: z.number().optional().default(0),
  remediationSteps: z.array(z.string()).optional().default([]),
});

export const updateComplianceRecordSchema = createComplianceRecordSchema.partial();

export const complianceQueryFilterSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['Compliant', 'At Risk', 'Non-Compliant', 'Audit Ready']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type CreateFlightRiskInput = z.infer<typeof createFlightRiskSchema>;
export type UpdateFlightRiskInput = z.infer<typeof updateFlightRiskSchema>;
export type CreateSkillGapInput = z.infer<typeof createSkillGapSchema>;
export type UpdateSkillGapInput = z.infer<typeof updateSkillGapSchema>;
export type CreateDevelopmentRecommendationInput = z.infer<typeof createDevelopmentRecommendationSchema>;
export type UpdateDevelopmentRecommendationInput = z.infer<typeof updateDevelopmentRecommendationSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type CreateComplianceRecordInput = z.infer<typeof createComplianceRecordSchema>;
export type UpdateComplianceRecordInput = z.infer<typeof updateComplianceRecordSchema>;
