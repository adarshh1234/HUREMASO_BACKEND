import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { validateRequest } from '../../common/middlewares/validateRequest';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  rescheduleCalendarEventSchema,
  updateCalendarEventStatusSchema,
} from './calendar.validator';

const router = Router();

// Sub-collections and Category-specific queries (MUST precede /:id)
router.get('/upcoming', (req, res) => calendarController.getUpcoming(req, res));
router.get('/meetings', (req, res) => calendarController.getMeetings(req, res));
router.get('/interviews', (req, res) => calendarController.getInterviews(req, res));
router.get('/holidays', (req, res) => calendarController.getHolidays(req, res));
router.get('/deadlines', (req, res) => calendarController.getDeadlines(req, res));

// Base collections
router.get('/', (req, res) => calendarController.getAll(req, res));
router.get('/events', (req, res) => calendarController.getAll(req, res));
router.post('/', validateRequest(createCalendarEventSchema), (req, res) => calendarController.create(req, res));
router.post('/events', validateRequest(createCalendarEventSchema), (req, res) => calendarController.create(req, res));

// Single item routes
router.get('/:id', (req, res) => calendarController.getById(req, res));
router.put('/:id', validateRequest(updateCalendarEventSchema), (req, res) => calendarController.update(req, res));
router.patch('/:id', validateRequest(updateCalendarEventSchema), (req, res) => calendarController.update(req, res));
router.patch('/:id/reschedule', validateRequest(rescheduleCalendarEventSchema), (req, res) => calendarController.reschedule(req, res));
router.patch('/:id/status', validateRequest(updateCalendarEventStatusSchema), (req, res) => calendarController.updateStatus(req, res));
router.delete('/:id', (req, res) => calendarController.delete(req, res));

export const calendarRoutes = router;
export default router;
