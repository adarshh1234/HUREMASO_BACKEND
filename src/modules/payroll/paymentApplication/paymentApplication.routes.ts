import { Router } from 'express';
import { paymentApplicationController } from './paymentApplication.controller';

const router = Router();

router.get('/', paymentApplicationController.getAll);
router.post('/', paymentApplicationController.create);
router.get('/:id', paymentApplicationController.getById);
router.patch('/:id', paymentApplicationController.update);
router.post('/:id/test-connection', paymentApplicationController.testConnection);
router.post('/:id/sync', paymentApplicationController.sync);
router.delete('/:id', paymentApplicationController.delete);

export default router;
