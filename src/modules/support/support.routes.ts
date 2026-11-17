import { Router } from 'express';
import { supportController } from './support.controller';

const router = Router();

// ================= 1. DASHBOARD =================
router.get('/dashboard', supportController.getDashboardMetrics);

// ================= 2. TICKETS =================
router.get('/tickets', supportController.listTickets);
router.get('/tickets/:id', supportController.getTicketById);
router.get('/tickets/:id/history', supportController.getTicketHistory);
router.post('/tickets', supportController.createTicket);
router.put('/tickets/:id', supportController.updateTicket);
router.patch('/tickets/:id/status', supportController.updateTicketStatus);
router.post('/tickets/:id/assign', supportController.assignTicket);
router.post('/tickets/:id/comments', supportController.addTicketComment);
router.post('/tickets/:id/internal-notes', supportController.addInternalNote);
router.delete('/tickets/:id', supportController.deleteTicket);

// ================= 3. AGENTS =================
router.get('/agents', supportController.listSupportAgents);
router.post('/agents', supportController.createSupportAgent);

// ================= 4. DEMO SEED =================
router.post('/seed', supportController.seedSupportData);

// ================= 5. MAINTENANCE =================
router.get('/maintenance', supportController.listMaintenance);
router.get('/maintenance/:id', supportController.getMaintenanceById);
router.post('/maintenance', supportController.createMaintenance);
router.put('/maintenance/:id', supportController.updateMaintenance);
router.delete('/maintenance/:id', supportController.deleteMaintenance);

// ================= 4. HELP / KNOWLEDGE BASE =================
router.get('/help', supportController.listHelpArticles);
router.get('/help/:id', supportController.getHelpArticleById);
router.post('/help', supportController.createHelpArticle);
router.put('/help/:id', supportController.updateHelpArticle);
router.post('/help/:id/vote', supportController.voteHelpful);
router.delete('/help/:id', supportController.deleteHelpArticle);

// ================= 5. CONTACT INQUIRIES =================
router.get('/contact', supportController.listContactRequests);
router.post('/contact', supportController.createContactRequest);
router.patch('/contact/:id/status', supportController.updateContactStatus);
router.delete('/contact/:id', supportController.deleteContactRequest);

// ================= 6. MISCELLANEOUS REQUESTS =================
router.get('/miscellaneous/summary', supportController.getMiscellaneousSummaryCounts);
router.get('/miscellaneous/stats', supportController.getMiscellaneousSummaryCounts);
router.get('/miscellaneous', supportController.listMiscellaneousRequests);
router.get('/miscellaneous/:id', supportController.getMiscellaneousRequestById);
router.get('/miscellaneous/:id/history', supportController.getMiscellaneousAuditHistory);
router.post('/miscellaneous', supportController.createMiscellaneousRequest);
router.put('/miscellaneous/:id', supportController.updateMiscellaneousRequest);
router.patch('/miscellaneous/:id/status', supportController.updateMiscellaneousRequestStatus);
router.patch('/miscellaneous/:id/review', supportController.startReviewMiscellaneousRequest);
router.patch('/miscellaneous/:id/approve', supportController.approveMiscellaneousRequest);
router.patch('/miscellaneous/:id/reject', supportController.rejectMiscellaneousRequest);
router.patch('/miscellaneous/:id/process', supportController.processMiscellaneousRequest);
router.delete('/miscellaneous/:id', supportController.deleteMiscellaneousRequest);

// Dedicated alias endpoints for /requests or /miscellaneous-requests
router.get('/requests/summary', supportController.getMiscellaneousSummaryCounts);
router.get('/requests/stats', supportController.getMiscellaneousSummaryCounts);
router.get('/requests', supportController.listMiscellaneousRequests);
router.get('/requests/:id', supportController.getMiscellaneousRequestById);
router.get('/requests/:id/history', supportController.getMiscellaneousAuditHistory);
router.post('/requests', supportController.createMiscellaneousRequest);
router.put('/requests/:id', supportController.updateMiscellaneousRequest);
router.patch('/requests/:id/status', supportController.updateMiscellaneousRequestStatus);
router.patch('/requests/:id/review', supportController.startReviewMiscellaneousRequest);
router.patch('/requests/:id/approve', supportController.approveMiscellaneousRequest);
router.patch('/requests/:id/reject', supportController.rejectMiscellaneousRequest);
router.patch('/requests/:id/process', supportController.processMiscellaneousRequest);
router.delete('/requests/:id', supportController.deleteMiscellaneousRequest);

export const supportRoutes = router;
export default router;
