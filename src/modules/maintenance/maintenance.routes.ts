import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';

const router = Router();

// ================= 1. ACTIVE SUPPORT TICKETS =================
router.get('/tickets', maintenanceController.listTickets);
router.post('/tickets', maintenanceController.createTicket);
router.get('/tickets/:id', maintenanceController.getTicketById);
router.put('/tickets/:id', maintenanceController.updateTicket);
router.patch('/tickets/:id/status', maintenanceController.updateTicketStatus);
router.patch('/tickets/:id/assign', maintenanceController.assignTicket);
router.post('/tickets/:id/comments', maintenanceController.addComment);
router.get('/tickets/:id/history', maintenanceController.getTicketHistory);
router.delete('/tickets/:id', maintenanceController.deleteTicket);

// ================= 2. INFRASTRUCTURE & DIAGNOSTICS =================
router.get('/huremaso', maintenanceController.getHuremasoOverview);
router.get('/huremaso/health/server', maintenanceController.getServerHealth);
router.get('/huremaso/health/database', maintenanceController.getDatabaseHealth);
router.get('/huremaso/health/cache', maintenanceController.getCacheHealth);
router.post('/huremaso/diagnostics', maintenanceController.runSystemDiagnostics);
router.get('/huremaso/diagnostics/history', maintenanceController.getDiagnosticHistory);
router.get('/huremaso/diagnostics/:id', maintenanceController.getDiagnosticById);

// ================= 3. SCHEDULED MAINTENANCE LOGS =================
router.get('/huremaso/logs', maintenanceController.listHuremasoLogs);
router.post('/huremaso/logs', maintenanceController.createHuremasoLog);
router.get('/huremaso/logs/:id', maintenanceController.getHuremasoLogById);
router.put('/huremaso/logs/:id', maintenanceController.updateHuremasoLog);
router.patch('/huremaso/logs/:id/status', maintenanceController.updateHuremasoLogStatus);
router.patch('/huremaso/logs/:id/cancel', maintenanceController.cancelHuremasoLog);
router.delete('/huremaso/logs/:id', maintenanceController.deleteHuremasoLog);

// Aliases for /schedules
router.get('/schedules', maintenanceController.listHuremasoLogs);
router.post('/schedules', maintenanceController.createHuremasoLog);
router.get('/schedules/:id', maintenanceController.getHuremasoLogById);
router.put('/schedules/:id', maintenanceController.updateHuremasoLog);
router.patch('/schedules/:id/status', maintenanceController.updateHuremasoLogStatus);
router.patch('/schedules/:id/cancel', maintenanceController.cancelHuremasoLog);
router.delete('/schedules/:id', maintenanceController.deleteHuremasoLog);

// Root fallback to list tickets
router.get('/', maintenanceController.listTickets);

export const maintenanceRoutes = router;
export default router;