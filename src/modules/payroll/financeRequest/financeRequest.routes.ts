import { Router } from 'express';
import { financeRequestController } from './financeRequest.controller';

const router = Router();

router.get('/', financeRequestController.getAll);
router.post('/', financeRequestController.create);
router.get('/:id', financeRequestController.getById);
router.patch('/:id/status', financeRequestController.updateStatus);
router.delete('/:id', financeRequestController.delete);

export default router;
