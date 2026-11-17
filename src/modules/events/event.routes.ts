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
router.put('/support/:id', eventController.updateSupportEvent);
router.delete('/support/:id', eventController.deleteSupportEvent);

// Newsletters
router.get('/newsletters', eventController.getAllNewsletters);
router.post('/newsletters', eventController.createNewsletter);
router.post('/newsletters/:id/like', eventController.toggleLikeNewsletter);
router.post('/newsletters/:id/read', eventController.incrementReadsNewsletter);
router.patch('/newsletters/:id', eventController.updateNewsletter);
router.put('/newsletters/:id', eventController.updateNewsletter);
router.delete('/newsletters/:id', eventController.deleteNewsletter);

// Budgets
router.get('/budgets', eventController.getAllBudgets);
router.post('/budgets', eventController.createBudget);
router.post('/budgets/:id/expenses', eventController.addExpense);
router.patch('/budgets/:id', eventController.updateBudget);
router.put('/budgets/:id', eventController.updateBudget);
router.delete('/budgets/:id', eventController.deleteBudget);

// Event Tasks
router.post('/:id/tasks', eventController.addTask);
router.patch('/:id/tasks/:taskId', eventController.updateTask);
router.put('/:id/tasks/:taskId', eventController.updateTask);
router.delete('/:id/tasks/:taskId', eventController.deleteTask);

// Main Events CRUD
router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.patch('/:id', eventController.updateEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

export const eventRoutes = router;
export default router;
