import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { validateRequest } from '../../common/middlewares/validateRequest';
import { createCalendarEventSchema, updateCalendarEventSchema } from './calendar.validator';

const router = Router();

router.get('/', (req, res) => calendarController.getAll(req, res));
router.get('/events', (req, res) => calendarController.getAll(req, res));
router.post('/', validateRequest(createCalendarEventSchema), (req, res) => calendarController.create(req, res));
router.post('/events', validateRequest(createCalendarEventSchema), (req, res) => calendarController.create(req, res));

router.get('/:id', (req, res) => calendarController.getById(req, res));
router.put('/:id', validateRequest(updateCalendarEventSchema), (req, res) => calendarController.update(req, res));
router.delete('/:id', (req, res) => calendarController.delete(req, res));

export const calendarRoutes = router;
export default router;
