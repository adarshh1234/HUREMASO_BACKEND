import { Router } from 'express';
import { associationController } from './association.controller';
import { authMiddleware } from '../../common/middlewares/authMiddleware';

const router = Router();

// Apply authentication middleware across all association endpoints
router.use(authMiddleware);

// Overview & Statistics
router.get('/overview', associationController.getOverview);
router.get('/stats', associationController.getOverview);

// 1. New Association Requests Sub-routes
router.get('/requests', associationController.listRequests);
router.post('/requests', associationController.createRequest);
router.get('/requests/:id', associationController.getRequestById);
router.put('/requests/:id', associationController.updateRequest);
router.patch('/requests/:id', associationController.updateRequest);
router.patch('/requests/:id/approve', associationController.approveRequest);
router.patch('/requests/:id/accept', associationController.approveRequest);
router.patch('/requests/:id/reject', associationController.rejectRequest);
router.patch('/requests/:id/cancel', associationController.rejectRequest);
router.patch('/requests/:id/renew', associationController.renewExisting);
router.patch('/requests/:id/status', async (req, res, next) => {
  const status = req.body?.status?.toLowerCase() || req.body?.action?.toLowerCase();
  if (status === 'accepted' || status === 'approved' || status === 'accept' || status === 'approve') {
    return associationController.approveRequest(req, res, next);
  }
  return associationController.rejectRequest(req, res, next);
});

// 2. Existing Associations Sub-routes
router.get('/existing', associationController.listExisting);
router.get('/existing/:id', associationController.getExistingById);
router.put('/existing/:id', associationController.updateExisting);
router.patch('/existing/:id', associationController.updateExisting);
router.patch('/existing/:id/renew', associationController.renewExisting);
router.patch('/existing/:id/deactivate', associationController.deactivateExisting);
router.patch('/existing/:id/cancel', associationController.deactivateExisting);
router.patch('/existing/:id/terminate', associationController.deactivateExisting);
router.delete('/existing/:id', associationController.deleteAssociation);

// 3. Unified RESTful Association Endpoints
router.get('/', associationController.listAll);
router.post('/', associationController.createRequest);
router.get('/:id', associationController.getRequestById);
router.put('/:id', associationController.updateRequest);
router.delete('/:id', associationController.deleteAssociation);

export default router;
