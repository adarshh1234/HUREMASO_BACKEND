import { Router } from 'express';
import { eventController } from './event.controller';

const router = Router();

// Stats
router.get('/stats/summary', eventController.getSummaryStats);
router.get('/summary', eventController.getSummaryStats);

// Support events
router.get('/support', eventController.getAllSupportEvents);
router.post('/support', eventController.createSupportEvent);
router.patch('/support/:id', eventController.updateSupportEvent);
router.delete('/support/:id', eventController.deleteSupportEvent);

// Newsletters
router.get('/newsletters', eventController.getAllNewsletters);
router.post('/newsletters', eventController.createNewsletter);
router.patch('/newsletters/:id', eventController.updateNewsletter);
router.delete('/newsletters/:id', eventController.deleteNewsletter);

// Budgets
router.get('/budgets', eventController.getAllBudgets);
router.post('/budgets', eventController.createBudget);
router.patch('/budgets/:id', eventController.updateBudget);
router.delete('/budgets/:id', eventController.deleteBudget);

// Main Events CRUD
router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

export const eventRoutes = router;
export default router;
