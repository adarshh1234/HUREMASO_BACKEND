import { Router } from 'express';
import { paymentApplicationController } from './paymentApplication.controller';

const router = Router();

router.get('/', paymentApplicationController.getAll);
router.post('/', paymentApplicationController.create);
router.get('/:id', paymentApplicationController.getById);
router.put('/:id', paymentApplicationController.update);
router.patch('/:id', paymentApplicationController.update);
router.delete('/:id', paymentApplicationController.delete);

export default router;
