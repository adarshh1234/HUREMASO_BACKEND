import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';

const router = Router();

// ================= 1. ACTIVE SUPPORT TICKETS =================
router.get('/tickets', maintenanceController.listTickets);
router.get('/tickets/:id', maintenanceController.getTicketById);
router.post('/tickets', maintenanceController.createTicket);
router.put('/tickets/:id', maintenanceController.updateTicket);
router.patch('/tickets/:id/status', maintenanceController.updateTicketStatus);
router.patch('/tickets/:id/assign', maintenanceController.assignTicket);
router.post('/tickets/:id/comments', maintenanceController.addComment);
router.delete('/tickets/:id', maintenanceController.deleteTicket);

// ================= 2. HUREMASO INFRASTRUCTURE =================
router.get('/huremaso', maintenanceController.getHuremasoOverview);
router.post('/huremaso/diagnostics', maintenanceController.runSystemDiagnostics);
router.get('/huremaso/logs', maintenanceController.listHuremasoLogs);
router.get('/huremaso/logs/:id', maintenanceController.getHuremasoLogById);
router.post('/huremaso/logs', maintenanceController.createHuremasoLog);
router.put('/huremaso/logs/:id', maintenanceController.updateHuremasoLog);
router.delete('/huremaso/logs/:id', maintenanceController.deleteHuremasoLog);

// Root fallback to list tickets or overview
router.get('/', maintenanceController.listTickets);

export const maintenanceRoutes = router;
export default router;
