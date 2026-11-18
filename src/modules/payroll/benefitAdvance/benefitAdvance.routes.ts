import { Router } from 'express';
import { benefitAdvanceController } from './benefitAdvance.controller';

const router = Router();

// Schemes routes (placed before /:id)
router.get('/schemes', benefitAdvanceController.getSchemes);
router.post('/schemes', benefitAdvanceController.createScheme);
router.patch('/schemes/:id', benefitAdvanceController.updateScheme);

// Applications routes
router.get('/', benefitAdvanceController.getAll);
router.post('/', benefitAdvanceController.create);
router.get('/:id', benefitAdvanceController.getById);
router.patch('/:id/status', benefitAdvanceController.updateStatus);
router.delete('/:id', benefitAdvanceController.delete);

export default router;
