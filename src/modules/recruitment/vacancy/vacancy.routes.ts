import { Router } from 'express';
import { vacancyController } from './vacancy.controller';
import { VacancyValidator } from './vacancy.validator';

const router = Router();

router.get('/', vacancyController.getAll);
router.post('/', VacancyValidator.validateCreate, vacancyController.create);
router.get('/:id', vacancyController.getById);
router.get('/:id/pipeline', vacancyController.getPipeline);
router.put('/:id', vacancyController.update);
router.patch('/:id/status', VacancyValidator.validateStatus, vacancyController.updateStatus);
router.delete('/:id', vacancyController.delete);

export default router;
