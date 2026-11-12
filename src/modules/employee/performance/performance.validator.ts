import { z } from 'zod';
import mongoose from 'mongoose';

export const mongoIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createReviewSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  reviewPeriod: z.string().min(1, 'Review period is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  reviewer: z.string().min(1, 'Reviewer is required'),
  reviewStatus: z.enum(['Approved', 'Pending', 'Reviewing']).default('Pending'),
  score: z.number().optional().default(4.5),
  feedback: z.string().optional().default(''),
});

export const updateReviewSchema = createReviewSchema.partial();

export const createTrackerSchema = z.object({
  trackerName: z.string().min(1, 'Tracker name is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().optional(),
  logs: z.array(z.string()).optional().default([]),
});
