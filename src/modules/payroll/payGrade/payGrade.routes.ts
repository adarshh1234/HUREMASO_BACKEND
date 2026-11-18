import { Router } from 'express';
import { payGradeController } from './payGrade.controller';

const router = Router();

router.get('/', payGradeController.getAll);
router.post('/', payGradeController.create);
router.get('/:id', payGradeController.getById);
router.patch('/:id', payGradeController.update);
router.delete('/:id', payGradeController.delete);

export default router;
