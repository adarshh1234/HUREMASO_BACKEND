import { Router } from 'express';
import { jobPostingController } from './jobPosting.controller';

const router = Router();

router.post('/', (req, res, next) => jobPostingController.create(req, res, next));
router.get('/', (req, res, next) => jobPostingController.getAll(req, res, next));
router.get('/letgetin/active', (req, res, next) => jobPostingController.getActiveLetGetIn(req, res, next));
router.get('/letgetin/sync', (req, res, next) => jobPostingController.syncLetGetIn(req, res, next));
router.post('/post-letgetin', (req, res, next) => jobPostingController.postToLetGetIn(req, res, next));
router.get('/:id', (req, res, next) => jobPostingController.getById(req, res, next));
router.put('/:id', (req, res, next) => jobPostingController.update(req, res, next));
router.patch('/:id', (req, res, next) => jobPostingController.update(req, res, next));
router.post('/:id/publish', (req, res, next) => jobPostingController.publish(req, res, next));
router.post('/:id/unpublish', (req, res, next) => jobPostingController.unpublish(req, res, next));
router.post('/:id/close', (req, res, next) => jobPostingController.close(req, res, next));
router.delete('/:id', (req, res, next) => jobPostingController.delete(req, res, next));

export default router;
