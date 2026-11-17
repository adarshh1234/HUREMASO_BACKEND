import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const attendeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Attendee name is required').trim(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.enum(['Accepted', 'Declined', 'Pending']).optional(),
});

export const baseCalendarEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').trim(),
  date: z.string().min(1, 'Event date is required').trim(),
  endDate: z.string().optional(),
  time: z.string().optional().default('10:00 AM - 11:00 AM'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(['Meeting', 'Interview', 'Deadline', 'Holiday', 'General', 'HR Admin']).or(z.string()).optional().default('Meeting'),
  location: z.string().optional().default('Main Office / Zoom'),
  isOnline: z.boolean().optional().default(false),
  meetingLink: z.string().optional(),
  agenda: z.string().optional(),
  attendees: z.number().nonnegative().optional().default(1),
  attendeeList: z.array(attendeeSchema).optional(),
  organizer: z.string().optional().default('HR Department'),
  organizerId: z.string().optional(),
  description: z.string().optional(),
  employeeId: objectIdSchema.optional(),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']).optional().default('Scheduled'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  department: z.string().optional(),
  assigneeName: z.string().optional(),
  assigneeId: z.string().optional(),
  // Category-specific: Interview
  candidateName: z.string().optional(),
  candidateId: z.string().optional(),
  interviewerName: z.string().optional(),
  jobPosition: z.string().optional(),
  roundName: z.string().optional(),
  interviewMode: z.enum(['Online', 'In-Person', 'Telephonic']).optional().default('Online'),
  // Category-specific: Holiday
  holidayType: z.enum(['Public', 'Company', 'Regional', 'Optional']).optional().default('Public'),
  applicableScope: z.string().optional().default('Company Wide'),
  repeatsAnnually: z.boolean().optional().default(false),
  // Category-specific: Deadline
  dueTime: z.string().optional(),
  notes: z.string().optional(),
  reminder: z.boolean().optional().default(false),
});

export const createCalendarEventSchema = baseCalendarEventSchema.refine((data) => {
  // If both startTime and endTime are provided in HH:MM format, validate order
  if (data.startTime && data.endTime) {
    const sMatch = data.startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    const eMatch = data.endTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (sMatch && eMatch && sMatch[3] === eMatch[3]) {
      const sHour = parseInt(sMatch[1], 10) % 12 + (sMatch[3]?.toUpperCase() === 'PM' ? 12 : 0);
      const eHour = parseInt(eMatch[1], 10) % 12 + (eMatch[3]?.toUpperCase() === 'PM' ? 12 : 0);
      const sMin = sHour * 60 + parseInt(sMatch[2], 10);
      const eMin = eHour * 60 + parseInt(eMatch[2], 10);
      return eMin >= sMin;
    }
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateCalendarEventSchema = baseCalendarEventSchema.partial();

export const rescheduleCalendarEventSchema = z.object({
  date: z.string().min(1, 'New date is required').trim(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  time: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCalendarEventStatusSchema = z.object({
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']),
  notes: z.string().optional(),
});
