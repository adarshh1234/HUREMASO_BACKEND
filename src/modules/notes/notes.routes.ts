import { Router } from 'express';
import { notesController } from './notes.controller';
import { validateRequest } from '../../common/middlewares/validateRequest';
import { createNoteSchema, updateNoteSchema, togglePinSchema } from './notes.validator';

const router = Router();

router.get('/', (req, res) => notesController.getAll(req, res));
router.post('/', validateRequest(createNoteSchema), (req, res) => notesController.create(req, res));

router.get('/:id', (req, res) => notesController.getById(req, res));
router.put('/:id', validateRequest(updateNoteSchema), (req, res) => notesController.update(req, res));
router.patch('/:id/pin', validateRequest(togglePinSchema), (req, res) => notesController.togglePin(req, res));
router.post('/:id/ai-summarize', (req, res) => notesController.aiSummarize(req, res));
router.delete('/:id', (req, res) => notesController.delete(req, res));

export const notesRoutes = router;
export default router;
