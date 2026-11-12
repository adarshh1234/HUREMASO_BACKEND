import { Router } from 'express';
import { benefitAdvanceController } from './benefitAdvance.controller';

const router = Router();

router.get('/', benefitAdvanceController.getAll);
router.post('/', benefitAdvanceController.create);
router.get('/:id', benefitAdvanceController.getById);
router.patch('/:id/status', benefitAdvanceController.updateStatus);
router.delete('/:id', benefitAdvanceController.delete);

export default router;
