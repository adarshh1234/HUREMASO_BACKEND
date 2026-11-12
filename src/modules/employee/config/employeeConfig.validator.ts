import { z } from 'zod';

export const updateOptionalFieldsSchema = z.object({
  nickname: z.boolean().optional(),
  smoker: z.boolean().optional(),
  family: z.boolean().optional(),
  education: z.boolean().optional(),
});

export const addCustomFieldSchema = z.object({
  name: z.string().min(1, 'Custom field name is required'),
  screen: z.string().optional().default('Personal Details'),
  type: z.string().optional().default('Text or Number'),
});

export const addReportingMethodSchema = z.object({
  name: z.string().min(1, 'Reporting method name is required'),
});

export const addTerminationReasonSchema = z.object({
  name: z.string().min(1, 'Termination reason is required'),
});

export const importEmployeesSchema = z.object({
  records: z.array(
    z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Valid email is required'),
      department: z.string().optional(),
      jobTitle: z.string().optional(),
      location: z.string().optional(),
      gender: z.string().optional(),
      dob: z.string().optional(),
    })
  ).min(1, 'At least one record is required'),
});
