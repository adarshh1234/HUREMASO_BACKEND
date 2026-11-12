import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().optional(),
  employeeName: z.string().min(1, 'Employee name is required'),
  department: z.string().optional().default(''),
  leaveType: z.string().min(1, 'Leave type is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  comments: z.string().optional().default(''),
});

export const updateLeaveRequestStatusSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Cancelled']),
  comments: z.string().optional(),
});

export const assignLeaveSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  leaveType: z.string().min(1, 'Leave type is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  comment: z.string().optional().default(''),
});

export const addEntitlementSchema = z.object({
  targetType: z.enum(['individual', 'multiple']),
  employeeName: z.string().optional().default(''),
  leaveType: z.string().min(1, 'Leave type is required'),
  leavePeriod: z.string().min(1, 'Leave period is required'),
  entitlement: z.number().min(0.5, 'Entitlement must be greater than 0'),
});

export const leavePeriodConfigSchema = z.object({
  startMonth: z.string().optional().default('January'),
  startDate: z.union([z.string(), z.number()]).optional().transform((v) => (v !== undefined ? String(v) : '01')),
  startDay: z.union([z.string(), z.number()]).optional(),
  endMonth: z.string().optional(),
  endDay: z.union([z.string(), z.number()]).optional(),
  endDate: z.union([z.string(), z.number()]).optional().transform((v) => (v !== undefined ? String(v) : '31')),
  currentPeriod: z.string().optional().default('2026-01-01 - 2026-12-31'),
});

export const leaveTypeConfigSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  daysPerYear: z.number().optional().default(20),
});

export const workWeekConfigSchema = z.object({
  monday: z.string().optional().default('Full Day'),
  tuesday: z.string().optional().default('Full Day'),
  wednesday: z.string().optional().default('Full Day'),
  thursday: z.string().optional().default('Full Day'),
  friday: z.string().optional().default('Full Day'),
  saturday: z.string().optional().default('Non-working Day'),
  sunday: z.string().optional().default('Non-working Day'),
});

export const holidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().min(1, 'Date is required'),
  dayType: z.enum(['Full Day', 'Half Day']).default('Full Day'),
  repeatsAnnually: z.boolean().default(false),
});
