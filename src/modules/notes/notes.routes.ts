import { Router } from 'express';
import { notesController } from './notes.controller';
import { validateRequest } from '../../common/middlewares/validateRequest';
import {
  createNoteSchema,
  updateNoteSchema,
  togglePinSchema,
  updateChecklistSchema,
  toggleChecklistItemSchema,
} from './notes.validator';

const router = Router();

// Sub-collections and utility routes (must precede /:id)
router.get('/', (req, res) => notesController.getAll(req, res));
router.get('/categories/counts', (req, res) => notesController.getCategoryCounts(req, res));
router.get('/tags/all', (req, res) => notesController.getAllTags(req, res));
router.post('/', validateRequest(createNoteSchema), (req, res) => notesController.create(req, res));

// Specific item routes
router.get('/:id', (req, res) => notesController.getById(req, res));
router.put('/:id', validateRequest(updateNoteSchema), (req, res) => notesController.update(req, res));
router.patch('/:id/pin', validateRequest(togglePinSchema), (req, res) => notesController.togglePin(req, res));
router.patch('/:id/checklist', validateRequest(updateChecklistSchema), (req, res) => notesController.updateChecklist(req, res));
router.patch('/:id/checklist/:itemId/toggle', validateRequest(toggleChecklistItemSchema), (req, res) => notesController.toggleChecklistItem(req, res));
router.post('/:id/ai-summarize', (req, res) => notesController.aiSummarize(req, res));
router.delete('/:id', (req, res) => notesController.delete(req, res));

export const notesRoutes = router;
export default router;
